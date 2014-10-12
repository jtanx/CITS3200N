from rest_framework import serializers, permissions
from rest_framework.serializers import ValidationError
from StringIO import StringIO
from rest_framework.parsers import JSONParser
from rest_framework.exceptions import ParseError
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
import datetime
from api.models import *

# Serializers define the API representation.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'is_staff')
        
class InfoSerializer(serializers.ModelSerializer):
    '''General info about this current user'''
    weekly_run = serializers.SerializerMethodField('get_weekly_run')
    weekly_cycle = serializers.SerializerMethodField('get_weekly_cycle')
    weekly_swim = serializers.SerializerMethodField('get_weekly_swim')
    
    def get_weekly_exercise(self, obj, type):
        '''Calculate the total exercise distance for the past week'''
        now = timezone.now()
        thisweek = timezone.now() - datetime.timedelta(days = now.weekday())
        qs = QuestionResponse.objects.filter(rid__creator=obj,
                                             rid__created__gte=thisweek,
                                             rid__survey__id=3, #hardcode magic is magic
                                             qid__number=1, #hardcode magic is magic
                                             entry=type).values_list('rid', flat=True)
                                             
        qs = QuestionResponse.objects.filter(rid__id__in=qs, qid__number=4).values_list('entry', flat=True)
        return sum(int(x) for x in qs)
    
    def get_weekly_run(self, obj):
        return self.get_weekly_exercise(obj, "Run")
    def get_weekly_cycle(self, obj):
        return self.get_weekly_exercise(obj, "Cycle")
    def get_weekly_swim(self, obj):
        return self.get_weekly_exercise(obj, "Swim")
        
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'weekly_run', 'weekly_cycle', 'weekly_swim')
        read_only_fields = ('first_name', 'last_name')

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyQuestion

class SurveySerializer(serializers.ModelSerializer):
    class Meta:
        model = Survey
        fields = ('id', 'name', 'description', 'questions')
    questions = QuestionSerializer()
    
'''
class QuestionResponseSerializer(serializers.Serializer):
    qid = serializers.IntegerField(required=False)
    number = serializers.IntegerField(required=False)
    entry = serializers.CharField(max_length=255)
    
    def validate(self, attrs):
        if 'qid' not in attrs and 'number' not in attrs:
            raise ValidationError("Either the question ID or number is required.")
        elif 'qid' in attrs:
            qid = attrs['qid']
            if not SurveyQuestion.objects.filter(pk=qid).exists():
                raise ValidationError("No such question with ID %d" % qid)
            q = SurveyQuestion.objects.get(pk=qid)
            if 'number' in attrs and q.number != attrs['number']:
                raise ValidationError("Question number %d does not match value for question with ID %d" % qid)
            attrs['number'] = q.number
        return attrs
    
    def restore_object(self, attrs, instance=None):
        if instance is None:
            return attrs
        return instance
'''
    
class QuestionResponseSerializer(serializers.ModelSerializer):
    class QuestionNumberField(serializers.WritableField):
        def from_native(self, value):
            try:
                number = int(value)
            except ValueError:
                raise serializers.ValidationError("Invalid question number")
                
            question = SurveyQuestion.objects.filter(parent=self.context['survey'], number=number)
            if not question.exists():
                raise serializers.ValidationError("Non-existant question")
            return question[0]
        
    def restore_object(self, attrs, instance=None):
        if instance is None:
            return QuestionResponse(qid=attrs['number'], entry=attrs['entry'])
        return instance
    
    number = QuestionNumberField()

    class Meta:
        model = QuestionResponse
        fields = ('number', 'entry')
        
class SurveyResponseSerializer(serializers.ModelSerializer):
    class ResponseField(serializers.WritableField):
        def to_native(self, obj):
            #raise Exception("You piece of shit")
            serializer = QuestionResponseSerializer(obj, many=True)
            return serializer.data
            
        def from_native(self, value):
            if 'survey' in self.context['request'].DATA:
                try:
                    spk = int(self.context['request'].DATA['survey'])
                except ValueError:
                    raise serializers.ValidationError("Invalid Survey ID")
                survey = Survey.objects.filter(pk=spk)
                if not survey.exists():
                    raise serializers.ValidationError("That survey does not exist.")
                survey = survey[0]
            else:
                raise serializers.ValidationError("No survey ID supplied.")
            
            stream = StringIO(value)
            try:
                data = JSONParser().parse(stream)
            except ParseError, e:
                print(value)
                print(e)
                raise serializers.ValidationError("Invalid JSON format for responses")
            
            responses = QuestionResponseSerializer(data=data, many=True, partial=True,
                                                   context={'survey' : survey})
            
            if responses.is_valid():
                return responses.object
            else:
                #Get (any) one of the validation error messages
                for entry in responses.errors:
                    if "__all__" in entry:
                        raise ValidationError(entry["__all__"])
                #...
                raise ValidationError(list(responses.errors[0].values())[0])
                raise ValidationError("Invalid question response")
    
    responses = ResponseField()
    
    class Meta:
        model = SurveyResponse
        fields = ('id', 'survey', 'created', 'submitted', 'responses')
        read_only_fields = ('id', 'submitted',)
        
    def validate(self, attrs):
        responses = attrs['responses']
        survey = attrs['survey']
        
        questions = survey.questions()
        
        seen = set()
        for response in responses:
            q = response.qid
            if q.pk in seen:
                raise ValidationError("Multiple responses to question %d" % q.number)
            seen.add(q.pk)
        
        for question in questions:
            if question.pk not in seen and question.required:
                raise ValidationError("Response to question %d is required" % question.number)
        
        return attrs
        
    def restore_object(self, attrs, instance=None):
        if instance is not None:
            #raise Exception(attrs['created'])
            if instance.survey != attrs['survey']:
                raise ValidationError("Cannot change the survey type")
              
            self.responses_todelete = instance.responses()
        else:
            user = self.context['request'].user
            instance = SurveyResponse(survey=attrs['survey'], creator=user, \
                               created=attrs['created'])
            
        self.responses_tosave = attrs['responses']
        return instance
        
    def save(self, **kwargs):
        #Atomicity needed because invalid input could cause old response to be lost.
        #Order of operations here is important.
        with transaction.atomic():
            if hasattr(self, 'responses_todelete'):
                self.responses_todelete.delete()
            ret = super(self.__class__, self).save(**kwargs)
            for qr in self.responses_tosave:
                qr.rid = ret
                qr.full_clean()
                qr.save()
            
        #Call here to trigger the signal again after questions have been populated
        ret.save()
        return ret
      
    
        
