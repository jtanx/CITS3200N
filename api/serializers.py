from rest_framework import serializers, permissions
from rest_framework.serializers import ValidationError
from StringIO import StringIO
from rest_framework.parsers import JSONParser
from rest_framework.exceptions import ParseError
from django.contrib.auth.models import User
from api.models import *

# Serializers define the API representation.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'is_staff')

class DiaryTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiaryType

class DiarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Diary
	fields = ('id', 'created', 'entry', 'dtype')
	read_only_fields = ('id',)
	
	
    def restore_object(self, attrs, instance=None):
        if instance is None:
            request = self.context.get('request', None)
            entry = Diary(user=request.user,
                          dtype=attrs['dtype'],
                          created=attrs['created'],
                          entry=attrs['entry'])
            return entry
        instance.entry = attrs['entry']
        instance.created = attrs['created']
        return instance

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
            return instance
        user = self.context['request'].user
        v = SurveyResponse(survey=attrs['survey'], creator=user, \
                           created=attrs['created'])
            
        self.responses_tosave = attrs['responses']
        return v
        
    def save(self, **kwargs):
        ret = super(self.__class__, self).save(**kwargs)
        #print(ret)
        for qr in self.responses_tosave:
            qr.rid = ret
            qr.full_clean()
            qr.save()
        return ret
      
    
        
