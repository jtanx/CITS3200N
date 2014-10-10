from django.contrib.auth.models import User
from api.models import *
from datetime import datetime, timedelta
from dateutil import tz
from django.db import transaction
import random

NUM_ENTRIES=10
tzone = tz.tzlocal()

@transaction.atomic
def generate_mtds(user, created):
    mtds = Survey.objects.get(id=1)
    sr = SurveyResponse.objects.create(survey=mtds, creator=user, created=created)
    sr.save()
    
    for i in range(1,23):
        qid = SurveyQuestion.objects.get(parent=mtds, number=i)
        qr = QuestionResponse.objects.create(rid=sr, qid=qid, entry=str(random.randint(1,5)))
        qr.save()

def doit():
    for u in User.objects.filter(is_staff=False, is_superuser=False):
        for i in range(NUM_ENTRIES):
            generate_mtds(u, datetime.now(tz=tzone)-timedelta(days=i))