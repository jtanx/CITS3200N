'''All the views and view mixins to display the manager interface.'''
from __future__ import print_function
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required, user_passes_test
from django.views.generic import *
from django.http import *
from django.contrib.auth.models import User, Group
from django.contrib import messages
from django.core.urlresolvers import reverse_lazy
from django.core.management import call_command
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.views.decorators.csrf import csrf_protect

from manager.forms import *
from manager.utils import *
from manager.models import *
from api.models import *
from manager.export import *

from StringIO import StringIO 
from datetime import datetime
import gzip, os, re, operator
import tempfile

'''Mixins'''
class LoginRequiredMixin(object):
    '''Forces login for a specified view'''
    @method_decorator(login_required(login_url='manager:login'))
    def dispatch(self, request, *args, **kwargs):
        return super(LoginRequiredMixin, self).\
               dispatch(request, *args, **kwargs)
               
class CSRFProtectMixin(object):
    '''Forces CSRF protection'''
    @method_decorator(csrf_protect)
    def dispatch(self, *args, **kwargs):
        return super(CSRFProtectMixin, self).dispatch(*args, **kwargs)
               
class AdminRequiredMixin(object):
    '''Views only for admins'''
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_staff and not request.user.is_superuser:
            return redirect('manager:index')
        return super(AdminRequiredMixin, self).\
               dispatch(request, *args, **kwargs)

class MessageMixin(object):
    ''' Modification of class found at: http://goo.gl/aKvuWY'''
    def delete(self, request, *args, **kwargs):
        self.__mmi_success = True
        return super(MessageMixin, self).delete(request, *args, **kwargs)
        
    def get_error_url(self):
        if hasattr(self, 'error_url'):
            return self.error_url
        raise Http404

    def get(self, request, *args, **kwargs):
        try:
            return super(MessageMixin, self).get(request, *args, **kwargs)
        except Http404:
            if self.error_message:
                messages.error(self.request, self.error_message,
                               extra_tags="alert-warning")
            return redirect(self.get_error_url())
            
    def post(self, request, *args, **kwargs):
        try:
            ret = super(MessageMixin, self).post(request, *args, **kwargs)
            
            try:
                if self.__mmi_success:
                     messages.success(self.request, self.success_message, 
                                      extra_tags="alert-success")
            except AttributeError:
                pass
                
            return ret
        except Http404:
            if self.error_message:
                messages.error(self.request, self.error_message, 
                               extra_tags="alert-warning")
            return redirect(self.get_error_url())
    
    def success(self, message):
        messages.success(self.request, message, extra_tags="alert-success")
        
    def error(self, message):
        messages.error(self.request, message, extra_tags="alert-warning")
     
    def form_valid(self, form):
        self.__mmi_success = True
        return super(MessageMixin, self).form_valid(form)
        
class SuperMixin(LoginRequiredMixin, AdminRequiredMixin, MessageMixin):
    '''yeah'''
    pass
    
class NoGetMixin(object):
    def get_error_url(self):
        return self.error_url
    '''Do not allow the get method'''
    def get(self, request, *args, **kwargs):
        messages.error(self.request, self.error_message, 
                       extra_tags="alert-warning")
        return redirect(self.get_error_url())
        
class ModifiablePaginator(object):
    '''Allow user-set pagination level
       http://stackoverflow.com/questions/14716270/dynamic-pagination-using-generic-listview
    '''
    def get_paginate_by(self, queryset):
        """
        Paginate by specified value in querystring, or use default class property value.
        """
        val = self.request.GET.get('paginate_by', self.paginate_by)
        try:
            val = int(val)
        except ValueError:
            val = self.paginate_by
        else:
            if val < 1:
                val = self.paginate_by
        return val
        
    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(ModifiablePaginator, self).get_context_data(**kwargs)
        followon = context.get('follow_on', {})
        followon['paginate_by'] = self.get_paginate_by(None)
        context['follow_on'] = followon
        return context
        
