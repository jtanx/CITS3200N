from rest_framework import serializers, permissions
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

class SurveySerializer(serializers.ModelSerializer):
    class Meta:
        model = Survey
        #fields = ('name', 'description')
