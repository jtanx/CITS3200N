from django.contrib.auth.models import User
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from api.models import SurveyResponse, QuestionResponse, Changeset

@receiver(post_save, sender=User)
def create_necessary(sender, instance=None, created=False, **kwargs):
    '''Create auth token and changeset objects for the user.'''
    if created:
        Token.objects.create(user=instance)
        Changeset.objects.create(user=instance)

def db_changed(sender, instance=None, created=False, **kwargs):
    '''Detect if the user has made a change to the db. If so, increment the revision counter.'''
    if instance:
        user = None
        if sender is SurveyResponse:
            user = instance.creator
        elif sender is QuestionResponse:
            user = instance.rid.creator
            
        if user is not None and User.objects.filter(id=user.id).exists():
            cs = Changeset.objects.get(user=user)
            cs.revision += 1
            cs.save()
        
post_save.connect(db_changed)
post_delete.connect(db_changed)