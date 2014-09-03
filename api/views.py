from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from django.contrib.auth.models import User
from api.models import *
from api.serializers import *

class DiaryTypeViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (IsAuthenticated,)
    query_set = DiaryType.objects.all()
    serializer_class = DiaryTypeSerializer
    model = DiaryType


class DiaryViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = DiarySerializer
    model = Diary

    def get_queryset(self):
        return Diary.objects.filter(user=self.request.user)


