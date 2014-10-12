from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.dateparse import parse_datetime 
import re
    
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
    DATETIME = "DTM"
    TEXT = "TXT"
    CHOICE = "CHC"
    #MULTICHOICE = "MCH"
    
    QTYPES = (
        (INTEGER, "Integer"),
        (INTSCALE, "Integer scale"),
        (DATETIME, "Date-Time"),
        (TEXT, "Text"),
        (CHOICE, "Single choice"),
        #(MULTICHOICE, "Multi choice")
    )
    
    parent = models.ForeignKey(Survey)
    number = models.IntegerField()
    description = models.CharField(max_length=255)
    qtype = models.CharField(max_length=3, choices=QTYPES, default=TEXT)
    required = models.BooleanField(default=True)
    #Only required for multi-choice/radio type
    choices = models.TextField(blank=True, null=True)
    
    def clean(self):
        if self.qtype == self.CHOICE or self.qtype == self.MULTICHOICE:
            vals = self.choicelist()
            if not vals:
                raise ValidationError("A choice based question must have at least one choice")
            for i in range(len(vals)): 
                #Drop anything that does not match this regex.
                vals[i] = re.sub(r"[^a-zA-Z0-9,.\-\?!]", " ", vals[i]).strip()
                if not vals[i]:
                    raise ValidationError("Choice must be alphanumeric.")
            self.choices = "|".join(vals)
    
    def clean_response(self, entry, stringify_dates=True):
        entry = entry.strip()
        if not entry and self.required:
            raise ValueError("An entry is required for this question.")
        elif self.qtype == self.INTEGER or self.qtype == self.INTSCALE:
            try:
                ret = int(entry)
            except ValueError:
                raise ValueError("Non-integer value given for an integer field")
            
            if self.qtype == self.INTSCALE and (ret < 1 or ret > 5):
                raise ValueError("Invalid integer scale value %d" % ret)
            return int(entry)
        elif self.qtype == self.DATETIME:
            try:
                ret = parse_datetime(entry)
            except (ValueError, TypeError):
                raise ValueError("Datetime is not in ISO-8601 UTC format.")
            
            if ret is None:
                raise ValueError("Invalid datetime specified.")
            
            if stringify_dates:
                #Pulled from DRF DateTimeField serializer code
                ret = ret.isoformat()
                if ret.endswith('+00:00'):
                    ret = ret[:-6] + 'Z'   
            
            return ret
        elif self.qtype == self.CHOICE:
            #Fixme somewhat inefficient
            if entry not in self.choicelist():
                raise ValueError("Not a valid choice.") #hurrr
        return entry

    def choicelist(self):
        if self.qtype != self.CHOICE and self.qtype != self.MULTICHOICE:
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
    
    def responses(self, parsed=False):
        '''Returns the list of responses. If parsed=True, the responses are
           parsed into their actual representation (as a number:entry dictionary)
        '''
        if self.id:
            raw = QuestionResponse.objects.filter(rid=self)
            if not parsed:
                return raw
                
            ret = {}
            for r in raw:
                number = r.qid.number
                entry = r.qid.clean_response(r.entry, stringify_dates=False)
                ret[number] = entry
            return ret   
        return None
       
    '''
    def cached_responses(self):
        #Cached, parsed responses; for template
        if not hasattr(self, '__cached_responses'):
            print("CACHE_MISS", id(self))
            self.__cached_responses = self.responses(True)
        else:
            print("CACHE_HIT")
        return self.__cached_responses
    '''
    def __unicode__(self):
        return 'Response by %s to %s (%s)' % (self.creator, self.survey, \
                                              self.created)

class QuestionResponse(models.Model):
    rid = models.ForeignKey(SurveyResponse, blank=True)
    qid = models.ForeignKey(SurveyQuestion)
    entry = models.CharField(max_length=255)
    
    def number(self):
        return self.qid.number
    
    def clean(self):
        try:
            self.entry = self.qid.clean_response(self.entry)
        except ValueError, e:
            raise ValidationError(e)

    def __unicode__(self):
        return '%s:%s: %s' % (self.rid, self.qid, self.entry)  
        
    class Meta:
        unique_together = (("rid", "qid"),)

class ViewedResponses(models.Model):
    who = models.ForeignKey(User)
    what = models.ForeignKey(SurveyResponse)
    when = models.DateTimeField(default=timezone.now)
    
    def __unicode__(self):
        return "%s:[%s] viewed '%s'" % (self.who, self.when, self.what)  
    
    class Meta:
        unique_together = (('who', 'what'),)
        
#For all signals
import api.signals
