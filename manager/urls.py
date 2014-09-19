from django.conf.urls import patterns, include, url
from django.views.generic.base import TemplateView
from manager.views import *

# Routers provide an easy way of automatically determining the URL conf.

urlpatterns = patterns('manager.views',
    url(r'^',  TemplateView.as_view(template_name="index.html"), name='index'),
)
