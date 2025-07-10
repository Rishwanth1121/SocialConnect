from rest_framework import serializers
from .models import ChatMessage, PrivateMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ['id', 'message', 'sender', 'timestamp']

    def get_sender(self, obj):
        return obj.sender.username if obj.sender else "Anonymous"

class PrivateMessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source='sender.id')
    sender_name = serializers.CharField(source='sender.username')
    receiver_name = serializers.CharField(source='recipient.username')

    class Meta:
        model = PrivateMessage
        fields = ['id', 'sender_id', 'sender_name', 'receiver_name', 'content', 'timestamp']



