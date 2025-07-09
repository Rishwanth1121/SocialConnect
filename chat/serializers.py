from rest_framework import serializers
from .models import ChatMessage
from django.contrib.auth.models import User

class ChatMessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'community', 'user', 'username', 'message', 'timestamp']
        read_only_fields = ['user', 'timestamp']
