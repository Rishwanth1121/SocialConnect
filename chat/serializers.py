from rest_framework import serializers
from .models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ['id', 'message', 'sender', 'timestamp']

    def get_sender(self, obj):
        return obj.sender.username if obj.sender else "Anonymous"
