from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.views.generic.base import TemplateView
import api.urls
import manager.urls
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'ftracker.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^$', TemplateView.as_view(template_name="temp_index.html"), name="home"),
    url(r'^api/', include(api.urls), name='api'),
    url(r'^manage/', include(manager.urls), name='manage'),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^admin/', include(admin.site.urls), name='admin'),
)
