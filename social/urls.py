from django.urls import path
from .views import login_view, logout_view, get_csrf_token, user_view, register_view,CommunityListCreateView, CommunityDetailUpdateDeleteView,user_communities
from . import views
from .views import CreateCommunityView
from .views import all_users
from .views import UserCommunitiesView
from .views import MyProfileView, registered_users, search_view
from .views import delete_account

urlpatterns = [
    path('login/', login_view),
    path('logout/', logout_view),
    path('csrf/', get_csrf_token),
    path('user/', user_view),
    path('register/', register_view),  # 👈 ADD THIS
    path('posts/', views.get_posts, name='get-posts'),
    path('posts/create/', views.create_post, name='create_post'),
    path('posts/<int:post_id>/comment', views.add_comment, name='add_comment'),
    path('communities/', views.user_communities, name='user-communities'),
    path('api/communities/', CommunityListCreateView.as_view(), name='community-list-create'),
    path('api/communities/user/', user_communities, name='user-communities'),
    path('api/communities/<int:pk>/', CommunityDetailUpdateDeleteView.as_view(), name='community-detail'),
    path('communities/create/', CreateCommunityView.as_view(), name='create-community'),
    path('users/', all_users, name='all-users'),
    path('communities/user/', UserCommunitiesView.as_view(), name='user-communities'),
    path('profile/', MyProfileView.as_view(), name='my-profile'),
    path('registered_users/', registered_users, name='registered-users'),
    path("change-password/", views.change_password),
    path("delete-account/", delete_account, name="delete_account"),
    path("privacy-settings/", views.update_privacy),
    path("block-user/", views.block_user),
    path('search', search_view, name='search'),
    path("notifications/", views.get_notifications, name="get-notifications"),
]
