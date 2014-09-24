from django.conf.urls import patterns, include, url
from manager import views, export

# Routers provide an easy way of automatically determining the URL conf.

urlpatterns = patterns('manager.views',
    url(r'^$', views.Index.as_view(), name='index'),
    url(r'^login/?$', views.login_user, name='login'),
    url(r'^logout$', views.logout_user, name='logout'),
    url(r'^account$', views.PersonalDetailsView.as_view(), name='account_details'),
    url(r'^users$', views.UserListView.as_view(), name='user_list'),
    url(r'^user/(?P<pk>\d+)$', views.UserDetailView.as_view(), 
        name='user_detail'),
    url(r'^user/delete/(?P<pk>\d+)$', views.UserDeleteView.as_view(),
        name='user_delete'),
    url(r'^user/add$', views.UserCreateView.as_view(), name='user_add'),
    url(r'^surveys/(?P<pk>\d+)$', views.SurveyListView.as_view(), name='response_list'),
    url(r'^survey/(?P<pk>\d+)/export', export.export_all, name='export_all'),
    url(r'^survey/(?P<pk2>\d+)/export/(?P<pk2>\d+)$', export.export_for_user, name='export_specific')
)
