from rest_framework import serializers
from api.models import *

class DiaryTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiaryType

class DiarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Diary
	fields = ('timestamp', 'entry', 'dtype')
	
    def restore_object(self, attrs, instance=None):
        if instance is None:
            request = self.context.get('request', None)
            entry = Diary(user=request.user,
                          dtype=attrs['dtype'],
                          timestamp=attrs['timestamp'],
                          entry=attrs['entry'])
            return entry
        instance.entry = attrs['entry']
        instance.timestamp = attrs['timestamp']
        return instance
