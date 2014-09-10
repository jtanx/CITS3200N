from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class DiaryType(models.Model):
    name = models.CharField(max_length=40, unique=True)
    description = models.CharField(max_length=255, blank=True)

    def __unicode__(self):
        return '%s' % self.name

class Diary(models.Model):
    user = models.ForeignKey(User)
    dtype = models.ForeignKey(DiaryType)
    created = models.DateTimeField()
    submitted = models.DateTimeField(default=timezone.now)
    entry = models.CharField(max_length=255)

    def __unicode__(self):
        return '%s:%s:[%s] %s' % (self.user, self.dtype, \
                                  self.created, self.entry)
    
class Survey(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.CharField(max_length=255)

    def questions(self):
        if self.id:
            return SurveyQuestion.objects.filter(parent = self.id)
        return None

    def __unicode__(self):
        return '%s: %s' % (self.name, self.description)

class SurveyQuestion(models.Model):
    INTEGER = "INT"
    INTSCALE = "INS"
    TEXT = "TXT"
    CHOICE = "CHC"
    MULTICHOICE = "MCH"
    
    QTYPE_CHOICES = (
        (INTEGER, "Integer"),
        (INTSCALE, "Integer scale"),
        (TEXT, "Text"),
        (CHOICE, "Single choice"),
        (MULTICHOICE, "Multi choice")
    )
    
    parent = models.ForeignKey(Survey)
    number = models.IntegerField()
    description = models.CharField(max_length=255)
    qtype = models.CharField(max_length=3, choices=QTYPE_CHOICES, default=TEXT)
    required = models.BooleanField(default=True)
    #Only required for multi-choice/radio type
    choices = models.TextField(blank=True, null=True)

    def __unicode__(self):
        return '%s:%s:%s: %s' % (self.parent, self.qtype, self.required, \
                                   self.description)
                                   
    class Meta:
        unique_together = (("parent", "number"),)
    
class SurveyResponse(models.Model):
    survey = models.ForeignKey(Survey)
    creator = models.ForeignKey(User)
    created = models.DateTimeField()
    submitted = models.DateTimeField(default=timezone.now)

    def __unicode__(self):
        return 'Response by %s to %s (%s)' % (self.creator, self.survey, \
                                              self.created)

class QuestionResponse(models.Model):
    rid = models.ForeignKey(SurveyResponse)
    qid = models.ForeignKey(SurveyQuestion)
    entry = models.CharField(max_length=255)

    def __unicode__(self):
        return '%s:%s: %s' % (self.rid, self.qid, self.entry)