def success(request, message):
    '''Success message (for function based views)'''
    messages.success(request, message, extra_tags="alert-success")
    
def error(request, message):
    '''Error message (for function based views)'''
    messages.error(request, message, extra_tags="alert-warning")
    
def to_idlist(raw, limiting_class):
    '''Converts a string of comma separated ids into native form'''
    if isinstance(raw, str) or isinstance(raw, unicode):
        raw = raw.split(",")
    #Prevent overflow error
    maxid = limiting_class.objects.latest('id').id
    try:
        vals = filter(lambda x: x > 0 and x <= maxid ,
                      [int(x) for x in raw if x.isdigit()])
    except ValueError:
        return []
    else:
        return vals
           
           
def filter_by_date(qs, field, start=None, end=None):
    '''Filter a queryset to between the start and end dates (inclusive). The
       start and end dates are assumed to be strings in the form DD/MM/YYYY.'''
    if start:
        try:
            start = datetime.strptime(start, '%d/%m/%Y')
        except ValueError:
            pass
        else:
            start=start.replace(tzinfo=timezone.get_current_timezone())
            qs = qs.filter(**{field + '__gte' : start})
            
    if end:
        try:
            end = datetime.strptime(end, '%d/%m/%Y')
        except ValueError:
            pass
        else:
            end=end.replace(tzinfo=timezone.get_current_timezone())
            qs = qs.filter(**{field + '__lte' : end})
    return qs
    
def get_user_by_name_or_id(query):
    '''From a string 'query' get all users that have first or last names
       containing that query (case insensitive), or else if it is a number, 
       the user with that user ID (if any).'''
    qs = User.objects.all()
    if query:
        parts = filter(None, re.split(r'\s', query))
        if parts:
            #http://stackoverflow.com/questions/4824759/django-query-using-contains-each-value-in-a-list
            qs = User.objects.filter(
                reduce(operator.or_, (Q(first_name__icontains=x) for x in parts)) |
                reduce(operator.or_, (Q(last_name__icontains=x) for x in parts))
            )
            
            #Prevent overflow error
            ids = to_idlist(parts, User)
            if ids:
                qs |= User.objects.filter(reduce(operator.or_, (Q(id=x) for x in ids)))
    return qs
                
        
           
def login_user(request):
    '''Logs in the user, based on provided credentials'''
    if request.user.is_authenticated():
        return redirect('manager:index')

    logout(request)

    context = {'nav_login' : 'active'}
    if request.POST:
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    next_location = form.cleaned_data['next_location']
                    if next_location and next_location.startswith("/"):
                        #Redirect to specified location, if given
                        return redirect(next_location)
                    return redirect('manager:index')
            else:
                form = LoginForm() #Clear the form
                context['result'] = "Invalid login details."
    else:
        form = LoginForm()
        if 'next' in request.GET:
            form.fields["next_location"].initial = request.GET['next']

    context['form'] = form
    return render(request, 'mg-login.html', context)

def logout_user(request):
    '''Logs out the user'''
    logout(request)
    return redirect('manager:index')
    
@user_passes_test(lambda u:u.is_staff, login_url='manager:login')
def backup_database(request):
    '''Backs up the databsae by exporting the 'api' application and 'User' model
       to JSON and gzipping it.'''
    content = StringIO()
    call_command('dumpdata', 'auth.user', 'api', indent=4, stdout=content)
    compressed = StringIO()
    with gzip.GzipFile(fileobj=compressed, mode='wb') as fp:
        fp.write(content.getvalue())
        
    now = datetime.now()
    filename = now.strftime('backup-%d-%m-%Y.json.gz')
    response = HttpResponse(compressed.getvalue(), content_type='application/x-gzip')
    response['Content-Disposition'] = 'attachment; filename="%s"' % filename
    return response
    
