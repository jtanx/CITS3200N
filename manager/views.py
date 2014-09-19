from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import redirect,render
from django.views.generic.base import TemplateView
from manager.forms import *

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
        context = super(Index, self).get_context_data(**kwargs)
        # Set the active nav tab to the home button
        context['nav_home'] = 'active'
        return context
