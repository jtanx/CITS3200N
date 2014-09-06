from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

class DiaryType(models.Model):
    name = models.CharField(max_length=40, unique=True)
    description = models.CharField(max_length=255, blank=True)

    def __unicode__(self):
        return '%s' % self.name

class Diary(models.Model):
    user = models.ForeignKey(User)
    dtype = models.ForeignKey(DiaryType)
    created = models.DateTimeField()
    submitted = models.DateTimeField(default=datetime.now)
    entry = models.CharField(max_length=255)

    def __unicode__(self):
        return '%s:%s:[%s] %s' % (self.user, self.dtype, \
                                  self.timestamp, self.entry)
    
class Survey(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.CharField(max_length=255)

    def __unicode__(self):
        return '%s (author: %s): %s' % (self.name, self.creator, \
                                        self.description)

class QuestionType(models.Model):
    name = models.CharField(max_length=40, unique=True)

    def __unicode__(self):
        return '%s' % name

class SurveyQuestion(models.Model):
    parent = models.ForeignKey(Survey)
    description = models.CharField(max_length=255)
    qtype = models.ForeignKey(QuestionType)
    required = models.BooleanField(default=True)
    #Only required for multi-choice/radio type
    choices = models.TextField(blank=True, null=True)

    def __unicode__(self):
        return '%s:%s:%s: %s' % (self.parent, self.qtype, self.required, \
                                   self.description)
    
class SurveyResponse(models.Model):
    survey = models.ForeignKey(Survey)
    creator = models.ForeignKey(User)
    created = models.DateTimeField()
    submitted = models.DateTimeField(default=datetime.now)

    def __unicode__(self):
        return 'Response by %s to %s (%s)' % (self.creator, self.survey, \
                                              self.timestamp)

class QuestionResponse(models.Model):
    rid = models.ForeignKey(SurveyResponse)
    qid = models.ForeignKey(SurveyQuestion)
    entry = models.CharField(max_length=255)

    def __unicode__(self):
        return '%s:%s: %s' % (self.rid, self.qid, self.entry)
