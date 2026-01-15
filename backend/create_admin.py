#!/usr/bin/env python
"""
Create an admin user for testing dashboard functionality
Run: python create_admin.py
"""
import os
import django
from django.contrib.auth.hashers import make_password

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from cms.models import User

# Delete existing admin if exists
User.objects.filter(email='admin@test.com').delete()

# Create admin user
admin = User.objects.create(
    email='admin@test.com',
    password=make_password('admin123'),
    first_name='Admin',
    last_name='User',
    role='admin',
    is_staff=True,
    is_active=True
)

print(f"✅ Admin user created successfully!")
print(f"Email: admin@test.com")
print(f"Password: admin123")
print(f"Role: {admin.role}")
print(f"is_staff: {admin.is_staff}")
