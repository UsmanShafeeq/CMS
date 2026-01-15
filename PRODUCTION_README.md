# Django + React Production Deployment Guide

A complete, production-ready deployment guide for hosting a Django REST API with React frontend using NGINX, Gunicorn, PostgreSQL, and SSL/HTTPS on Linux.

## 📚 Documentation Structure

### Core Documentation Files

| File                         | Purpose                   | Audience            |
| ---------------------------- | ------------------------- | ------------------- |
| **QUICK_SETUP.md**           | 30-minute quick setup     | New developers      |
| **PRODUCTION_DEPLOYMENT.md** | Complete deployment guide | DevOps engineers    |
| **DEPLOYMENT.md**            | Deployment checklist      | DevOps/DevOps teams |

### Configuration Files

| File                                     | Purpose                                |
| ---------------------------------------- | -------------------------------------- |
| `.env.example`                           | Environment variables template         |
| `nginx.conf`                             | Docker NGINX configuration             |
| `gunicorn.service`                       | Systemd service file for Gunicorn      |
| `gunicorn.socket`                        | Systemd socket file for Gunicorn       |
| `supervisor_gunicorn.conf`               | Supervisor configuration (alternative) |
| `backend/backend/settings_production.py` | Django production settings             |

### Helper Scripts

| Script           | Purpose                     |
| ---------------- | --------------------------- |
| `deploy.sh`      | Automated deployment script |
| `backup.sh`      | Database backup script      |
| `healthcheck.sh` | Health monitoring script    |

---

## 🚀 Quick Start (Choose One Path)

### Path 1: Docker Deployment (Development/Testing)

```bash
# Using docker-compose for local testing
docker-compose up -d
docker-compose exec django python manage.py migrate
docker-compose exec django python manage.py createsuperuser
```

See [NGINX_SETUP.md](./NGINX_SETUP.md) for Docker details.

### Path 2: Linux Server Deployment (Production)

```bash
# Follow QUICK_SETUP.md for 30-minute setup
bash QUICK_SETUP.md  # Follow the commands

# OR follow PRODUCTION_DEPLOYMENT.md for detailed guide
```

---

## 📋 System Architecture

### Production Architecture

```
User Browser (HTTPS/443)
    ↓
Load Balancer (optional)
    ↓
NGINX (Reverse Proxy)
  ├─ SSL/TLS Termination
  ├─ Static file serving
  ├─ React SPA routing
  └─ Request routing
    ↓
Gunicorn (WSGI Server)
  ├─ Worker 1
  ├─ Worker 2
  ├─ Worker 3
  └─ Worker 4
    ↓
Django Application
    ↓
PostgreSQL Database
```

---

## 🛠️ Core Components

### 1. Backend (Django)

- **Framework**: Django 5.2+
- **API**: Django REST Framework
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: JWT with djangorestframework-simplejwt
- **Server**: Gunicorn + WSGI
- **Port**: 8000 (internal)

### 2. Frontend (React)

- **Framework**: React 19+
- **Build Tool**: Vite
- **Routing**: React Router v7+
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Build Output**: `/frontend/dist/`

### 3. Reverse Proxy (NGINX)

- **Ports**: 80 (HTTP), 443 (HTTPS)
- **SSL**: Let's Encrypt (certbot)
- **Features**:
  - Gzip compression
  - Rate limiting
  - Security headers
  - Caching
  - Logging

### 4. Database (PostgreSQL)

- **Version**: 12+
- **Port**: 5432 (local only)
- **Backups**: Automated daily

---

## 📦 Deployment Comparison

| Feature            | Docker                  | Linux Server   |
| ------------------ | ----------------------- | -------------- |
| **Setup Time**     | 10 minutes              | 30 minutes     |
| **Scalability**    | Container orchestration | Manual/HAProxy |
| **Cost**           | Docker host + services  | VPS + SSL      |
| **Best For**       | Development/Testing     | Production     |
| **Maintenance**    | Docker updates          | System updates |
| **Learning Curve** | Medium                  | Steep          |

---

## 🔐 Security Features

### Configured by Default

