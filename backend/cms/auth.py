"""
Custom authentication backend for the custom User model
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth.models import AnonymousUser
from .models import User


class CustomUserJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that works with the custom User model
    """
    def authenticate(self, request):
        """
        Authenticate the request and return a tuple of (user, auth) or None.
        """
        header = self.get_header(request)

        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
        except InvalidToken:
            raise AuthenticationFailed('Invalid authentication credentials.')

        try:
            user_id = validated_token.get('user_id')
            if not user_id:
                raise AuthenticationFailed('Token does not contain user_id')
            
            # Get user from custom User model
            user = User.objects.get(id=user_id)
            
            # Add user details to token for easy access
            validated_token['email'] = user.email
            validated_token['role'] = user.role
            
            return (user, validated_token)
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found.')
