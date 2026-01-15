# Professional NGINX Setup Guide for Django React CRUD

Comprehensive guide for hosting your Django React application with NGINX, Docker, logging, security, and production-ready configurations.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Quick Start with Docker](#quick-start-with-docker)
4. [NGINX Configuration Features](#nginx-configuration-features)
5. [Logging Setup](#logging-setup)
6. [Security Configuration](#security-configuration)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
9. [SSL/HTTPS Setup](#ssl-https-setup)
10. [Production Deployment](#production-deployment)

---

## Prerequisites

- Docker & Docker Compose installed
- Git
- Basic knowledge of Docker, Django, React, and NGINX

### System Requirements

- **Minimum**: 2GB RAM, 2 CPU cores
- **Recommended**: 4GB+ RAM, 4+ CPU cores, 20GB disk space

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │   NGINX (Reverse Proxy)  │
        │  - Rate Limiting         │
        │  - Compression           │
        │  - Static Files Cache    │
        │  - Security Headers      │
        │  - Logging               │
        └──────┬──────────┬────────┘
               │          │
        ┌──────▼─┐    ┌───▼──────┐
        │ Django │    │ React SPA│
        │ Backend│    │  (dist/) │
        │(API)   │    │          │
        └──────┬─┘    └──────────┘
               │
        ┌──────▼──────────┐
        │  PostgreSQL DB  │
        │   or SQLite     │
        └─────────────────┘
```

---

## Quick Start with Docker

### 1. Prepare Environment File

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your configuration
# Make sure to set:
# - SECRET_KEY (generate a new one)
# - DEBUG=False for production
# - ALLOWED_HOSTS with your domain
```

### 2. Build and Run Containers

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f nginx
docker-compose logs -f django
```

### 3. Initial Setup

```bash
# Enter Django container
docker-compose exec django bash

# Inside container:
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Exit container
exit
```

### 4. Verify Installation

```bash
# Health check
curl http://localhost/health

# Check API
curl http://localhost/api/

# Check admin
curl http://localhost/admin/

# Check frontend
curl http://localhost/
```

---

## NGINX Configuration Features

### Key Features in `nginx.conf`:

#### 1. **Advanced Logging**

```nginx
# Extended format logs with performance metrics
log_format main_extended '$remote_addr - $remote_user [$time_local] '
                         '"$request" $status $body_bytes_sent '
                         'rt=$request_time uct="$upstream_connect_time" '
                         'uht="$upstream_header_time" urt="$upstream_response_time"';

# JSON format logs for easy parsing
log_format json_combined escape=json { ... };

# Access logs to:
# - /var/log/nginx/access.log (all requests)
# - /var/log/nginx/api_access.log (API only)
# - /var/log/nginx/admin_access.log (admin only)
# - /var/log/nginx/static_access.log (static files)
# - /var/log/nginx/frontend_access.log (SPA)
```

#### 2. **Rate Limiting**

```nginx
# Limit API requests to 10 requests/second
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# Limit general requests to 30 requests/second
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

# Apply to /api/ endpoints
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    ...
}
```

#### 3. **Gzip Compression**

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/javascript application/json;
gzip_comp_level 6;
```

#### 4. **Caching Strategy**

| Resource         | TTL      | Cache-Control             |
| ---------------- | -------- | ------------------------- |
| Static Files     | 30 days  | `public, immutable`       |
| Media Files      | 7 days   | `public, must-revalidate` |
| SPA (index.html) | No cache | `public, must-revalidate` |
| API Responses    | No cache | Via Django settings       |

#### 5. **Security Headers**

```nginx
# Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# XSS Protection
add_header X-XSS-Protection "1; mode=block" always;

# Referrer Policy
add_header Referrer-Policy "no-referrer-when-downgrade" always;

# Permissions Policy
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

#### 6. **Location-Based Routing**

| Path        | Handler             | Notes                                |
| ----------- | ------------------- | ------------------------------------ |
| `/api/*`    | Django backend      | Rate limited, logged separately      |
| `/admin/*`  | Django admin        | Restricted access, logged separately |
| `/static/*` | Django static files | Long-term caching, gzipped           |
| `/media/*`  | User uploads        | XSS protection, moderate caching     |
| `/`         | React SPA           | SPA routing, no caching              |

---

## Logging Setup

### Django Logging Configuration

Configured in `backend/backend/settings.py`:

```python
LOGGING = {
    'handlers': {
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/django.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,      # Keep 5 rotated files
        },
        'error_file': {
            'filename': 'logs/error.log',
            'level': 'ERROR',
        },
        'security_file': {
            'filename': 'logs/security.log',
            'level': 'WARNING',
        },
        'api_file': {
            'filename': 'logs/api.log',
            'level': 'INFO',
        }
    },
    'loggers': {
        'django': {...},
        'django.security': {...},
        'django.request': {...},
        'cms': {...},
        'rest_framework': {...}
    }
}
```

### NGINX Logging

**Log Files Created:**

```
/var/log/nginx/
├── access.log              # All requests
├── access.json.log         # JSON formatted logs
├── error.log               # NGINX errors
├── api_access.log          # API endpoint requests
├── admin_access.log        # Admin panel requests
├── static_access.log       # Static file requests
├── media_access.log        # Media file requests
└── frontend_access.log     # React SPA requests
```

### Log Rotation

Docker automatically rotates logs based on `docker-compose.yml` settings:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m" # Max 10MB per log file
    max-file: "3" # Keep max 3 rotated files
```

### Viewing Logs

```bash
# All NGINX logs
docker-compose logs nginx

# Real-time logs with tail
docker-compose logs -f nginx

# Django logs
docker-compose logs django

# Specific log file (inside container)
docker-compose exec nginx tail -f /var/log/nginx/access.log
docker-compose exec django tail -f logs/django.log

# Parse JSON logs
docker-compose exec nginx jq . /var/log/nginx/access.json.log | head -20
```

---

## Security Configuration

### 1. **Environment Variables**

Store sensitive data in `.env`:

```bash
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
POSTGRES_PASSWORD=strong-password-here
```

**Never commit `.env` to git!**

### 2. **Django Security Settings**

When DEBUG=False, the following are enabled:

```python
SECURE_SSL_REDIRECT = True           # Force HTTPS
SESSION_COOKIE_SECURE = True         # Cookies only over HTTPS
CSRF_COOKIE_SECURE = True            # CSRF tokens over HTTPS
SECURE_HSTS_SECONDS = 31536000       # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
X_FRAME_OPTIONS = 'DENY'
```

### 3. **NGINX Security**

```nginx
# Hide NGINX version
server_tokens off;

# Disable access to hidden files
location ~ /\. {
    deny all;
}

# Prevent script execution in media directory
location ~ /media/.*\.php$ {
    deny all;
}

# Security headers (added via add_header directives)
```

### 4. **CORS Configuration**

```python
# Only allow specific origins
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]
```

### 5. **Rate Limiting**

API endpoints are rate-limited:

- General endpoints: 30 requests/second per IP
- API endpoints: 10 requests/second per IP
- Admin panel: 10 requests/second per IP

### 6. **Database Security**

Use PostgreSQL for production (not SQLite):

```env
POSTGRES_USER=django_user
POSTGRES_PASSWORD=strong-random-password
```

---

## Performance Optimization

### 1. **Compression**

NGINX gzip compression is enabled:

```bash
# Check compression
curl -I -H "Accept-Encoding: gzip" http://localhost/
# Should show: Content-Encoding: gzip
```

### 2. **Caching**

Static files (CSS, JS, images) are cached for 30 days:

```nginx
expires 30d;
add_header Cache-Control "public, immutable";
```

### 3. **Connection Pooling**

```nginx
upstream django {
    keepalive 32;  # Reuse connections
}
```

### 4. **Worker Optimization**

Gunicorn configured with 4 workers:

```yaml
command: gunicorn backend.wsgi:application
  --bind 0.0.0.0:8000
  --workers 4
  --timeout 120
```

Adjust based on your CPU cores: `workers = (2 × CPU_cores) + 1`

### 5. **Load Balancing**

```nginx
upstream django {
    least_conn;  # Use least connections algorithm
    server django:8000 weight=1 max_fails=3 fail_timeout=30s;
}
```

---

## Monitoring & Troubleshooting

### Health Checks

```bash
# NGINX health endpoint
curl http://localhost/health
# Response: healthy

# Django API health
curl http://localhost/api/
# Should return valid JSON
```

### Docker Health Status

```bash
# Check container health
docker-compose ps
# STATUS column shows (healthy) or (unhealthy)

# Check health logs
docker-compose exec nginx curl http://localhost/health
docker-compose exec django curl http://localhost:8000/api/
```

### Troubleshooting

#### **502 Bad Gateway**

```bash
# Check Django container is running
docker-compose ps

# Check Django logs
docker-compose logs django

# Verify Django is listening on port 8000
docker-compose exec django netstat -tlnp | grep 8000

# Test Django directly
docker-compose exec nginx curl http://django:8000/api/
```

#### **404 on Frontend Routes**

Ensure `/` location has SPA routing configured:

```nginx
location / {
    alias /app/frontend/dist/;
    try_files $uri $uri/ /index.html;  # Important!
}
```

#### **Static Files Not Loading**

```bash
# Check static files are collected
docker-compose exec django ls staticfiles/

# Check NGINX can access them
docker-compose exec nginx ls /app/backend/staticfiles/

# Check NGINX config
docker-compose exec nginx nginx -t
```

#### **Media Upload Issues**

```bash
# Check media directory exists
docker-compose exec django ls media/

# Check permissions
docker-compose exec django ls -la media/

# Check NGINX can serve them
docker-compose logs nginx | grep media
```

### Performance Monitoring

#### Request Response Times

```bash
# View from access logs
docker-compose exec nginx tail -f /var/log/nginx/api_access.log | grep "rt="
# Look for rt= values (request time in seconds)
```

#### Container Resource Usage

```bash
docker stats
# Monitor CPU, memory, network usage
```

---

## SSL/HTTPS Setup

### 1. **Generate Self-Signed Certificate (Testing)**

```bash
mkdir -p ssl

openssl req -x509 -newkey rsa:4096 -nodes \
  -out ssl/cert.pem -keyout ssl/key.pem -days 365 \
  -subj "/CN=yourdomain.com"
```

### 2. **Using Let's Encrypt (Production)**

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy to ssl directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown 1000:1000 ssl/*.pem
```

### 3. **Enable HTTPS in NGINX**

Uncomment the HTTPS section in `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    return 301 https://$server_name$request_uri;
}
```

### 4. **Verify HTTPS**

```bash
curl -k https://localhost/health
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Set `DEBUG=False` in `.env`
- [ ] Set strong `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Configure CORS origins correctly
- [ ] Set up SSL/HTTPS certificates
- [ ] Configure email settings
- [ ] Set up database backups
- [ ] Review security headers
- [ ] Set up monitoring and alerting
- [ ] Configure log rotation
- [ ] Test all endpoints

### Deployment Commands

```bash
# Pull latest code
git pull origin main

# Rebuild images if requirements changed
docker-compose build

# Stop old containers
docker-compose down

# Start new containers
docker-compose up -d

# Run migrations
docker-compose exec django python manage.py migrate

# Collect static files
docker-compose exec django python manage.py collectstatic --noinput

# Check logs
docker-compose logs

# Verify health
curl https://yourdomain.com/health
```

### Database Backup

```bash
# PostgreSQL backup
docker-compose exec db pg_dump -U django_user django_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker-compose exec -T db psql -U django_user django_db < backup.sql
```

### Updating Services

```bash
# Update specific service
docker-compose up -d --build django

# Update all services
docker-compose up -d --build

# Restart a service
docker-compose restart django

# Remove and recreate containers
docker-compose up -d --force-recreate
```

### Scaling

For multiple workers/instances:

```yaml
services:
  django:
    deploy:
      replicas: 3 # Run 3 Django instances

  nginx:
    # NGINX will load balance across instances
```

---

## Advanced Configuration

### Custom Log Analysis

```bash
# Count requests per hour
docker-compose exec nginx grep "2024-01-15 1[0-9]" /var/log/nginx/access.log | wc -l

# Find slow requests (> 1 second)
docker-compose exec nginx grep -E "rt=[1-9]\." /var/log/nginx/api_access.log

# Find errors
docker-compose exec nginx grep "status 5" /var/log/nginx/access.log

# Top API endpoints
docker-compose exec nginx grep -oP '(?<=") /api/[^ ]*' /var/log/nginx/api_access.log | sort | uniq -c | sort -rn
```

### Custom NGINX Modules

For advanced features, extend the NGINX Dockerfile:

```dockerfile
FROM nginx:latest

# Install additional modules
RUN apt-get update && apt-get install -y nginx-module-geoip2
```

---

## Support & Resources

- [NGINX Documentation](https://nginx.org/en/docs/)
- [Django Documentation](https://docs.djangoproject.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Let's Encrypt](https://letsencrypt.org/)

---

## Changelog

- **v1.0** - Initial professional setup with logging, security, and performance optimization

]

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

````

### 4. Set Up Nginx

#### Option A: Linux/Mac

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/django-react
sudo ln -s /etc/nginx/sites-available/django-react /etc/nginx/sites-enabled/

# Update paths in nginx.conf to match your deployment
# Replace:
# - /home/django_app/ with your actual app directory

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
````

#### Option B: Windows

1. Download and install Nginx from https://nginx.org/en/download.html
2. Copy `nginx.conf` to your Nginx installation directory: `C:\nginx\conf\nginx.conf`
3. Update paths in the config file
4. Start Nginx:
   ```bash
   cd C:\nginx
   start nginx
   ```

### 5. Run Django with Gunicorn

```bash
cd backend

# Run Gunicorn
gunicorn backend.wsgi:application --bind 127.0.0.1:8000 --workers 4
```

### 6. (Optional) Set Up Systemd Service for Gunicorn

Create `/etc/systemd/system/gunicorn.service`:

```ini
[Unit]
Description=Gunicorn daemon for Django React CRUD
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/home/django_app/backend
ExecStart=/home/django_app/venv/bin/gunicorn \
          --workers 4 \
          --bind 127.0.0.1:8000 \
          backend.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl enable gunicorn
sudo systemctl start gunicorn
```

### 7. SSL/HTTPS Setup (Recommended)

Using Let's Encrypt with Certbot:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Update `nginx.conf` to redirect HTTP to HTTPS:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # ... rest of configuration
}
```

## Directory Structure Expected

```
/home/django_app/
├── backend/
│   ├── manage.py
│   ├── db.sqlite3
│   ├── staticfiles/      (created by collectstatic)
│   ├── media/
│   ├── backend/
│   ├── cms/
│   └── requirements.txt
├── frontend/
│   ├── dist/            (created by npm run build)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── venv/               (Python virtual environment)
```

## Troubleshooting

### 502 Bad Gateway

- Ensure Gunicorn is running on port 8000
- Check Gunicorn and Nginx logs
- Verify socket/port in nginx.conf matches gunicorn binding

### Static files not loading

- Run `python manage.py collectstatic --noinput`
- Verify STATIC_ROOT path in settings.py
- Check file permissions

### React routes not working

- Ensure `try_files $uri $uri/ /index.html;` is in nginx config
- This redirects all unknown routes to index.html for React Router

### CORS errors

- Update CORS_ALLOWED_ORIGINS in Django settings
- Ensure frontend domain matches CORS settings

## Useful Commands

```bash
# Test Nginx configuration
nginx -t

# Reload Nginx
sudo systemctl reload nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Check if port is in use
sudo lsof -i :80
sudo lsof -i :8000
```

## Performance Tips

1. Enable gzip compression in nginx.conf:

```nginx
gzip on;
gzip_types text/plain text/css text/javascript application/json;
gzip_min_length 1000;
```

2. Set cache headers for static assets
3. Use multiple Gunicorn workers based on CPU cores
4. Consider using a separate database (PostgreSQL recommended)
5. Use Nginx caching for API responses if needed

## Next Steps

1. Update Django settings for your domain
2. Update CORS origins in settings.py
3. Update Nginx paths to match your server
4. Test the setup locally before deploying
5. Set up SSL/HTTPS certificates
6. Monitor logs for issues
