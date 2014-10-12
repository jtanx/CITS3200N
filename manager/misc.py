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
    
def num_notifications(request):
    '''Adds the number of unseen responses to the context'''
    #Uses the namespace defined in urls.py
    app_name = resolve(request.path).namespace
    if app_name == 'manager' and request.user.is_authenticated() and request.user.is_staff:
        unseen = SurveyResponse.objects.all().extra(where=['''
                 api_surveyresponse.id NOT IN (
                    SELECT what_id 
                    FROM api_viewedresponses
                    WHERE who_id=%d
                 )''' % (request.user.id)]).order_by('-created')
        return {'unseen' : unseen}
    return {}