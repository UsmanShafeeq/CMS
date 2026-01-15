# My CMS Blog - Modern Content Management System

A fully-featured, production-ready CMS blog platform built with Django REST Framework and React.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Django](https://img.shields.io/badge/Django-5.2-darkgreen)
![React](https://img.shields.io/badge/React-19.2-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Features

### Content Management

- 📝 Create, edit, publish, and delete blog posts
- 📅 Schedule posts for future publishing
- 🏷️ Organize posts with categories and tags
- 🖼️ Upload featured images for posts
- 🔍 Full-text search and advanced filtering
- 📊 View count tracking

### User System

- 👥 Role-based access control (Admin, Editor, Contributor, Subscriber)
- 🔐 Secure JWT authentication
- 👤 User profiles with bio and profile pictures
- 🔑 Password-protected dashboard

### Comments & Engagement

- 💬 Nested comment replies
- ✅ Comment moderation and approval workflow
- 🚫 Spam detection and filtering
- 👍 Like posts and comments
- 📤 Share posts on social media

### Admin Dashboard

- 📈 Real-time analytics
- 📊 Post and user statistics
- 💭 Comment moderation queue
- 📧 Newsletter subscriber management
- 🎯 Quick action buttons

### Frontend

- 📱 Fully responsive design (mobile, tablet, desktop)
- ⚡ Fast performance with Vite
- 🎨 Modern UI with Tailwind CSS
- 🌈 Smooth animations and transitions
- 🔗 SEO-friendly URLs and meta tags

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### Installation (5 minutes)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

**Backend:** http://127.0.0.1:8000
**Frontend:** http://localhost:5173
**Admin Panel:** http://127.0.0.1:8000/admin/

See [QUICK_START.md](QUICK_START.md) for detailed instructions.

## 📖 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[CMS_SETUP_GUIDE.md](CMS_SETUP_GUIDE.md)** - Complete installation & setup guide
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Full API reference
- **[PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md)** - Architecture & best practices
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Feature checklist & delivery details

## 🏗️ Architecture

### Backend

```
Django + DRF + SQLite
├── User Management (Roles & Auth)
├── Post Management (CRUD + Scheduling)
├── Comments (Nested + Moderation)
├── Categories & Tags
├── Engagement (Likes, Views)
└── Admin Dashboard & Analytics
```

### Frontend

```
React + Vite + Tailwind CSS
├── Authentication Pages
├── Blog Pages
├── Admin Dashboard
├── User Profiles
└── Comment System
```

## 📊 Project Statistics

- **10 Django Models** - Complete data structure
- **50+ API Endpoints** - Full REST API
- **6 Frontend Pages** - Complete user interface
- **8+ Reusable Components** - Building blocks
- **1000+ Lines of Code** - Production quality
- **4 Documentation Files** - Comprehensive guides

## 🔐 Security

- ✅ JWT Authentication with refresh tokens
- ✅ Role-based permissions on all endpoints
- ✅ CORS configuration
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Secure password storage
- ✅ Token expiration

## 📚 API Endpoints

### Posts

- `GET /api/posts/` - List posts
- `POST /api/posts/` - Create post
- `GET /api/posts/{id}/` - Get post
- `PUT /api/posts/{id}/` - Update post
- `DELETE /api/posts/{id}/` - Delete post
- `GET /api/posts/published/` - Published posts
- `POST /api/posts/{id}/like/` - Like post

### Comments

- `GET /api/comments/` - List comments
- `POST /api/comments/` - Create comment
- `POST /api/comments/{id}/approve/` - Approve comment
- `POST /api/comments/{id}/like/` - Like comment

### Categories & Tags

- `GET /api/categories/` - List categories
- `GET /api/tags/popular/` - Popular tags

### Authentication

- `POST /api/token/` - Get access token
- `POST /api/token/refresh/` - Refresh token

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete reference.

## 🛠️ Tech Stack

### Backend

- **Django 5.2** - Web framework
- **Django REST Framework** - REST API
- **SQLite** - Database
- **JWT** - Authentication
- **drf-yasg** - Swagger documentation

### Frontend

- **React 19.2** - UI library
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router 7** - Navigation
- **Axios** - HTTP client
- **React Icons** - Icons

## 📁 Project Structure

```
django_react_crud/
├── backend/
│   ├── cms/                 # Django app
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API viewsets
│   │   ├── serializers.py   # Data serializers
│   │   └── permissions.py   # Custom permissions
│   ├── backend/             # Settings
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Auth context
│   │   └── api/            # API client
│   ├── package.json
│   └── vite.config.js
└── Documentation files
```

## 🎨 User Roles

| Role        | Permissions                              |
| ----------- | ---------------------------------------- |
| Admin       | Full access, user management, moderation |
| Editor      | Create/edit posts, approve comments      |
| Contributor | Create own posts (need approval)         |
| Subscriber  | View posts, comment, like                |

## 🚀 Deployment

### Production Checklist

- [ ] Set `DEBUG = False`
- [ ] Update `SECRET_KEY`
- [ ] Configure PostgreSQL
- [ ] Set up environment variables
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up Gunicorn + Nginx
- [ ] Configure static file serving
- [ ] Set up monitoring and logging
- [ ] Enable backups

See [CMS_SETUP_GUIDE.md](CMS_SETUP_GUIDE.md#deployment) for detailed deployment instructions.

## 📈 Features Completed

### User Management

- [x] User registration and login
- [x] User roles and permissions
- [x] User profiles
- [x] JWT authentication

### Blog Management

- [x] Post creation and editing
- [x] Post publishing and drafts
- [x] Post scheduling
- [x] Featured posts
- [x] Categories and tags

### Comments

- [x] Nested replies
- [x] Comment approval
- [x] Spam filtering
- [x] Comment likes

### Search & Filter

- [x] Full-text search
- [x] Filter by category
- [x] Filter by tags
- [x] Trending posts
- [x] Recent posts

### Admin

- [x] Admin dashboard
- [x] Analytics overview
- [x] Comment moderation
- [x] User management

### Frontend

- [x] Responsive design
- [x] Modern UI
- [x] Authentication pages
- [x] Post display
- [x] Comment system
- [x] User menu

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💡 Tips

1. **Development**: Use the development servers provided for hot reload
2. **Database**: SQLite is great for development; use PostgreSQL for production
3. **API**: Test with Swagger documentation at `/swagger/`
4. **Admin**: Use Django admin at `/admin/` for quick data management
5. **Customization**: Modify Tailwind colors in the config files

## 🐛 Troubleshooting

**CORS Error?**

- Check `CORS_ALLOWED_ORIGINS` in `backend/settings.py`

**Database Error?**

- Delete `db.sqlite3` and rerun migrations

**Port Conflict?**

- Backend: `python manage.py runserver 8001`
- Frontend: `npm run dev -- --port 5174`

## 📞 Support

For detailed help:

- Check the [documentation files](.)
- Review the [API documentation](API_DOCUMENTATION.md)
- Examine the code comments
- Check Django and React official docs

## 🌐 Links

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ❤️ by modern web developers**

Happy blogging! 📝✨
