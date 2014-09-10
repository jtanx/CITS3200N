from django.conf.urls import patterns, include, url
from rest_framework import routers
from api.views import *

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'diary', DiaryViewSet)
router.register(r'dtype', DiaryTypeViewSet)
router.register(r'surveys', SurveyViewSet)
router.register(r'survey', SurveySubmissionViewSet)

urlpatterns = patterns('api.views',
    url(r'^', include(router.urls))
)
