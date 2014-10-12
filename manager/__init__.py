from __future__ import print_function
from django.template.defaulttags import register

@register.filter
def get_item(dictionary, key):
    '''Get the item from the dictionary'''
    return dictionary.get(key)
    
@register.filter
def display_if_positive(v, alt=""):
    return v if v > 0 else alt