✅ HTTPS/SSL with Let's Encrypt  
✅ HSTS (HTTP Strict Transport Security)  
✅ CORS protection  
✅ CSRF protection  
✅ Rate limiting  
✅ Security headers  
✅ SQL injection prevention (Django ORM)  
✅ XSS protection  
✅ Firewall (UFW)  
✅ SSH key authentication  
✅ Non-root user execution  
✅ Environment variable protection  
✅ Database encryption (optional)  
✅ Automated security updates

### Configuration Files

- `.env` - Sensitive credentials (never commit)
- `settings_production.py` - Production Django settings
- `nginx.conf` - NGINX security headers
- `gunicorn.service` - Process isolation

---

## 📊 Performance Features

### Already Optimized

🚀 Gzip compression (text/JSON)  
🚀 Browser caching (30 days for static)  
🚀 Connection pooling  
🚀 Database indexes  
🚀 Pagination (20 items/page)  
🚀 API rate limiting  
🚀 Gunicorn worker threads  
🚀 NGINX upstream keepalive

### Performance Metrics

- **Static files**: < 100ms (cached)
- **API responses**: < 500ms (typical)
- **Database queries**: < 100ms (indexed)
- **Page load time**: < 2s (optimized)

---

## 📈 Scaling Options

### Horizontal Scaling

```
                    ↓
            Load Balancer
            ↙     ↓     ↘
    Server1  Server2  Server3
    (Django) (Django) (Django)
            ↘     ↓     ↙
            PostgreSQL
            (Primary)
              ↙    ↘
          Replica1 Replica2
```

### Vertical Scaling

- Increase CPU cores
- Increase RAM
- Increase storage (SSD)
- Increase database connections

### Caching Layer

- Redis for session storage
- Redis for API response caching
- Browser caching for static files

---

## 📂 Directory Structure (Production)

```
/home/appuser/
├── myproject/
│   ├── backend/              # Django app
│   │   ├── manage.py
│   │   ├── requirements.txt
│   │   ├── backend/
│   │   │   ├── settings.py (dev)
│   │   │   ├── settings_production.py
│   │   │   ├── urls.py
│   │   │   ├── wsgi.py
│   │   │   └── __init__.py
│   │   ├── cms/
│   │   ├── staticfiles/      # Collected static files
│   │   ├── media/            # User uploads
│   │   ├── logs/             # Django logs
│   │   └── .env
│   │
│   ├── frontend/             # React app
│   │   ├── src/
│   │   ├── dist/             # Production build
│   │   └── package.json
│   │
│   ├── .env                  # Environment variables
│   ├── .gitignore
│   └── .git/
│
├── venv/                     # Python virtual environment
│
├── logs/                     # Application logs
│   ├── gunicorn_access.log
│   ├── gunicorn_error.log
│   ├── nginx_access.log
│   ├── nginx_error.log
│   └── django.log
│
└── backups/                  # Database backups
    ├── db_20240115_0200.dump
    └── db_20240114_0200.dump
```

---

## 🔄 Deployment Workflow

### Local Development

```bash
# Development server
python manage.py runserver
npm run dev

# Run tests
python manage.py test
npm run test
```

### Pre-Deployment

```bash
# Build for production
npm run build
python manage.py collectstatic --noinput

# Run tests
python manage.py test

# Commit changes
git add .
git commit -m "Deploy version X.X.X"
git push origin main
```

### Server Deployment

```bash
# Using deploy.sh (automated)
bash deploy.sh

# Manual deployment
git pull origin main
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
npm install && npm run build
sudo systemctl restart gunicorn.service
sudo systemctl reload nginx
```

### Post-Deployment

```bash
# Verify deployment
curl https://yourdomain.com/health
curl https://yourdomain.com/api/
curl https://yourdomain.com/admin/

# Monitor logs
tail -f logs/django.log
tail -f logs/gunicorn_error.log
tail -f logs/nginx_error.log
```

---

## 📋 Pre-Deployment Checklist

### Code & Configuration

- [ ] All code committed to git
- [ ] Database migrations created
- [ ] Environment variables configured
- [ ] SECRET_KEY is strong and unique
- [ ] DEBUG set to False
- [ ] ALLOWED_HOSTS configured
- [ ] CORS origins configured

### Frontend

- [ ] React build successful (`npm run build`)
- [ ] No console errors in dist/
- [ ] API endpoints hardcoded to production domain
- [ ] env variables for API URLs

### Backend

