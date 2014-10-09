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
        #Why this needs to be set here...
        self.fields['the_password'].required = False
        
    #Different name to 'password' as User model also has that field.
    the_password = forms.CharField(required=False,
                                   label="Password",
                                   help_text="Fill this field in to replace the current password.",
                                   widget=forms.TextInput(attrs={'placeholder': 'Fill to replace...'}))
                               
    def clean_the_password(self):
        password = self.cleaned_data.get("the_password")
        if password:
            if len(password) < 4:
                msg = "Passwords should be at least 4 characters long."
                self._errors["the_password"] = self.error_class([msg])
                del self.cleaned_data["the_password"]
                
        return password
    '''A user add/modification form'''
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'the_password', 'is_active']
                
class UserCreateForm(BootstrapMixin, AllRequiredMixin, ModelForm):
    '''A class to add a user'''
    password = forms.CharField(min_length=4)
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']
    