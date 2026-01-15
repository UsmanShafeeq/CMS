#!/usr/bin/env python
"""
Script to hash all existing plain-text passwords in the User model
Run with: python manage.py shell < fix_passwords.py
Or manually run in Django shell: exec(open('fix_passwords.py').read())
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from cms.models import User

# Update all users with plain-text passwords
users_updated = 0
for user in User.objects.all():
    # Check if password is not already hashed (simple check)
    if user.password and not user.password.startswith('pbkdf2_sha256$'):
        user.password = make_password(user.password)
        user.save()
        users_updated += 1
        print(f"Updated password for {user.email}")

print(f"\nTotal users updated: {users_updated}")