@user_passes_test(lambda u:u.is_staff, login_url='manager:login')
def export_all(request, pk):
    '''Exports survey results (not specific to any user).'''
    surveys = SurveyResponse.objects.filter(survey__id = pk)
    if 'filter' in request.GET:
        vals = to_idlist(request.GET['filter'], User)
        if vals:
            surveys = surveys.filter(creator__id__in = vals)
    
    surveys = filter_by_date(surveys, 'created', 
                             start=request.GET.get('start'),
                             end=request.GET.get('end'))
    
    if not surveys:
        error(request, "No surveys present to export.")
        return redirect('manager:response_list', pk=pk)
    ret = export_survey(surveys)
    hret = HttpResponse(ret.xlsx, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    
    name = filenameify(Survey.objects.get(pk=pk).name, space_repr='_') + "_export.xlsx"
    hret['Content-Disposition'] = 'attachment; filename="%s"' % name
    return hret

@user_passes_test(lambda u:u.is_staff, login_url='manager:login')
def export_by_user(request, spk, upk):
    '''Exports survye results for a specific user.'''
        surveys = None
        if 'filter' in request.GET:
            vals = to_idlist(request.GET['filter'], SurveyResponse)
            if vals:
                surveys = SurveyResponse.objects.filter(id__in=vals)
        if surveys is None:
            surveys = SurveyResponse.objects.filter(survey__id = spk, creator__id = upk)
            
        surveys = filter_by_date(surveys, 'created', 
                                 start=request.GET.get('start'),
                                 end=request.GET.get('end'))
        
        if not surveys:
            error(request, "No surveys present to export.")  
            return redirect('manager:user_response_list', spk=spk, upk=upk)
        
        ret = export_survey(surveys)
        hret = HttpResponse(ret.xlsx, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    
        user = User.objects.get(pk=upk)
        name = filenameify(" ".join([Survey.objects.get(pk=spk).name,
                           user.first_name, user.last_name, "export.xlsx"]),
                           space_repr='_')
        hret['Content-Disposition'] = 'attachment; filename="%s"' % name
        return hret
        


'''
@user_passes_test(lambda u:u.is_staff, login_url='manager:login')
def restore_database(request):
    if request.method == 'POST':
        print(request.FILES)
        form = RestoreForm(request.POST, request.FILES)
        if form.is_valid():
            print(request.FILES['file'])
            return redirect('manager:index')
    else:
        form = RestoreForm()
    return render(request, 'mg-restore.html', {'form' : form})
'''

class RestoreDatabaseView(SuperMixin, FormView):
    '''Restores the database from a previous backup'''
    template_name = "mg-restore.html"
    form_class = RestoreForm
    success_url = reverse_lazy('manager:index')
    success_message = "Successfully restored from backup!"
    error_message = "Restore from backup failed."
    error_url = reverse_lazy('manager:restore_database')
    
    def form_valid(self, form):
        f = form.cleaned_data['restore']
        #Unfortunately 'loaddata' cannot accept a file stream, so must save to temp location first.
        with tempfile.NamedTemporaryFile(mode='w+b', suffix='.json.gz', delete=False) as fp:
            fp.write(f)
            fp.seek(0)
            name = fp.name
            
        try:
            #Whole thing must be atomic.
            with transaction.atomic():
                call_command('migrate', 'api', 'zero') #Delete all api data
                call_command('migrate', 'api') #Restore the database
                User.objects.all().delete() #Remove all users
                call_command('loaddata', name) #Load the backup data
                os.unlink(name) #Remove the temporary file
        except Exception:
            self.error('Failed to apply backup')
            return redirect(self.error_url)
        else:
            self.success('Backup successfully applied.')
        return redirect(self.success_url)
    
class Index(TemplateView):
    '''The main index view.'''
    template_name='mg-index.html'
    context_object_name='index'

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(self.__class__, self).get_context_data(**kwargs)
        # Set the active nav tab to the home button
        context['nav_home'] = 'active'
        return context
        
class MarkReadView(SuperMixin, CSRFProtectMixin, NoGetMixin, View):
    '''For the notifications. Mark the comma separated list of survey ids as
       'read' for the current user.'''
    success_message='The responses were marked as read.'
    error_message='The responses could not be marked as read.'
    
    def get_success_url(self):
        return reverse_lazy('manager:index')
    
    def get_error_url(self):
        return reverse_lazy('manager:index')
        
    def post(self, request, *args, **kwargs): 
        ids = to_idlist(self.request.POST.get('rids'), SurveyResponse)
        responses = SurveyResponse.objects.filter(id__in=ids)
        for r in responses:
            ViewedResponses.objects.get_or_create(who=request.user, what=r)
        self.success(self.success_message)
        return redirect(self.get_success_url())
        
        
class Help(SuperMixin, TemplateView):
    '''The main help view.'''
    template_name='mg-help.html'

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(self.__class__, self).get_context_data(**kwargs)
        # Set the active nav tab to the home button
        context['nav_help'] = 'active'
        return context


        
class UserListView(ModifiablePaginator, SuperMixin, ListView):
    '''Only for admin - a list of users'''
    template_name = 'mg-userlist.html'
    context_object_name = 'users'
    paginate_by = 15 #15 members per page

    def get_queryset(self):
        return User.objects.filter(is_superuser=False, is_staff=False).\
                    order_by('is_active', 'id')
        
    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(self.__class__, self).get_context_data(**kwargs)
        # Set the active nav tab to the home button
        context['nav_users'] = 'active'
        return context
        
class UserDetailView(SuperMixin, UpdateView):
    '''Only for admins - details about a user'''
    model = User
    template_name='mg-userdetail.html'
    form_class = UserUpdateForm
    success_message="User updated successfully."
    error_message="That user doesn't exist"
    error_url=reverse_lazy('manager:user_list')
    success_url = reverse_lazy('manager:user_list')
    
    def form_valid(self, form):
        instance = form.save(commit=False)
        new_password = form.cleaned_data.get('the_password')
        if new_password:
            instance.set_password(new_password)
            self.success("The password for '%s' has been changed to '%s'" % \
                        (instance.username, new_password))
        return super(self.__class__, self).form_valid(form)
    
    def get_object(self):
        ret = User.objects.filter(pk=self.kwargs['pk'],
                                  is_superuser=False, is_staff=False)
        if ret:
            return ret[0]
        raise Http404
    
    def get_success_url(self):
        return reverse_lazy('manager:user_detail', 
                            kwargs={'pk' : self.kwargs['pk']})
        
class UserCreateView(SuperMixin, CreateView):
    '''Create a new user.'''
    model = User
    success_url = reverse_lazy('manager:user_list')
    success_message='The user was added successfully.'
    error_message='Could not create the user.'
    error_url=success_url
    template_name="mg-useradd.html"
    form_class = UserCreateForm
    
    def form_valid(self, form):
        user = form.save(commit=False)
        prefix = user.last_name[:3].lower() + user.first_name[:1].lower()
        i = 1
        while True:
            username = "%s%02d" % (prefix, i)
            if not User.objects.filter(username=username).exists():
                break
            i += 1
        password = form.cleaned_data['password']#User.objects.make_random_password(length=8) #:8
        user.username = username
        user.set_password(password)
        user.save()
        self.success("This user's username is '%s' and their password is '%s'" % \
                        (username, password))
        return super(self.__class__, self).form_valid(form)
        
        
class UserDeleteView(SuperMixin, NoGetMixin, DeleteView):
    '''Delete a user.'''
    model = User
    success_url = reverse_lazy('manager:user_list')
    success_message='The user was deleted successfully.'
    error_message="The user could not be deleted."
    error_url=success_url
    
    def get_queryset(self):
        valid = User.objects.filter(is_superuser=False, is_staff=False)
        return valid.filter(pk=self.kwargs['pk'])
    
class PersonalDetailsView(SuperMixin, UpdateView):
    '''Update your own personal details.'''
    model = User
    template_name='mg-changepersonaldetails.html'
    form_class = PersonalDetailsForm
    success_message="Details updated successfully."
    success_url = reverse_lazy('manager:account_details')
    error_message="You cannot do that."
    error_url = success_url
    
    def get_object(self):
        return self.request.user
        
    def form_valid(self, form):
        instance = form.save(commit=False)
        new_password = form.cleaned_data.get('new_password')
        if new_password:
            #print("'%s'" % form.cleaned_data['new_password'])
            #raise Exception('"' + form.cleaned_data['new_password'] + '"')
            instance.set_password(form.cleaned_data['new_password'])
        return super(self.__class__, self).form_valid(form)
        
    
class SurveyListView(ModifiablePaginator, CSRFProtectMixin, SuperMixin, ListView):
    '''View of the surveys'''
    model = User
    template_name = 'mg-responselist.html'
    context_object_name = 'users'
    paginate_by = 15 #15 members per page
    error_message = "That survey doesn't exist"
    error_url = reverse_lazy('manager:index')

    def get_queryset(self):
        ret = get_user_by_name_or_id(self.request.GET.get('query'))
        count = """ SELECT COUNT(*) FROM api_surveyresponse
                    WHERE api_surveyresponse.creator_id = auth_user.id
                    AND api_surveyresponse.survey_id = %d
                """ % (int(self.kwargs['pk']))
        last = """ SELECT created FROM api_surveyresponse
                   WHERE api_surveyresponse.creator_id = auth_user.id
                   AND api_surveyresponse.survey_id = %d
               """ % (int(self.kwargs['pk']))
               
        if 'start' in self.request.GET:
            start = self.request.GET['start']
            try:
                start = datetime.strptime(start, '%d/%m/%Y')
            except ValueError:
                pass
            else:
                fmt = start.strftime(" AND api_surveyresponse.created >= '%Y-%m-%d'")
                count += fmt
                last  += fmt
        if 'end' in self.request.GET:
            end = self.request.GET['end']
            try:
                end = datetime.strptime(end, '%d/%m/%Y')
            except ValueError:
                pass
            else:
                fmt = end.strftime(" AND api_surveyresponse.created <= '%Y-%m-%d'")
                count += fmt
                last  += fmt
            
        last += " ORDER BY created DESC LIMIT 1"
        
        #List of users with number of surveys completed and last date of completion
        #Ordered by last name then first name, case insensitive.
        return ret.\
                    extra(select={
                        'lower_firstname' : 'lower(first_name)',
                        'lower_lastname' : 'lower(last_name)',
                        'survey_count' : count,
                        'last_survey' : last
                    }).\
                    order_by('lower_lastname', 'lower_firstname')
        
    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(self.__class__, self).get_context_data(**kwargs)
        try:
            survey = Survey.objects.get(pk=self.kwargs['pk'])
        except (AttributeError, Survey.DoesNotExist):
            raise Http404
        
        followon = context.get('follow_on', {})
        followon['query'] = self.request.GET.get('query', '')
        followon['user_paginate_by'] = self.request.GET.get('paginate_by', '')
        followon['start'] = self.request.GET.get('start', '')
        followon['end']   = self.request.GET.get('end', '')
        context['follow_on'] = followon
        
        context['survey'] = survey
        return context
        
class SurveyDeleteView(SuperMixin, CSRFProtectMixin, NoGetMixin, View):
    '''Delete survey responses.'''
    model = SurveyResponse
    success_message='The responses were deleted successfully.'
    error_message='The responses could not be deleted.'
    
    def get_success_url(self):
        return reverse_lazy('manager:response_list',
                            kwargs={'pk' : self.kwargs['pk']})
    
    def get_error_url(self):
        return reverse_lazy('manager:response_list',
                            kwargs={'pk' : self.kwargs['pk']})
    
    def post(self, request, *args, **kwargs):
        todelete = SurveyResponse.objects.filter(survey__id=self.kwargs['pk'])
        users = get_user_by_name_or_id(self.request.POST.get('query'))
        todelete = todelete.filter(creator__in=users)
        
        if 'filter' in request.POST:
            ids = to_idlist(request.POST['filter'], User)
            if ids:
                todelete = todelete.filter(creator__id__in=ids)
                
        todelete = filter_by_date(todelete, 'created',
                                  start=self.request.POST.get('start'),
                                  end=self.request.POST.get('end'))
        if not todelete:
            self.error("No responses to delete")
            raise Http404
            
        todelete.delete()
        self.success(self.success_message)
        return redirect(self.get_success_url())
        
class SurveyUserListView(ModifiablePaginator, CSRFProtectMixin, SuperMixin, ListView):
    '''View survey responses specific to a particular user.'''
    model = SurveyResponse
    template_name = 'mg-userresponselist.html'
    context_object_name = 'responses'
    paginate_by = 5 #5 members per page wow so slow
    error_message = "That survey and/or user doesn't exist"
    error_url = reverse_lazy('manager:index')

    def get_queryset(self):
        ret = SurveyResponse.objects.filter(survey__id=self.kwargs['spk'], 
                                            creator__id=self.kwargs['upk'])\
                            .order_by('-created')
                            
        ret = filter_by_date(ret, 'created',
                       start=self.request.GET.get('start'),
                       end=self.request.GET.get('end'))
        return ret
        
    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(self.__class__, self).get_context_data(**kwargs)
        
        #Get the current survey/user
        try:
            survey = Survey.objects.get(pk=self.kwargs['spk'])
            user = User.objects.get(pk=self.kwargs['upk'])
        except (AttributeError, Survey.DoesNotExist, User.DoesNotExist):
            raise Http404
        context['cur_user'] = user
        context['survey'] = survey
        
        #Add on the follow-on parameters
        followon = context.get('follow_on', {})
        followon['user_paginate_by'] = self.request.GET.get('paginate_by', '')
        followon['start'] = self.request.GET.get('start', '')
        followon['end'] = self.request.GET.get('end', '')
        context['follow_on'] = followon
            
        #Get the current queryset
        qs = context[self.context_object_name]
        #Compute the question responses for each response in the queryeset
        context['rcache'] = {}
        for x in qs:
            context['rcache'][x] = x.responses(parsed=True)

        return context
        
class SurveyUserDeleteView(SuperMixin, CSRFProtectMixin, NoGetMixin, View):
    '''Delete survey responses to a particular user.'''
    model = SurveyResponse
    success_message='The responses were deleted successfully.'
    error_message='The responses could not be deleted.'
    
    def get_success_url(self):
        return reverse_lazy('manager:user_response_list',
                            kwargs={'spk' : self.kwargs['spk'], 
                                    'upk' : self.kwargs['upk']})
    
    def get_error_url(self):
        return reverse_lazy('manager:user_response_list',
                            kwargs={'spk' : self.kwargs['spk'], 
                                    'upk' : self.kwargs['upk']})
    
    def post(self, request, *args, **kwargs):
        todelete = SurveyResponse.objects.filter(survey__id=self.kwargs['spk'], creator__id=self.kwargs['upk'])
        if 'filter' in request.POST:
            ids = to_idlist(request.POST['filter'], SurveyResponse)
            if ids:
                todelete = todelete.filter(id__in=ids)
        
        todelete = filter_by_date(todelete, 'created',
                                  start=self.request.POST.get('start'),
                                  end=self.request.POST.get('end'))        
        
        if not todelete:
            self.error("No responses to delete")
            raise Http404
            
        todelete.delete()
        self.success(self.success_message)
        return redirect(self.get_success_url())
       