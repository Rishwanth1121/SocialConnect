from rest_framework import generics, permissions
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from social.models import Community

class CommunityChatMessagesView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        community_id = self.kwargs['pk']
        return ChatMessage.objects.filter(community_id=community_id).order_by('timestamp')

    def perform_create(self, serializer):
        community_id = self.kwargs['pk']
        community = Community.objects.get(id=community_id)
        serializer.save(user=self.request.user, community=community)
