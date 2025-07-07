from rest_framework import serializers
from .models import Post, Comment
from django.contrib.auth import get_user_model
from .models import Community
from .models import Profile
from .models import UserProfile, Notification

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = [
            'user', 'profile_image', 'role',
            'facebook', 'twitter', 'instagram', 'linkedin'
        ]

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text']

class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'user', 'content', 'image', 'created_at', 'likes_count', 'is_liked', 'comments']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        return request.user in obj.likes.all() if request and request.user.is_authenticated else False

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

class CommunitySerializer(serializers.ModelSerializer):
    # Accept user IDs when writing
    members = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all(), write_only=True
    )
    # Show full user data when reading
    members_info = UserSerializer(source='members', many=True, read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Community
        fields = [
            'id', 'name', 'description', 'purpose',
            'profile_photo', 'created_by', 'members', 'members_info'
        ]

    def create(self, validated_data):
        members = validated_data.pop('members', [])
        community = Community.objects.create(**validated_data)
        community.members.set(members)
        return community

    def update(self, instance, validated_data):
        members = validated_data.pop('members', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if members is not None:
            instance.members.set(members)
        instance.save()
        return instance

class PrivacySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['visibility', 'is_private']

class BlockUserSerializer(serializers.Serializer):
    username = serializers.CharField()

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']