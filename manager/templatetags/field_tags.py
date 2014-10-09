from django import template
from django.forms.fields import FileField
register = template.Library()

#http://stackoverflow.com/questions/3927018/django-how-to-check-if-field-widget-is-checkbox-in-the-template
@register.filter(name='is_filefield')
def is_filefield(field):
  return isinstance(field.field, FileField)
