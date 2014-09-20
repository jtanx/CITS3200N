from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect,render
from django.views.generic import *
from django.http import *
from django.contrib.auth.models import User, Group
from django.contrib import messages
from django.core.urlresolvers import reverse_lazy
from manager.forms import *
from api.models import *

'''Mixins'''
class LoginRequiredMixin(object):
    '''Forces login for a specified view'''
    @method_decorator(login_required(login_url='manager:login'))
    def dispatch(self, request, *args, **kwargs):
        return super(LoginRequiredMixin, self).\
               dispatch(request, *args, **kwargs)
               
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

    def get(self, request, *args, **kwargs):
        try:
            return super(MessageMixin, self).get(request, *args, **kwargs)
        except Http404:
            if self.error_message:
                messages.error(self.request, self.error_message,
                               extra_tags="alert-warning")
            if self.error_url:
                return redirect(self.error_url)
            raise Http404
            
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
            if self.error_url:
                return redirect(self.error_url)
            raise Http404
            
    def form_valid(self, form):
        self.__mmi_success = True
        return super(MessageMixin, self).form_valid(form)
        
class SuperMixin(LoginRequiredMixin, AdminRequiredMixin, MessageMixin):
    '''yeah'''
    pass
    
class NoGetMixin(object):
    '''Do not allow the get method'''
    def get(self, request, *args, **kwargs):
        messages.error(self.request, self.error_message, 
                       extra_tags="alert-warning")
        return redirect(self.error_url)
               
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

        
class UserListView(SuperMixin, ListView):
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
    #success_url = reverse_lazy('manager:user_list')
    
    def get_object(self):
        ret = User.objects.filter(pk=self.kwargs['pk'],
                                  is_superuser=False, is_staff=False)
        if ret:
            return ret[0]
        raise Http404
    
    def get_success_url(self):
        return reverse_lazy('manager:user_detail', 
                            kwargs={'pk' : self.kwargs['pk']})
                            
    def get_queryset(self):
        return User.objects.filter(is_superuser=False, is_staff=False)
        
class UserCreateView(SuperMixin, CreateView):
    model = User
    success_url = reverse_lazy('manager:user_list')
    success_message='The user was added successfully.'
    error_message='Could not create the user.'
    error_url=success_url
    template_name="mg-useradd.html"
    form_class = UserCreateForm
    
    
    
        
class UserDeleteView(SuperMixin, NoGetMixin, DeleteView):
    model = User
    success_url = reverse_lazy('manager:user_list')
    success_message='The user was deleted successfully.'
    error_message="The user could not be deleted."
    error_url=success_url
    
    def get_queryset(self):
        valid = User.objects.filter(is_superuser=False, is_staff=False)
        return valid.filter(pk=self.kwargs['pk'])
    
    