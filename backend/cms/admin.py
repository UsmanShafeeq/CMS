from django.contrib import admin
from .models import (
    User, Category, Tag, Post, Comment, Contact, 
    PostLike, CommentLike, NewsletterSubscriber, SiteSettings
)


class UserAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'role', 'is_active', 'created_at','password']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['first_name', 'last_name', 'email']
    fieldsets = (
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        ('Profile', {'fields': ('bio', 'profile_image', 'role')}),
        ('Status', {'fields': ('is_active', 'is_staff')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    readonly_fields = ['created_at', 'updated_at']


class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}


class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'status', 'is_featured', 'views', 'published_at', 'created_at']
    list_filter = ['status', 'is_featured', 'category', 'created_at']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tags']
    fieldsets = (
        ('Content', {'fields': ('title', 'slug', 'content', 'featured_image')}),
        ('Metadata', {'fields': ('author', 'category', 'tags', 'status')}),
        ('SEO', {'fields': ('seo_title', 'seo_description', 'seo_keywords')}),
        ('Publishing', {'fields': ('is_featured', 'published_at', 'scheduled_for')}),
        ('Analytics', {'fields': ('views', 'likes'), 'classes': ('collapse',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    readonly_fields = ['views', 'likes', 'created_at', 'updated_at']


class CommentAdmin(admin.ModelAdmin):
    list_display = ['name', 'post', 'approved', 'is_spam', 'created_at']
    list_filter = ['approved', 'is_spam', 'created_at']
    search_fields = ['name', 'email', 'message']
    fieldsets = (
        ('Comment Info', {'fields': ('post', 'author', 'parent', 'name', 'email', 'message')}),
        ('Moderation', {'fields': ('approved', 'is_spam')}),
        ('Analytics', {'fields': ('likes',), 'classes': ('collapse',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    readonly_fields = ['created_at', 'updated_at']
    actions = ['approve_comments', 'mark_as_spam', 'delete_spam']

    def approve_comments(self, request, queryset):
        queryset.update(approved=True, is_spam=False)
    approve_comments.short_description = "Approve selected comments"

    def mark_as_spam(self, request, queryset):
        queryset.update(is_spam=True, approved=False)
    mark_as_spam.short_description = "Mark as spam"

    def delete_spam(self, request, queryset):
        queryset.filter(is_spam=True).delete()
    delete_spam.short_description = "Delete spam comments"


class PostLikeAdmin(admin.ModelAdmin):
    list_display = ['post', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['post__title', 'user__first_name']
    readonly_fields = ['created_at']


class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ['comment', 'user', 'created_at']
    list_filter = ['created_at']
    readonly_fields = ['created_at']


class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ['email', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['email']
    readonly_fields = ['created_at']


class SiteSettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        return False


admin.site.register(User, UserAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(Contact, admin.ModelAdmin)
admin.site.register(PostLike, PostLikeAdmin)
admin.site.register(CommentLike, CommentLikeAdmin)
admin.site.register(NewsletterSubscriber, NewsletterSubscriberAdmin)
admin.site.register(SiteSettings, SiteSettingsAdmin)

