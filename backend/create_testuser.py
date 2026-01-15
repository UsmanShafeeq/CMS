#!/usr/bin/env python
"""
Quick script to create a test user
Run with: python manage.py shell < create_testuser.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from cms.models import User

# Delete existing test user if exists
User.objects.filter(email='test@example.com').delete()

# Create test user
test_user = User.objects.create(
    email='test@example.com',
    password=make_password('testpass123'),  # Password: testpass123
    first_name='Test',
    last_name='User',
    role='subscriber'
)

print(f"✓ Test user created successfully!")
print(f"  Email: test@example.com")
print(f"  Password: testpass123")
print(f"  Role: {test_user.role}")
