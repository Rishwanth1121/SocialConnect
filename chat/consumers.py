import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from .models import ChatMessage
from social.models import Community  # assuming your Community model is in `social`

class CommunityChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.community_id = self.scope['url_route']['kwargs']['community_id']
        self.room_group_name = f'community_chat_{self.community_id}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        user = self.scope["user"]

        username = user.username if user and not isinstance(user, AnonymousUser) else 'Anonymous'

        await self.save_message(user, self.community_id, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': username,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
        }))

    @database_sync_to_async
    def save_message(self, user, community_id, message):
        try:
            community = Community.objects.get(id=community_id)
            ChatMessage.objects.create(
                sender=user if user and not isinstance(user, AnonymousUser) else None,
                community=community,
                message=message
            )
        except Community.DoesNotExist:
            pass  # Optional: log or handle this
