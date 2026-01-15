#!/usr/bin/env python
"""
Comprehensive image debug test
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
from cms.models import Post

print("=" * 60)
print("IMAGE SERVING DEBUG TEST")
print("=" * 60)

print("\n1. DJANGO SETTINGS")
print(f"   DEBUG: {settings.DEBUG}")
print(f"   MEDIA_URL: {settings.MEDIA_URL}")
print(f"   MEDIA_ROOT: {settings.MEDIA_ROOT}")

print("\n2. FEATURED POSTS IN DATABASE")
posts = Post.objects.filter(is_featured=True)
for post in posts:
    print(f"\n   Post ID: {post.id}")
    print(f"   Title: {post.title}")
    print(f"   featured_image field: {post.featured_image}")
    print(f"   featured_image.name: {post.featured_image.name if post.featured_image else 'None'}")
    print(f"   featured_image.url: {post.featured_image.url if post.featured_image else 'None'}")
    
    if post.featured_image:
        file_path = post.featured_image.path
        print(f"   File path: {file_path}")
        print(f"   File exists: {os.path.exists(file_path)}")
        if os.path.exists(file_path):
            print(f"   File size: {os.path.getsize(file_path)} bytes")
        else:
            print(f"   ERROR: File not found!")

print("\n3. API RESPONSE TEST")
print("   Testing API endpoint response...")
try:
    import requests
    response = requests.get('http://127.0.0.1:8000/api/posts/featured/')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if data:
            print(f"   Featured image from API: {data[0].get('featured_image')}")
        else:
            print("   No featured posts in API response!")
    else:
        print(f"   Error: {response.text}")
except Exception as e:
    print(f"   Exception: {e}")

print("\n4. MEDIA FILE SERVING TEST")
if posts.exists() and posts.first().featured_image:
    post = posts.first()
    print(f"   Testing: {settings.MEDIA_URL}{post.featured_image.name}")
    try:
        response = requests.get(f'http://127.0.0.1:8000{settings.MEDIA_URL}{post.featured_image.name}')
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response size: {len(response.content)} bytes")
            print(f"   Content-Type: {response.headers.get('Content-Type')}")
        else:
            print(f"   ERROR: {response.text[:200]}")
    except Exception as e:
        print(f"   Exception: {e}")

print("\n" + "=" * 60)
