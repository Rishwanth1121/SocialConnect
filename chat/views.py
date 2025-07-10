from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from .models import PrivateMessage
from .serializers import PrivateMessageSerializer
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q

class CommunityChatMessagesView(APIView):
    def get(self, request, pk):
        messages = ChatMessage.objects.filter(community_id=pk).order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
    
class PrivateChatMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, friend_id):
        friend = get_object_or_404(User, id=friend_id)
        messages = PrivateMessage.objects.filter(
            Q(sender=request.user, recipient=friend) |
            Q(sender=friend, recipient=request.user)
        ).order_by('timestamp')
        serializer = PrivateMessageSerializer(messages, many=True)
        return Response(serializer.data)