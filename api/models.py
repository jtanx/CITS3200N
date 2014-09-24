from django.db import models
from django.core.exceptions import ValidationError
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
    description = models.CharField(max_length=255, blank=True)

    def questions(self):
        if self.id:
            return SurveyQuestion.objects.filter(parent = self).order_by('number')
        return None

    def __unicode__(self):
        return '%s: %s' % (self.name, self.description)

class SurveyQuestion(models.Model):
    INTEGER = "INT"
    INTSCALE = "INS"
    TEXT = "TXT"
    CHOICE = "CHC"
    MULTICHOICE = "MCH"
    
    QTYPES = (
        (INTEGER, "Integer"),
        (INTSCALE, "Integer scale"),
        (TEXT, "Text"),
        (CHOICE, "Single choice"),
        (MULTICHOICE, "Multi choice")
    )
    
    parent = models.ForeignKey(Survey)
    number = models.IntegerField()
    description = models.CharField(max_length=255)
    qtype = models.CharField(max_length=3, choices=QTYPES, default=TEXT)
    required = models.BooleanField(default=True)
    #Only required for multi-choice/radio type
    choices = models.TextField(blank=True, null=True)
    
    def clean_response(self, entry):
        entry = entry.strip()
        if not entry and self.required:
            raise ValueError("An entry is required for this question.")
        elif self.qtype == self.INTEGER or self.qtype == self.INTSCALE:
            try:
                ret = int(entry)
            except ValueError:
                raise ValueError("Non-integer value given for an integer field")
            
            if self.qtype == self.INTSCALE and ret < 1 or ret > 5:
                raise ValueError("Invalid integer scale value %d" % ret)
            return int(entry)
        elif self.qtype == self.CHOICE:
            #Fixme somewhat inefficient
            if entry not in self.choices():
                raise ValueError("Not a valid choice.") #hurrr
        return entry

    def choicelist(self):
        if self.qtype != self.CHOICE or self.qtype != self.MULTICHOICE:
           raise ValueError("Cannot get choices for non-choice type question.")
        
        return [x.strip() for x in self.choices.split("|")]
    
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
    
    def responses(self):
        if self.id:
            return QuestionResponse.objects.filter(rid=self)
        return None

    def __unicode__(self):
        return 'Response by %s to %s (%s)' % (self.creator, self.survey, \
                                              self.created)

class QuestionResponse(models.Model):
    rid = models.ForeignKey(SurveyResponse, blank=True)
    qid = models.ForeignKey(SurveyQuestion)
    entry = models.CharField(max_length=255)
    
    def clean(self):
        try:
            self.entry = self.qid.clean_response(self.entry)
        except ValueError, e:
            raise ValidationError(e)

    def __unicode__(self):
        return '%s:%s: %s' % (self.rid, self.qid, self.entry)  
        
    class Meta:
        unique_together = (("rid", "qid"),)


