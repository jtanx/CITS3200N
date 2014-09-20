from django.forms import Form, ModelForm, Textarea
from django.contrib.auth.models import User, Group
from django import forms

class BootstrapMixin(object):
     def __init__(self, *args, **kwargs):
        '''Shit hack to get it styled with bootstrap'''
        super(BootstrapMixin, self).__init__(*args, **kwargs)
        for name, field in self.fields.items():
            if field.widget.attrs.has_key('class'):
                field.widget.attrs['class'] += ' form-control'
            else:
                field.widget.attrs.update({'class':'form-control'})
                
class AllRequiredMixin(object):
    '''All fields required'''
    def __init__(self, *args, **kwargs):
        super(AllRequiredMixin, self).__init__(*args, **kwargs)
        for name, field in self.fields.items():
            field.required = True

class LoginForm(BootstrapMixin, Form):
    '''A login form'''
    username = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput())
    next_location = forms.CharField(required=False, widget=forms.HiddenInput)
    
class PersonalDetailsForm(BootstrapMixin, AllRequiredMixin, ModelForm):
    '''A form to modify personal details'''
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']
    
class UserUpdateForm(BootstrapMixin, AllRequiredMixin, ModelForm):
    def __init__(self, *args, **kwargs):
        super(self.__class__, self).__init__(*args, **kwargs)
        #This field is not required (absence==not active), but everything else is
        self.fields['is_active'].required = False
        
    '''A user add/modification form'''
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'is_active']
                
class UserCreateForm(BootstrapMixin, AllRequiredMixin, ModelForm):
    '''A class to add a user'''
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']
    