from django.urls import path
from .views import PrivateChatMessagesView, CommunityChatMessagesView

urlpatterns = [
    path('private/<int:friend_id>/messages/', PrivateChatMessagesView.as_view(), name='private-chat-messages'),
    path('communities/<int:pk>/messages/', CommunityChatMessagesView.as_view(), name='community-chat-messages'),
]
