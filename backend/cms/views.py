from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from .models import (
    User, Category, Tag, Post, Comment, Contact,
    PostLike, CommentLike, NewsletterSubscriber, SiteSettings
)
from .serializers import (
    UserSerializer, UserDetailSerializer,
    CategorySerializer,
    TagSerializer,
    PostListSerializer, PostDetailSerializer, PostCreateUpdateSerializer,
    CommentSerializer,
    ContactSerializer,
    PostLikeSerializer, CommentLikeSerializer,
    NewsletterSubscriberSerializer,
    SiteSettingsSerializer,
)
from .permissions import IsAuthorOrReadOnly, IsAdminOrReadOnly


# -------------------
# Custom Permissions
# -------------------
class IsAuthorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        # Allow reads to everyone, writes to authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user or request.user.is_staff


# -------------------
# User ViewSet
# -------------------
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Users with role-based access
    """
    queryset = User.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'email']
    ordering_fields = ['created_at', 'first_name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserDetailSerializer
        return UserSerializer

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get current user profile"""
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)


# -------------------
# Category ViewSet
# -------------------
class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Categories
    """
    queryset = Category.objects.annotate(posts_count=Count('posts'))
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


# -------------------
# Tag ViewSet
# -------------------
class TagViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Tags
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']
    ordering = ['name']

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most popular tags"""
        tags = Tag.objects.annotate(
            posts_count=Count('posts', filter=Q(posts__status='published'))
        ).order_by('-posts_count')[:10]
        serializer = self.get_serializer(tags, many=True)
        return Response(serializer.data)


# -------------------
# Post ViewSet
# -------------------
class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Posts with advanced filtering and search
    """
    queryset = Post.objects.all().order_by("-created_at")
    permission_classes = [IsAuthorOrAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['title', 'content', 'seo_description']
    ordering_fields = ['created_at', 'views', 'likes']
    ordering = ['-created_at']
    filterset_fields = ['status', 'category', 'author', 'is_featured']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PostCreateUpdateSerializer
        return PostListSerializer

    def perform_create(self, serializer):
        """Automatically assign the logged-in user as the author"""
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        """Update post and handle publishing"""
        post = serializer.save()
        # Auto-publish scheduled posts if time has passed
        if post.status == 'scheduled' and post.scheduled_for and post.scheduled_for <= timezone.now():
            post.status = 'published'
            post.published_at = timezone.now()
            post.save()

    def get_queryset(self):
        """Filter posts based on user permissions and status"""
        user = self.request.user
        if user.is_authenticated and (user.is_staff or user.role == 'admin'):
            return Post.objects.all()
        # Non-admin users see only published posts
        return Post.objects.filter(status='published')

    @action(detail=False, methods=['get'])
    def published(self, request):
        """Get all published posts"""
        posts = Post.objects.filter(status='published').order_by('-created_at')
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured posts"""
        posts = Post.objects.filter(status='published', is_featured=True).order_by('-created_at')[:5]
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent posts"""
        posts = Post.objects.filter(status='published').order_by('-created_at')[:10]
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get trending posts (most viewed)"""
        posts = Post.objects.filter(status='published').order_by('-views')[:10]
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def increment_views(self, request, pk=None):
        """Increment post views"""
        post = self.get_object()
        post.views += 1
        post.save()
        return Response({'views': post.views})

    @action(detail=True, methods=['post', 'delete'])
    def like(self, request, pk=None):
        """Like or unlike a post"""
        post = self.get_object()
        user = request.user

        if request.method == 'POST':
            like, created = PostLike.objects.get_or_create(post=post, user=user)
            if created:
                post.likes += 1
                post.save()
                return Response({'liked': True, 'likes': post.likes}, status=status.HTTP_201_CREATED)
            return Response({'liked': True, 'likes': post.likes})

        elif request.method == 'DELETE':
            try:
                like = PostLike.objects.get(post=post, user=user)
                like.delete()
                post.likes = max(0, post.likes - 1)
                post.save()
                return Response({'liked': False, 'likes': post.likes})
            except PostLike.DoesNotExist:
                return Response({'liked': False, 'likes': post.likes})

    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        """Get related posts by category and tags"""
        post = self.get_object()
        related_posts = Post.objects.filter(
            Q(category=post.category) | Q(tags__in=post.tags.all()),
            status='published'
        ).exclude(id=post.id).distinct()[:5]
        serializer = self.get_serializer(related_posts, many=True)
        return Response(serializer.data)


