from __future__ import print_function
from django.template.defaulttags import register

@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)