from django.shortcuts import render
from rest_framework import viewsets, generics, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from django.contrib.auth.models import User
from api.models import *
from api.serializers import *
from django.utils import timezone

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


class DiaryTypeViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (IsAuthenticated,)
    query_set = DiaryType.objects.all()
    serializer_class = DiaryTypeSerializer
    model = DiaryType

class DiaryViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, IsRecent)
    serializer_class = DiarySerializer
    model = Diary

    def get_queryset(self):
        return Diary.objects.filter(user=self.request.user)


class SurveyViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = SurveySerializer
    model = Survey
    query_set = Survey.objects.all()
    
class SurveySubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = SurveyResponseSerializer
    model = SurveyResponse
    
    def get_queryset(self):
        return SurveyResponse.objects.filter(creator=self.request.user)
