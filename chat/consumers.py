import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import PrivateMessage
from chat.utils import get_private_room_name
from datetime import datetime

User = get_user_model()

class PrivateChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.other_user_id = self.scope['url_route']['kwargs']['user_id']
        self.other_user = await self.get_user(self.other_user_id)

        if not self.user.is_authenticated or not self.other_user:
            await self.close()
            return

        self.room_name = self.get_room_name(self.user.id, int(self.other_user_id))
        self.room_group_name = f"private_chat_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data.get('content', '')
        audio = data.get('audio')  # To be handled later

        message_obj = await self.save_message(self.user, self.other_user, content)

        await self.channel_layer.group_send(
    self.room_group_name,
    {
        'type': 'chat_message',
        'content': content,
        'sender': self.scope['user'].username
    }
)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'content': event['content'],
            'sender_id': self.user.id,
            'sender_name': self.user.username,
            'timestamp': str(datetime.now())
    }))

    def get_room_name(self, id1, id2):
        return f"{min(id1, id2)}_{max(id1, id2)}"

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, sender, recipient, content):
        return PrivateMessage.objects.create(sender=sender, recipient=recipient, content=content)

# --- No changes to CommunityChatConsumer ---

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
        from django.contrib.auth.models import AnonymousUser

        if isinstance(user, AnonymousUser):
            user = None

        try:
            community = Community.objects.get(id=community_id)
            ChatMessage.objects.create(sender=user, community=community, message=message)
        except Community.DoesNotExist:
            pass
