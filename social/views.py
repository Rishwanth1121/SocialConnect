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
from rest_framework import generics, permissions
from .models import Post, Comment, Community
from .serializers import PostSerializer, CommunitySerializer
from django.views.decorators.csrf import ensure_csrf_cookie
from .serializers import ProfileSerializer
from .models import Profile, FriendRequest, Friendship
from .models import UserProfile
from .serializers import PrivacySerializer, BlockUserSerializer, UserSerializer
from .models import Notification
from .serializers import NotificationSerializer
from django.core.exceptions import PermissionDenied
from rest_framework.decorators import parser_classes
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
import traceback
import json
from rest_framework.generics import RetrieveAPIView
from django.db.models.signals import post_save
from django.dispatch import receiver


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

@api_view(["GET"])
def user_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'isAuthenticated': False}, status=401)

    return JsonResponse({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
    })

@api_view(['GET'])
def current_user(request):
    if request.user.is_authenticated:
        return Response({'id': request.user.id, 'username': request.user.username})
    return Response({'detail': 'Not authenticated'}, status=403)

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    instance.profile.save()

@api_view(['GET'])
@permission_classes([AllowAny])
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friends(request):
    friendships = Friendship.objects.filter(from_user=request.user)
    friends = [{'id': f.to_user.id, 'username': f.to_user.username} for f in friendships]
    return Response(friends)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friends_list_view(request):
    friendships = Friendship.objects.filter(from_user=request.user)
    friends = []

    for friendship in friendships:
        friend = friendship.to_user
        profile = getattr(friend, 'profile', None)

        try:
            profile_image_url = (
                profile.profile_image.url if profile and profile.profile_image and hasattr(profile.profile_image, 'url') else None
            )
        except Exception:
            profile_image_url = None

        friends.append({
            'id': friend.id,
            'username': friend.username,
            'email': friend.email,
            'profile_picture': profile_image_url,  # frontend expects 'profile_picture'
            'friend_since': friendship.created_at.strftime('%Y-%m-%d') if hasattr(friendship, 'created_at') else None,
        })

    return Response(friends)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_friend(request, friend_id):
    try:
        friend = User.objects.get(id=friend_id)

        # Remove both sides of the friendship
        Friendship.objects.filter(from_user=request.user, to_user=friend).delete()
        Friendship.objects.filter(from_user=friend, to_user=request.user).delete()

        Notification.objects.create(
            user=friend,
            message=f"{request.user.username} removed you from their friends."
        )

        return Response({"message": "Friend removed successfully."})
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def blocked_users(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    blocked = profile.blocked_users.all()
    return Response([
        {"id": user.id, "username": user.username}
        for user in blocked
    ])

# views.py
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unblock_user(request):
    username = request.data.get("username")
    if not username:
        return Response({"error": "Username required"}, status=400)
    try:
        to_unblock = User.objects.get(username=username)
        profile = UserProfile.objects.get(user=request.user)
        profile.blocked_users.remove(to_unblock)
        return Response({"message": f"User '{username}' unblocked."})
    except User.DoesNotExist:
        return Response({"message": "User not found."}, status=404)
    except UserProfile.DoesNotExist:
        return Response({"message": "Profile not found."}, status=404)



# -------------------- Posts --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_posts(request):
    posts = Post.objects.all().order_by('-created_at')
    serializer = PostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_posts(request):
    user = request.user
    posts = Post.objects.filter(user=user).order_by('-created_at')
    serializer = PostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_post(request):
    try:
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            post = serializer.save(user=request.user)
            post.refresh_from_db()
            full_serializer = PostSerializer(post, context={'request': request})
            return Response(full_serializer.data, status=201)
        return Response(serializer.errors, status=400)
    except Exception as e:
        print("🔥 CREATE POST ERROR:", str(e))
        traceback.print_exc()
        return Response({'error': 'Server error'}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)

    user = request.user
    liked = False

    if user in post.likes.all():
        post.likes.remove(user)
    else:
        post.likes.add(user)
        liked = True

        if post.user != user:
            Notification.objects.create(
                user=post.user,
                message=f"{user.username} liked your post."
            )

    post.save()
    serializer = PostSerializer(post, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)

    text = request.data.get('text', '').strip()
    if not text:
        return Response({'error': 'Empty comment'}, status=400)

    comment = Comment.objects.create(post=post, user=request.user, text=text)

    if post.user != request.user:
        Notification.objects.create(
            user=post.user,
            message=f"{request.user.username} commented on your post."
        )

    serializer = PostSerializer(post, context={'request': request})
    return Response(serializer.data)

    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)

        if post.user != request.user:
            return Response({'error': 'You do not have permission to delete this post.'}, status=403)

        # Notify the user themselves
        Notification.objects.create(
            user=request.user,
            message=f"You deleted your post: \"{post.content[:30]}...\"" if post.content else "You deleted a post."
        )

        post.delete()
        return Response({'success': True})
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)

    
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
    
class EditCommunityMembersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        community = get_object_or_404(Community, pk=pk)

        if request.user != community.created_by:
            return Response(
                {"detail": "Only the community creator can edit members."},
                status=status.HTTP_403_FORBIDDEN
            )

        members = request.data.get("members", [])

        if not isinstance(members, list) or not all(isinstance(m, int) for m in members):
            return Response(
                {"members": ["Invalid format. Must be a list of user IDs."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        users = User.objects.filter(id__in=members)
        community.members.set(users)
        community.save()

        Notification.objects.create(
            user=request.user,
            message=f"You updated members of community '{community.name}'."
        )

        serializer = CommunitySerializer(community)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class CommunityDetailView(RetrieveAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer

@method_decorator(csrf_exempt, name='dispatch')
class DeleteCommunityView(generics.DestroyAPIView):
    queryset = Community.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        community = self.get_object()
        if community.created_by != request.user:
            return Response({'error': 'Not allowed'}, status=403)

        # Notify creator before deleting
        Notification.objects.create(
            user=request.user,
            message=f"You deleted the community '{community.name}'."
        )

        community.delete()
        return Response({'message': 'Deleted'}, status=204)

    
class EditCommunityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            community = Community.objects.get(pk=pk)
            if community.created_by != request.user:
                return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

            serializer = CommunitySerializer(community, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()

                # Notify the user about the update
                Notification.objects.create(
                    user=request.user,
                    message=f"You edited the community '{community.name}'."
                )

                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Community.DoesNotExist:
            return Response({'detail': 'Community not found'}, status=status.HTTP_404_NOT_FOUND)


class AddCommunityMembersView(generics.UpdateAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        community = self.get_object()
        members = request.data.get('members', [])
        if isinstance(members, str):
            try:
                members = json.loads(members)
            except:
                return Response({'error': 'Invalid member list'}, status=400)

        if not isinstance(members, list):
            return Response({'error': 'Members should be a list'}, status=400)

        community.members.add(*members)
        return Response({'status': 'Members added successfully'})


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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    user_id = request.data.get("user_id")

    if not user_id:
        return Response({"error": "user_id is required"}, status=400)

    if int(user_id) == request.user.id:
        return Response({"error": "You can't send a request to yourself"}, status=400)

    receiver = get_object_or_404(User, id=user_id)

    # Check for duplicates
    if FriendRequest.objects.filter(sender=request.user, receiver=receiver, is_active=True).exists():
        return Response({"error": "Friend request already sent"}, status=400)

    friend_request = FriendRequest.objects.create(sender=request.user, receiver=receiver)

    Notification.objects.create(
        user=receiver,
        message=f"{request.user.username} sent you a friend request",
        type="friend_request",
        request_id=friend_request.id
    )

    return Response({"message": "Friend request sent"}, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_friend_request(request, pk):
    action = request.data.get("action")

    try:
        friend_request = FriendRequest.objects.get(id=pk, receiver=request.user)
    except FriendRequest.DoesNotExist:
        return Response({"error": "Friend request not found."}, status=404)

    if action == "accept":
        # Create a bidirectional friendship
        Friendship.objects.get_or_create(from_user=request.user, to_user=friend_request.sender)
        Friendship.objects.get_or_create(from_user=friend_request.sender, to_user=request.user)

        # Delete friend request and related notification
        friend_request.delete()
        Notification.objects.filter(request_id=pk, user=request.user).delete()

        return Response({"message": "Friend request accepted."})

    elif action == "cancel":
        friend_request.delete()
        Notification.objects.filter(request_id=pk, user=request.user).delete()
        return Response({"message": "Friend request canceled."})

    return Response({"error": "Invalid action."}, status=400)


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
    try:
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"success": True})
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)

