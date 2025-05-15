# api/urls.py
from django.urls import path
from . import views
from .views import *
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(title="ASW API", default_version='v1'),
    public=True,
)

urlpatterns = [
    # ISSUES
    path('issues/create/', views.create_issue),
    path('issues/<int:issue_id>/', views.get_issue),
    path('issues/', views.list_issues),
    path('issues/<int:issue_id>/edit/', views.edit_issue),
    path('issues/<int:issue_id>/delete/', views.delete_issue),
    ##path('issues/assign/', views.assign_issue),
    path('issues/<int:issue_id>/file/add/', views.add_file_to_issue),
    path('attachments/<int:file_id>/delete/', views.delete_file_from_issue),
    path('issues/bulk-insert/', views.bulk_insert_issues),
    path('issues/<int:issue_id>/comment/', views.add_comment),
    path('issues/<int:issue_id>/comments/', views.comments_by_issue),
    path('comments/delete/<int:comment_id>/', delete_comment, name='delete_comment'),
    ##path('issues/filter/', views.filter_issues),

    # USERS
    path('users/create/', views.create_user),
    path('users/<int:user_id>/assign-apikey/', views.assign_apikey_to_user),
    path('users/<int:user_id>/profile/', views.user_profile),
    path('users/<int:user_id>/profile/edit/', views.edit_user_profile),
    path('users/', views.list_users),
    path('users/<int:user_id>/comments/', views.comments_by_user),

    # SETTINGS
    path('settings/tipos', views.list_tipos),
    path('settings/createtipo/', views.create_tipo),
    path('settings/<int:setting_id>/deletetipo/', views.delete_tipo),
    path('settings/estados', views.list_estados),
    path('settings/createestado/', views.create_estado),
    path('settings/<int:setting_id>/deleteestado/', views.delete_estado),
    path('settings/prioridades', views.list_prioridades),
    path('settings/createprioridad/', views.create_prioridad),
    path('settings/<int:setting_id>/deleteprioridad/', views.delete_prioridad),
    path('settings/severidades', views.list_severidades),
    path('settings/createseveridad/', views.create_severidad),
    path('settings/<int:setting_id>/deleteseveridad/', views.delete_severidad),
    path('settings/<int:setting_id>/edit/', views.edit_setting),
]
