from django.forms import Form, ModelForm, Textarea
from django import forms

class LoginForm(Form):
    '''A login form'''
    username = forms.CharField()
    username.widget.attrs['class'] = 'form-control'
    password = forms.CharField(widget=forms.PasswordInput())
    password.widget.attrs['class'] = 'form-control'
    next_location = forms.CharField(required=False, widget=forms.HiddenInput)