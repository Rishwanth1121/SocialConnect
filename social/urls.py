from django.urls import path
from .views import login_view, logout_view, get_csrf_token, user_view, register_view,CommunityListCreateView, CommunityDetailUpdateDeleteView, user_communities
from . import views
from .views import CreateCommunityView
from .views import all_users, current_user, send_friend_request, respond_to_friend_request, get_friends, remove_friend, friends_list_view
from .views import UserCommunitiesView
from .views import MyProfileView, registered_users, search_view
from .views import delete_account, get_my_posts
from .views import has_unread_notifications, mark_notifications_as_read
from .views import DeleteCommunityView, AddCommunityMembersView, EditCommunityMembersView, CommunityDetailView, EditCommunityView

print("✅ social.urls loaded")

urlpatterns = [
    path('login/', login_view),
    path('logout/', logout_view),
    path('csrf/', get_csrf_token),
    path('user/', user_view, name='user-basic'),
    path('current_user/', current_user, name='current_user'),

    path('register/', register_view),  # 👈 ADD THIS
    path('posts/', views.get_posts, name='get-posts'),
    path('posts/create/', views.create_post, name='create_post'),
    path('posts/my/', views.get_my_posts, name='get_my_posts'),
    path('posts/<int:post_id>/like/', views.like_post, name='like_post'),
    path('posts/<int:post_id>/comment/', views.add_comment, name='add_comment'),
    path('posts/<int:post_id>/delete/', views.delete_post, name='delete_post'),


    path('communities/', views.user_communities, name='user-communities'),
    path('communities/<int:pk>/', CommunityDetailView.as_view(), name='community-detail'),
    path('communities/<int:pk>/delete/', DeleteCommunityView.as_view(), name='delete_community'),
    path('communities/<int:pk>/edit_members/', EditCommunityMembersView.as_view(), name='edit-community-members'),
    path('communities/<int:pk>/edit/', EditCommunityView.as_view(), name='edit-community'),
    path('communities/', CommunityListCreateView.as_view(), name='community-list-create'),
    path('communities/user/', user_communities, name='user-communities'),
    path('communities/<int:pk>/', CommunityDetailUpdateDeleteView.as_view(), name='community-detail'),
    path('communities/create/', CreateCommunityView.as_view(), name='create-community'),
    path('users/', all_users, name='all-users'),
    path('communities/user/', UserCommunitiesView.as_view(), name='user-communities'),


    path('profile/', MyProfileView.as_view(), name='my-profile'),
    path('registered_users/', registered_users, name='registered-users'),
    path("change-password/", views.change_password),
    path("delete-account/", delete_account, name="delete_account"),
    path("privacy-settings/", views.update_privacy),
    path("block-user/", views.block_user),
    path("blocked-users/", views.blocked_users),
    path("unblock-user/", views.unblock_user),


    path('search', search_view, name='search'),
    path('user/friends/', friends_list_view, name='friends-list'),
    path('friends/list/', get_friends, name='get-friends'),
    path('friends/request/', send_friend_request),
    path('friends/respond/<int:pk>/', respond_to_friend_request, name='respond-friend-request'),
    path('friends/remove/<int:friend_id>/', remove_friend, name='remove-friend'),
    path("notifications/", views.get_notifications, name="get-notifications"),
    path('notifications/has_unread/', has_unread_notifications),
    path('notifications/mark_read/', mark_notifications_as_read, name='mark_notifications')
]
