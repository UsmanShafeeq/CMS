# cms/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, CategoryViewSet, TagViewSet, PostViewSet, CommentViewSet,
    ContactViewSet, NewsletterSubscriberViewSet, SiteSettingsViewSet, AnalyticsViewSet,
    login, register, logout
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """Simple health check endpoint"""
    return Response({
        'status': 'ok',
        'message': 'CMS API is running',
        'user': request.user.email if request.user.is_authenticated else 'Anonymous'
    })

router = DefaultRouter()
router.register("users", UserViewSet, basename='user')
router.register("categories", CategoryViewSet, basename='category')
router.register("tags", TagViewSet, basename='tag')
router.register("posts", PostViewSet, basename='post')
router.register("comments", CommentViewSet, basename='comment')
router.register("contacts", ContactViewSet, basename='contact')
router.register("newsletter", NewsletterSubscriberViewSet, basename='newsletter')
router.register("settings", SiteSettingsViewSet, basename='settings')
router.register("analytics", AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path("health/", health_check, name='health_check'),
    path("", include(router.urls)),
    path("login/", login, name='login'),
    path("register/", register, name='register'),
    path("logout/", logout, name='logout'),
]

