from django.shortcuts import render
from rest_framework import viewsets, generics, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from StringIO import StringIO
from rest_framework.parsers import JSONParser
from rest_framework.exceptions import ParseError
from django.contrib.auth.models import User
from api.models import *
from api.serializers import *
from django.utils import timezone
import datetime

UPDATE_METHODS = ['PUT', 'PATCH', 'DELETE']

class IsRecent(permissions.BasePermission):
    '''Check if the entry was recent (within 1 week; non admins only)'''

    def has_object_permission(self, request, view, obj):
        if request.user and not request.user.is_staff:
            if request.method in UPDATE_METHODS and obj.submitted:
                delta = timezone.now() - obj.submitted
                return delta.days < 7
        return True
        
# ViewSets define the view behavior.
class UserViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,IsAdminUser)
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
class InfoView(APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = InfoSerializer
    model = User
    
    def get(self, request, **kwargs):
        req = InfoSerializer(request.user)
        return Response(data=req.data)

class SurveyViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = SurveySerializer
    model = Survey
    query_set = Survey.objects.all()
    
class SurveySubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, IsRecent)
    serializer_class = SurveyResponseSerializer
    model = SurveyResponse
    
    def get_queryset(self):
        '''Restrict the query set to those created by the user and submitted in
           the past week.'''
        thisweek = timezone.now() - datetime.timedelta(days = 7)
        qs = SurveyResponse.objects.filter(creator=self.request.user)
        qs = qs.filter(submitted__gt = thisweek)
        return qs
