from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect,render
from django.views.generic import *
from django.contrib.auth.models import User, Group
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

        
class UserListView(LoginRequiredMixin, AdminRequiredMixin, ListView):
    '''Only for admin - a list of users'''
    template_name = 'mg-userlist.html'
    context_object_name = 'users'
    paginate_by = 15 #15 members per page

    def get_queryset(self):
        return User.objects.all().order_by('is_active', 'id')
        
    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(self.__class__, self).get_context_data(**kwargs)
        # Set the active nav tab to the home button
        context['nav_users'] = 'active'
        return context