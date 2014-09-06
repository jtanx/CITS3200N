from django.shortcuts import render
from rest_framework import viewsets
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


