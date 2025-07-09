import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

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
        message = data.get('message')
        username = data.get('username', 'Anonymous')
        user = self.scope['user']

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
        from .models import ChatMessage
        from social.models import Community
        from django.contrib.auth.models import AnonymousUser  # ✅ moved here

        if isinstance(user, AnonymousUser):
            user = None

        try:
            community = Community.objects.get(id=community_id)
            ChatMessage.objects.create(sender=user, community=community, message=message)
        except Community.DoesNotExist:
            pass
