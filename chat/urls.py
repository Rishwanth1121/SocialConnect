from django.urls import path
from .views import CommunityChatMessagesView

urlpatterns = [
    path('communities/<int:pk>/messages/', CommunityChatMessagesView.as_view(), name='community-chat-messages'),
]
