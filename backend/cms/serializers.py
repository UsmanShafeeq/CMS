from rest_framework import serializers
from .models import (
    User, Category, Tag, Post, Comment, Contact,
    PostLike, CommentLike, NewsletterSubscriber, SiteSettings
)


# -------------------
# User Serializer
# -------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "bio",
            "profile_image",
            "role",
            "is_staff",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserDetailSerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "bio",
            "profile_image",
            "role",
            "is_staff",
            "is_active",
            "posts_count",
            "comments_count",
            "created_at",
        ]
    
    def get_posts_count(self, obj):
        return obj.posts.count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()


# -------------------
# Category Serializer
# -------------------
class CategorySerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "posts_count",
            "created_at",
        ]
        read_only_fields = ['created_at']
    
    def get_posts_count(self, obj):
        return obj.posts.filter(status='published').count()


# -------------------
# Tag Serializer
# -------------------
class TagSerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = [
            "id",
            "name",
            "slug",
            "posts_count",
        ]
    
    def get_posts_count(self, obj):
        return obj.posts.filter(status='published').count()


# -------------------
# Comment Serializer (with nested replies)
# -------------------
class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_image = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "post",
            "author",
            "author_name",
            "author_image",
            "parent",
            "name",
            "email",
            "message",
            "approved",
            "is_spam",
            "likes",
            "replies",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ['approved', 'is_spam', 'likes', 'created_at', 'updated_at']
    
    def get_author_name(self, obj):
        if obj.author:
            return f"{obj.author.first_name} {obj.author.last_name}"
        return obj.name
    
    def get_author_image(self, obj):
        if obj.author and obj.author.profile_image:
            return obj.author.profile_image.url
        return None
    
    def get_replies(self, obj):
        replies = obj.replies.filter(approved=True, is_spam=False)
        return CommentSerializer(replies, many=True).data


# -------------------
# Post Serializer
# -------------------
class PostListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    featured_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "author",
            "category",
            "tags",
            "content",
            "featured_image",
            "status",
            "views",
            "likes",
            "is_featured",
            "published_at",
            "comments_count",
            "created_at",
        ]
    
    def get_featured_image(self, obj):
        """Return featured_image URL only if file exists, otherwise None"""
        if obj.featured_image and obj.featured_image.name:
            return obj.featured_image.url
        return None
    
    def get_comments_count(self, obj):
        return obj.comments.filter(approved=True, is_spam=False).count()


class PostDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, source="tags"
    )
    comments = serializers.SerializerMethodField()
    user_liked = serializers.SerializerMethodField()
    featured_image = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "author",
            "category",
            "tags",
            "tag_ids",
            "content",
            "featured_image",
            "status",
            "views",
            "likes",
            "is_featured",
            "seo_title",
            "seo_description",
            "seo_keywords",
            "published_at",
            "scheduled_for",
            "comments",
            "user_liked",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ['views', 'likes', 'created_at', 'updated_at']
    
    def get_featured_image(self, obj):
        """Return featured_image URL only if file exists, otherwise None"""
        if obj.featured_image and obj.featured_image.name:
            return obj.featured_image.url
        return None
    
    def get_comments(self, obj):
        comments = obj.comments.filter(approved=True, is_spam=False, parent__isnull=True)
        return CommentSerializer(comments, many=True).data
    
    def get_user_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.post_likes.filter(user=request.user).exists()
        return False


class PostCreateUpdateSerializer(serializers.ModelSerializer):
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, source="tags"
    )

    class Meta:
        model = Post
        fields = [
            "title",
            "slug",
            "category",
            "tag_ids",
            "content",
            "featured_image",
            "status",
            "is_featured",
            "seo_title",
            "seo_description",
            "seo_keywords",
            "scheduled_for",
        ]
    
    def validate_slug(self, value):
        if value:
            existing = Post.objects.filter(slug=value).exclude(id=self.instance.id if self.instance else None)
            if existing.exists():
                raise serializers.ValidationError("This slug is already in use.")
        return value


# -------------------
# PostLike Serializer
# -------------------
class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostLike
        fields = ['id', 'post', 'user', 'created_at']
        read_only_fields = ['created_at']


# -------------------
# CommentLike Serializer
# -------------------
class CommentLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentLike
        fields = ['id', 'comment', 'user', 'created_at']
        read_only_fields = ['created_at']


# -------------------
# Contact Serializer
# -------------------
class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = [
            "id",
            "name",
            "email",
            "subject",
            "message",
            "created_at",
        ]
        read_only_fields = ['created_at']


# -------------------
# Newsletter Subscriber Serializer
# -------------------
class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['id', 'email', 'is_active', 'created_at']
        read_only_fields = ['created_at']


# -------------------
# Site Settings Serializer
# -------------------
class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'id',
            'site_title',
            'site_description',
            'logo',
            'favicon',
            'enable_comments',
            'enable_guest_comments',
            'require_comment_approval',
            'posts_per_page',
        ]

