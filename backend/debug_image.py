#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from cms.models import Post
from cms.serializers import PostDetailSerializer, PostListSerializer

# Check database
post = Post.objects.filter(is_featured=True).first()
if post:
    print("=== Database Check ===")
    print(f"Post ID: {post.id}")
    print(f"Title: {post.title}")
    print(f"Featured Image Field Value: {post.featured_image}")
    print(f"Featured Image Name: {post.featured_image.name if post.featured_image else 'None'}")
    print(f"Featured Image URL: {post.featured_image.url if post.featured_image else 'None'}")
    print(f"Is Featured: {post.is_featured}")
    
    print("\n=== Serializer Check (Detail) ===")
    serializer = PostDetailSerializer(post)
    print(f"Serialized featured_image: {serializer.data.get('featured_image')}")
    
    print("\n=== Serializer Check (List) ===")
    list_serializer = PostListSerializer(post)
    print(f"Serialized featured_image: {list_serializer.data.get('featured_image')}")
    
    print("\n=== File System Check ===")
    if post.featured_image:
        file_path = post.featured_image.path
        exists = os.path.exists(file_path)
        print(f"File path: {file_path}")
        print(f"File exists: {exists}")
        if exists:
            print(f"File size: {os.path.getsize(file_path)} bytes")
else:
    print("ERROR: No featured post found!")
