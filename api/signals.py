from django.contrib.auth.models import User
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from api.models import SurveyResponse

@receiver(post_save, sender=User)
def create_necessary(sender, instance=None, created=False, **kwargs):
    '''Create auth token objects for the user.'''
    if created:
        Token.objects.create(user=instance)
            
@receiver(post_save, sender=SurveyResponse)
def survey_updated(sender, instance=None, created=False, **kwargs):
    if instance is not None:
        survey = instance.survey 
        responses = instance.responses(parsed=True) #Get actual format
        if not responses: #Responses to questions have not been saved yet
            return
            
        if survey.id == 1: #MTDS
            print("MTDS")
        elif survey.id == 2: #Sleep quality
            print(responses)
        elif survey.id == 3: #Training volume
            print("TRAINING VOLUME")
        elif survey.id == 4: #Meal diary
            pass
        