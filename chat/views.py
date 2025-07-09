from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ChatMessage
from .serializers import ChatMessageSerializer

class CommunityChatMessagesView(APIView):
    def get(self, request, pk):
        messages = ChatMessage.objects.filter(community_id=pk).order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
