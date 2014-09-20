from django.forms import Form, ModelForm, Textarea
from django import forms

class LoginForm(Form):
    '''A login form'''
    username = forms.CharField()
    username.widget.attrs['class'] = 'form-control'
    password = forms.CharField(widget=forms.PasswordInput())
    password.widget.attrs['class'] = 'form-control'
    next_location = forms.CharField(required=False, widget=forms.HiddenInput)
    
class UserForm(Form):
    '''A user add/modification form'''
    username = forms.CharField(max_length=30)
    first_name = forms.CharField(max_length=40)
    last_name = forms.CharField(max_length=40)
    #password = forms.CharField(widget=forms.PasswordInput())
    #confirm_password = forms.CharField(widget=forms.PasswordInput())
    email = forms.EmailField()
    
    def __init__(self, *args, **kwargs):
        super(self.__class__, self).__init__(*args, **kwargs)
        for name, field in self.fields.items():
            if field.widget.attrs.has_key('class'):
                field.widget.attrs['class'] += ' form-control'
            else:
                field.widget.attrs.update({'class':'form-control'})

    def clean_username(self):
        '''Username validation'''
        username = self.cleaned_data.get("username")
        if username:
            msg = None
            if len(username) < 4:
                msg = "Usernames must be at least 4 characters long."
            elif not re.match(r'^[a-zA-Z0-9]+.*[a-zA-Z0-9]', username):
                msg = "Usernames must begin and end with " +\
                      "an alphanumeric character."
            elif not re.match(r'^[a-zA-Z0-9-_.]+$', username):
                msg = "Usernames must be composed of the characters " + \
                      "A-Z, a-z or any of -_."
            elif User.objects.filter(username=username).exists():
                msg = "That username is already in use."
            if msg:
                self._errors["username"] = self.error_class([msg])
                del self.cleaned_data["username"]
        
        return username #always return

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if email and User.objects.filter(email=email).exists():
            msg = "That email is already in use."
            self._errors["email"] = self.error_class([msg])
            del self.cleaned_data["email"]
        return email
    
    def clean(self):
        '''Form validation'''
        cleaned_data = super(self.__class__, self).clean()
        p1 = cleaned_data.get("password")
        p2 = cleaned_data.get("confirm_password")

        if p1 and p2:
            msg = None
            if p1 != p2:
                msg="Passwords do not match."
            elif len(p1) < 6:
                msg = "Password must be at least 6 characters long."

            if msg:
                self._errors["confirm_password"] = self.error_class([msg])
                del cleaned_data["password"]
                del cleaned_data["confirm_password"]
        return cleaned_data