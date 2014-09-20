from django.forms import Form, ModelForm, Textarea
from django.contrib.auth.models import User, Group
from django import forms

class LoginForm(Form):
    '''A login form'''
    username = forms.CharField()
    username.widget.attrs['class'] = 'form-control'
    password = forms.CharField(widget=forms.PasswordInput())
    password.widget.attrs['class'] = 'form-control'
    next_location = forms.CharField(required=False, widget=forms.HiddenInput)
    
class UserForm(ModelForm):
    '''A user add/modification form'''
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'is_active']
        
    def __init__(self, *args, **kwargs):
        '''Shit hack to get it styled with bootstrap'''
        super(self.__class__, self).__init__(*args, **kwargs)
        for name, field in self.fields.items():
            if field.widget.attrs.has_key('class'):
                field.widget.attrs['class'] += ' form-control'
            else:
                field.widget.attrs.update({'class':'form-control'})