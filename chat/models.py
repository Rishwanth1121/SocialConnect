from django.db import models
from django.contrib.auth.models import User
from social.models import Community

class ChatMessage(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.sender} - {self.community} - {self.timestamp}'

class PrivateMessage(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    recipient = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    audio = models.FileField(upload_to='private_chat/audio/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
