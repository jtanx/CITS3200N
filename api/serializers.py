from rest_framework import serializers, permissions
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
	fields = ('id', 'created', 'submitted', 'entry', 'dtype')
	read_only_fields = ('id',)
	
	
    def restore_object(self, attrs, instance=None):
        if instance is None:
            request = self.context.get('request', None)
            entry = Diary(user=request.user,
                          dtype=attrs['dtype'],
                          created=attrs['created'],
                          entry=attrs['entry'],
                          submitted=attrs['submitted'])
            return entry
        instance.entry = attrs['entry']
        instance.created = attrs['created']
        instance.submitted = attrs['submitted']
        return instance

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyQuestion

class SurveySerializer(serializers.ModelSerializer):
    class QuestionsField(serializers.Field):
        def to_native(self, obj):
            queryset = SurveyQuestion.objects.filter(parent=obj)
            serializer = QuestionSerializer(queryset, many=True)
            return serializer.data
    
    class Meta:
        model = Survey
        fields = ('id', 'name', 'description', 'questions')
    
    questions = QuestionsField()
    
class QuestionResponseSerializer(serializers.ModelSerializer):
    def restore_object(self, attrs, instance=None):
        if instance is None:
            print(self.context)
            return QuestionResponse(rid=self.parent, **attrs)
        return instance
    class Meta:
        model = QuestionResponse
        fields = ('qid', 'entry')
        
class SurveyResponseSerializer(serializers.ModelSerializer):
    class ResponseField(serializers.WritableField):
        def to_native(self, obj):
            queryset = QuestionResponse.objects.filter(rid=obj)
            serializer = QuestionResponseSerializer(data=queryset, many=True)
            return serializer.data
            
        def from_native(self, value):
            stream = StringIO(value)
            try:
                data = JSONParser().parse(stream)
            except ParseError:
                raise serializers.ValidationError("Invalid JSON format for responses")
            print(self.context['view'])
            responses = QuestionResponseSerializer(data=data, many=True)
            print (responses.is_valid())
            return None
    class Meta:
        model = SurveyResponse
        fields = ('survey', 'created', 'submitted', 'responses')
        read_only_fields = ('created',)
        
    responses = ResponseField()
        
