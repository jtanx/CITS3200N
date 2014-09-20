from django.conf.urls import patterns, include, url
from manager import views

# Routers provide an easy way of automatically determining the URL conf.

urlpatterns = patterns('manager.views',
    url(r'^$', views.Index.as_view(), name='index'),
    url(r'^login/?$', views.login_user, name='login'),
    url(r'^logout$', views.logout_user, name='logout'),
    url(r'^users$', views.UserListView.as_view(), name='user_list'),
)
