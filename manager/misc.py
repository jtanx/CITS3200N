from api.models import *
from django.core.urlresolvers import resolve

def survey_list(request):
    '''Adds a list of the surveys available to the context'''
    #Uses the namespace defined in urls.py
    app_name = resolve(request.path).namespace
    if app_name == 'manager':
        surveys = Survey.objects.all().order_by('name')
        return {'surveys' : surveys}
    return {}