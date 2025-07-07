from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.middleware.csrf import get_token
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from .models import Post, Comment, Community
from .serializers import PostSerializer, CommunitySerializer
from django.views.decorators.csrf import ensure_csrf_cookie
from .serializers import ProfileSerializer
from .models import Profile, FriendRequest
from .models import UserProfile
from .serializers import PrivacySerializer, BlockUserSerializer, UserSerializer
from .models import Notification
from .serializers import NotificationSerializer
from django.core.exceptions import PermissionDenied


# -------------------- Auth --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({'message': 'Logged in'})
    else:
        return JsonResponse({'message': 'Invalid credentials'}, status=401)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return JsonResponse({'message': 'Username and password required'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({'message': 'Username already exists'}, status=400)

    User.objects.create_user(username=username, password=password)
    return JsonResponse({'message': 'User created'}, status=201)

@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out successfully."})

@api_view(['GET'])
def user_view(request):
    if request.user.is_authenticated:
        return JsonResponse({'username': request.user.username})
    else:
        return JsonResponse({'isAuthenticated': False}, status=401)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user(request):
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
    })
    
@api_view(['GET'])
@permission_classes([AllowAny])  # ← TEMPORARY for testing
def all_users(request):
    users = User.objects.all()
    data = [{"id": user.id, "username": user.username} for user in users]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def registered_users(request):
    profiles = Profile.objects.select_related('user').all()
    serializer = ProfileSerializer(profiles, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old = request.data.get("old_password")
    new = request.data.get("new_password")
    if not user.check_password(old):
        return Response({"message": "Old password is incorrect."}, status=400)
    user.set_password(new)
    user.save()
    Notification.objects.create(user=user, message="Your password was changed.")
    return Response({"message": "Password changed successfully."})

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_account(request):
    password = request.data.get("password")
    user = request.user

    if not password:
        return Response({"message": "Password is required."}, status=400)

    user = authenticate(username=user.username, password=password)
    if user:
        user.delete()
        return Response({"message": "Account deleted successfully."})
    else:
        return Response({"message": "Incorrect password."}, status=403)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_privacy(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    serializer = PrivacySerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Privacy updated."})
    return Response(serializer.errors, status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def block_user(request):
    serializer = BlockUserSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        try:
            to_block = User.objects.get(username=username)
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            profile.blocked_users.add(to_block)
            return Response({"message": f"User '{username}' blocked."})
        except User.DoesNotExist:
            return Response({"message": "User not found."}, status=404)
    return Response(serializer.errors, status=400)



# -------------------- Posts --------------------
@api_view(['GET'])
def get_posts(request):
    posts = Post.objects.select_related('user').order_by('-created_at')
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post(request):
    parser_classes = (MultiPartParser, FormParser)
    serializer = PostSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        post = serializer.save(user=request.user)
        post.refresh_from_db()
        full_serializer = PostSerializer(post, context={'request': request})
        return Response(full_serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)

    text = request.data.get('text')
    if not text:
        return Response({'error': 'Comment text is required.'}, status=400)

    Comment.objects.create(post=post, user=request.user, text=text)
    Notification.objects.create(user=post.user, message=f"{request.user.username} commented on your post.")
    post.refresh_from_db()
    serializer = PostSerializer(post, context={'request': request})
    return Response(serializer.data)


# -------------------- Communities --------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_communities(request):
    communities = Community.objects.filter(members=request.user)
    serializer = CommunitySerializer(communities, many=True, context={'request': request})
    return Response(serializer.data)


class CommunityListCreateView(generics.ListCreateAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        community = serializer.save(created_by=self.request.user, members=[self.request.user])
        Notification.objects.create(user=self.request.user, message=f"You created the community '{community.name}'.")

class CommunityDetailUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Community.objects.filter(members=self.request.user)

    def perform_update(self, serializer):
        # Only allow the creator to update
        community = self.get_object()
        if community.created_by != self.request.user:
            raise PermissionDenied("Only the creator can update this community.")
        serializer.save()

    def perform_destroy(self, instance):
        # Only allow the creator to delete
        if instance.created_by != self.request.user:
            raise PermissionDenied("Only the creator can delete this community.")
        instance.delete()

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

class CreateCommunityView(generics.CreateAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer

    def perform_create(self, serializer):
        print("=== perform_create ===")
        print("request.user:", self.request.user)
        print("user.is_authenticated:", self.request.user.is_authenticated)
        print("validated_data:", serializer.validated_data)
        community = serializer.save(created_by=self.request.user)
        Notification.objects.create(user=self.request.user, message=f"You created the community '{community.name}'.")

    def create(self, request, *args, **kwargs):
        print("=== create ===")
        print("request.data:", request.data)
        return super().create(request, *args, **kwargs)

from django.db.models import Q

class UserCommunitiesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        communities = Community.objects.filter(
            Q(members=request.user) | Q(created_by=request.user)
        ).distinct()
        serializer = CommunitySerializer(communities, many=True)
        return Response(serializer.data)
    
class MyProfileView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)
        except:
            return Response({'error': 'Profile not found'}, status=404)

    def put(self, request):
        profile = request.user.profile

        print("FILES:", request.FILES)  # Add this line

        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            Notification.objects.create(user=request.user, message="Your profile was updated.")
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

  # -------------search and notifi


@api_view(['GET'])
@permission_classes([AllowAny])
def search_view(request):
    query = request.GET.get('q', '').strip()

    if not query:
        return Response({'users': [], 'communities': [], 'sent_requests': []})

    matched_users = User.objects.filter(username__icontains=query)
    matched_communities = Community.objects.filter(name__icontains=query)

    user_data = UserSerializer(matched_users, many=True, context={'request': request}).data
    community_data = CommunitySerializer(matched_communities, many=True, context={'request': request}).data

    # Get sent friend request user IDs if logged in
    sent_requests = []
    if request.user.is_authenticated:
        sent_requests = FriendRequest.objects.filter(sender=request.user).values_list('receiver__id', flat=True)

    return Response({
        'users': user_data,
        'communities': community_data,
        'sent_requests': list(sent_requests)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    user = request.user
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def has_unread_notifications(request):
    has_unread = Notification.objects.filter(user=request.user, is_read=False).exists()
    return Response({"has_unread": has_unread})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notifications_as_read(request):
    unread = Notification.objects.filter(user=request.user, read=False)
    count = unread.count()
    unread.update(read=True)

    return Response({
        "message": f"{count} notifications marked as read",
        "success": True
    })
