if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)#!/usr/bin/env python
"""
Script to create a sample post with featured image
"""
import os
import django
import base64

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.files.base import ContentFile
from cms.models import User, Category, Post

# Get or create admin user
admin_user = User.objects.filter(role='admin').first()
if not admin_user:
    admin_user = User.objects.first()

if not admin_user:
    print("No users found. Please create a user first.")
    exit(1)

# Get or create category
category, _ = Category.objects.get_or_create(
    name='Technology',
    defaults={'slug': 'technology'}
)

# Create a minimal valid JPEG image (1x1 pixel teal)
# This is a valid JPEG file in base64
jpeg_base64 = b'/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k='

image_data = base64.b64decode(jpeg_base64)

# Delete existing sample post if it exists
Post.objects.filter(title='Welcome to Our CMS').delete()

# Create sample post
post = Post.objects.create(
    title='Welcome to Our CMS',
    author=admin_user,
    category=category,
    content='''Welcome to our professional CMS blog platform! This is a sample post to demonstrate the featured image functionality.

Our CMS includes:
- User management with role-based access
- Beautiful responsive design
- Post scheduling and publishing
- Nested comments system
- Like/engagement tracking
- Professional color scheme

Start creating amazing content today!''',
    status='published',
    is_featured=True,
)

# Add featured image
post.featured_image.save('sample-featured.jpg', ContentFile(image_data))
post.save()

print("✓ Sample post created successfully!")
print(f"  Title: {post.title}")
print(f"  Featured Image URL: {post.featured_image.url if post.featured_image else 'None'}")
print(f"  Status: {post.status}")
print(f"  Featured: {post.is_featured}")
