# api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ISSUES
    path('issues/create/', views.create_issue),
    path('issues/<int:issue_id>/', views.get_issue),
    path('issues/', views.list_issues),
    path('issues/<int:issue_id>/edit/', views.edit_issue),
    path('issues/<int:issue_id>/delete/', views.delete_issue),
    path('issues/assign/', views.assign_issue),
    path('issues/<int:issue_id>/file/add/', views.add_file_to_issue),
    path('files/<int:file_id>/delete/', views.delete_file_from_issue),
    path('issues/bulk-insert/', views.bulk_insert_issues),
    path('issues/<int:issue_id>/comment/', views.add_comment),
    path('issues/filter/', views.filter_issues),

    # USERS
    path('users/<int:user_id>/assign-apikey/', views.assign_apikey_to_user),
    path('users/<int:user_id>/profile/', views.user_profile),
    path('users/<int:user_id>/profile/edit/', views.edit_user_profile),

    # SETTINGS
    path('settings/', views.list_settings),
    path('settings/create/', views.create_setting),
    path('settings/<int:setting_id>/delete/', views.delete_setting),
    path('settings/<int:setting_id>/edit/', views.edit_setting),
]
