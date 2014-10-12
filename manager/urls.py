from django.conf.urls import patterns, include, url
from manager import views, export

# Routers provide an easy way of automatically determining the URL conf.

urlpatterns = patterns('',
    url(r'^$', views.Index.as_view(), name='index'),
    url(r'^mark-read$', views.MarkReadView.as_view(), name='mark_read'),
    url(r'^help$', views.Help.as_view(), name='help'),
    url(r'^login/?$', views.login_user, name='login'),
    url(r'^logout$', views.logout_user, name='logout'),
    url(r'^backup$', views.backup_database, name='backup_database'),
    url(r'^restore$', views.RestoreDatabaseView.as_view(), name='restore_database'),
    url(r'^account$', views.PersonalDetailsView.as_view(), name='account_details'),
    url(r'^users$', views.UserListView.as_view(), name='user_list'),
    url(r'^user/(?P<pk>\d+)$', views.UserDetailView.as_view(), 
        name='user_detail'),
    url(r'^user/(?P<pk>\d+)/delete$', views.UserDeleteView.as_view(),
        name='user_delete'),
    url(r'^user/add$', views.UserCreateView.as_view(), name='user_add'),
    url(r'^survey/(?P<pk>\d+)$', views.SurveyListView.as_view(), name='response_list'),
    url(r'^survey/(?P<spk>\d+)/by/(?P<upk>\d+)$', views.SurveyUserListView.as_view(), name='user_response_list'),
    url(r'^survey/(?P<spk>\d+)/by/(?P<upk>\d+)/export$', views.export_by_user, name='export_by_user'),
    url(r'^survey/(?P<spk>\d+)/by/(?P<upk>\d+)/delete$', views.SurveyUserDeleteView.as_view(), name='user_response_delete'),
    url(r'^survey/(?P<pk>\d+)/export', views.export_all, name='export_all'),
    url(r'^survey/(?P<pk>\d+)/delete', views.SurveyDeleteView.as_view(), name='response_delete')
)
