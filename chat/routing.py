from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<community_id>\d+)/$', consumers.CommunityChatConsumer.as_asgi()),
    re_path(r'ws/private-chat/(?P<user_id>\d+)/$', consumers.PrivateChatConsumer.as_asgi()),
]