# -------------------
# Comment ViewSet
# -------------------
class CommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Comments with nested replies
    """
    queryset = Comment.objects.all().order_by("-created_at")
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['post', 'approved', 'parent']
    ordering_fields = ['created_at', 'likes']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        """Set author if user is authenticated"""
        if self.request.user.is_authenticated:
            serializer.save(author=self.request.user)
        else:
            serializer.save()

    def get_queryset(self):
        """Filter comments based on user role"""
        user = self.request.user
        if user.is_authenticated and (user.is_staff or user.role == 'admin'):
            return Comment.objects.all()
        # Non-admin users see only approved comments
        return Comment.objects.filter(approved=True, is_spam=False)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """Approve a comment (admin only)"""
        comment = self.get_object()
        comment.approved = True
        comment.is_spam = False
        comment.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def mark_as_spam(self, request, pk=None):
        """Mark comment as spam (admin only)"""
        comment = self.get_object()
        comment.is_spam = True
        comment.approved = False
        comment.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data)

    @action(detail=True, methods=['post', 'delete'])
    def like(self, request, pk=None):
        """Like or unlike a comment"""
        comment = self.get_object()
        user = request.user

        if request.method == 'POST':
            like, created = CommentLike.objects.get_or_create(comment=comment, user=user)
            if created:
                comment.likes += 1
                comment.save()
            return Response({'likes': comment.likes})

        elif request.method == 'DELETE':
            try:
                like = CommentLike.objects.get(comment=comment, user=user)
                like.delete()
                comment.likes = max(0, comment.likes - 1)
                comment.save()
                return Response({'likes': comment.likes})
            except CommentLike.DoesNotExist:
                return Response({'likes': comment.likes})


# -------------------
# Contact ViewSet
# -------------------
class ContactViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Contact Messages
    """
    queryset = Contact.objects.all().order_by("-created_at")
    serializer_class = ContactSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'subject']
    ordering = ['-created_at']


# -------------------
# Newsletter ViewSet
# -------------------
class NewsletterSubscriberViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Newsletter Subscribers
    """
    queryset = NewsletterSubscriber.objects.all()
    serializer_class = NewsletterSubscriberSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['email']

    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        """Subscribe to newsletter"""
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        subscriber, created = NewsletterSubscriber.objects.get_or_create(
            email=email,
            defaults={'is_active': True}
        )
        if not created:
            subscriber.is_active = True
            subscriber.save()
        
        serializer = self.get_serializer(subscriber)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def unsubscribe(self, request):
        """Unsubscribe from newsletter"""
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            subscriber = NewsletterSubscriber.objects.get(email=email)
            subscriber.is_active = False
            subscriber.save()
            return Response({'message': 'Unsubscribed successfully'})
        except NewsletterSubscriber.DoesNotExist:
            return Response({'error': 'Email not found'}, status=status.HTTP_404_NOT_FOUND)


# -------------------
# Site Settings ViewSet
# -------------------
class SiteSettingsViewSet(viewsets.ViewSet):
    """
    API endpoint for Site Settings (read-only for users, admin only for updates)
    """
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        """Get site settings"""
        settings = SiteSettings.objects.first()
        if not settings:
            settings = SiteSettings.objects.create()
        serializer = SiteSettingsSerializer(settings)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Get site settings"""
        return self.list(request)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def configure(self, request):
        """Update site settings (admin only)"""
        settings = SiteSettings.objects.first()
        if not settings:
            settings = SiteSettings.objects.create()
        
        serializer = SiteSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------
# Analytics ViewSet
# -------------------
class AnalyticsViewSet(viewsets.ViewSet):
    """
    API endpoint for dashboard analytics (admin only)
    """
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get dashboard overview statistics"""
        data = {
            'total_posts': Post.objects.count(),
            'published_posts': Post.objects.filter(status='published').count(),
            'draft_posts': Post.objects.filter(status='draft').count(),
            'scheduled_posts': Post.objects.filter(status='scheduled').count(),
            'total_users': User.objects.count(),
            'total_comments': Comment.objects.count(),
            'approved_comments': Comment.objects.filter(approved=True).count(),
            'pending_comments': Comment.objects.filter(approved=False, is_spam=False).count(),
            'spam_comments': Comment.objects.filter(is_spam=True).count(),
            'newsletter_subscribers': NewsletterSubscriber.objects.filter(is_active=True).count(),
            'total_views': Post.objects.aggregate(total=Count('id'))['total'],
        }
        return Response(data)

    @action(detail=False, methods=['get'])
    def posts(self, request):
        """Get post statistics"""
        posts = Post.objects.values('id', 'title', 'status', 'views', 'likes').order_by('-views')
        return Response(posts)

    @action(detail=False, methods=['get'])
    def comments_pending(self, request):
        """Get pending comments for moderation"""
        comments = Comment.objects.filter(approved=False, is_spam=False).values(
            'id', 'post__title', 'name', 'message', 'created_at'
        ).order_by('-created_at')
        return Response(comments)


# -------------------
# Custom Login Endpoint
# -------------------
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    """
    Login endpoint for custom User model
    Accepts: email, password
    Returns: access and refresh tokens
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'detail': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'detail': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Check password using Django's password hashing
    if not check_password(password, user.password):
        return Response(
            {'detail': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generate JWT tokens
    refresh = RefreshToken()
    refresh['user_id'] = user.id
    refresh['email'] = user.email
    refresh['role'] = user.role
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """
    Register endpoint for custom User model
    Accepts: email, password, first_name, last_name
    Returns: access and refresh tokens
    """
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    if not email or not password:
        return Response(
            {'detail': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(email=email).exists():
        return Response(
            {'detail': 'Email already registered'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Hash password before saving
    hashed_password = make_password(password)
    
    user = User.objects.create(
        email=email,
        password=hashed_password,
        first_name=first_name,
        last_name=last_name,
        role='subscriber'
    )
    
    # Generate JWT tokens for immediate login
    refresh = RefreshToken()
    refresh['user_id'] = user.id
    refresh['email'] = user.email
    refresh['role'] = user.role
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserDetailSerializer(user).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    """
    Logout endpoint - blacklist the refresh token
    """
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'detail': 'Successfully logged out'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