- [ ] Python dependencies updated
- [ ] Static files collected
- [ ] Database migrations tested
- [ ] Admin user created
- [ ] Email settings configured

### Server

- [ ] Ubuntu 20.04 LTS or newer
- [ ] SSH key authentication enabled
- [ ] Firewall rules configured
- [ ] SSL certificate ready
- [ ] Domain DNS configured
- [ ] Backups configured

### Security

- [ ] HTTPS enforced
- [ ] Security headers enabled
- [ ] CORS restricted to trusted origins
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] XSS protection enabled

---

## 🆘 Common Issues & Solutions

### Issue: 502 Bad Gateway

**Cause**: Gunicorn not running or socket issues

```bash
sudo systemctl restart gunicorn.service
sudo journalctl -u gunicorn.service -n 50
```

### Issue: Static Files Return 404

**Cause**: Static files not collected

```bash
cd backend
python manage.py collectstatic --noinput --clear
sudo systemctl reload nginx
```

### Issue: React Routes Return 404

**Cause**: NGINX not configured for SPA routing

```nginx
# NGINX location block must have:
try_files $uri $uri/ /index.html;
```

### Issue: Database Connection Error

**Cause**: PostgreSQL not running or wrong credentials

```bash
sudo systemctl status postgresql
sudo -u postgres psql myproject_db
```

### Issue: CORS Errors in Browser

**Cause**: Frontend origin not in CORS_ALLOWED_ORIGINS

Update `.env` and restart Django:

```bash
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
sudo systemctl restart gunicorn.service
```

---

## 📊 Monitoring & Logging

### View Logs

```bash
# All services
sudo journalctl -xn

# Gunicorn
sudo journalctl -u gunicorn.service -f

# NGINX
tail -f /home/appuser/logs/nginx_access.log
tail -f /home/appuser/logs/nginx_error.log

# Django
tail -f /home/appuser/logs/django.log
```

### System Monitoring

```bash
# Real-time monitoring
top -u appuser

# Disk usage
df -h

# Memory usage
free -h

# Network connections
netstat -tulnp
```

### Health Checks

```bash
# API health
curl https://yourdomain.com/health

# Services status
sudo systemctl status gunicorn.service
sudo systemctl status nginx
sudo systemctl status postgresql

# Process count
ps aux | grep gunicorn | grep -v grep | wc -l
```

---

## 🔄 Regular Maintenance

### Daily

- [ ] Monitor error logs
- [ ] Check disk space
- [ ] Verify backups ran

### Weekly

- [ ] Review server resource usage
- [ ] Check for security updates
- [ ] Test database restore

### Monthly

- [ ] Security audit
- [ ] Performance optimization
- [ ] Dependency updates
- [ ] Review access logs

### Quarterly

- [ ] Major dependency updates
- [ ] Server capacity planning
- [ ] Disaster recovery drill

---

## 📚 Related Documentation

- [Django Deployment Guide](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [Gunicorn Documentation](https://gunicorn.org/)
- [NGINX Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [React Deployment](https://vitejs.dev/guide/static-deploy.html)

---

## 🤝 Contributing

To improve this guide:

1. Open an issue for suggestions
2. Submit a pull request with improvements
3. Share your deployment experiences

---

## 📝 License

This deployment guide is provided as-is for use with Django and React projects.

---

## ✅ Checklist Summary

**Before You Start**

- [ ] Read QUICK_SETUP.md or PRODUCTION_DEPLOYMENT.md
- [ ] Prepare your server (Ubuntu 20.04+)
- [ ] Have your domain name ready
- [ ] Clone your GitHub repository

**During Setup (30 minutes with QUICK_SETUP.md)**

- [ ] Create app user and directories
- [ ] Clone project and install dependencies
- [ ] Configure .env file
- [ ] Build React frontend
- [ ] Setup PostgreSQL database
- [ ] Configure Gunicorn
- [ ] Configure NGINX
- [ ] Get SSL certificate

**After Deployment**

- [ ] Test all endpoints
- [ ] Check logs
- [ ] Monitor services
- [ ] Verify backups
- [ ] Document your setup

---

**Status**: ✅ Production Ready  
**Last Updated**: January 2026  
**Version**: 1.0

For issues or questions, refer to [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) Troubleshooting section.
