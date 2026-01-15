# PRODUCTION DEPLOYMENT GUIDE

## Django + React Full Stack Application on Linux (Ubuntu)

**Last Updated**: January 2026  
**Production Ready**: ✅ Yes  
**Tested On**: Ubuntu 20.04 LTS, Ubuntu 22.04 LTS

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Server Setup & Prerequisites](#server-setup--prerequisites)
3. [User & Directory Structure](#user--directory-structure)
4. [Application Setup](#application-setup)
5. [Django Configuration](#django-configuration)
6. [Gunicorn Setup](#gunicorn-setup)
7. [NGINX Configuration](#nginx-configuration)
8. [SSL/HTTPS with Let's Encrypt](#sslauthentication-with-lets-encrypt)
9. [Systemd Service & Supervisor](#systemd-service--supervisor)
10. [Security & Firewall](#security--firewall)
11. [Database Setup](#database-setup)
12. [Monitoring & Logging](#monitoring--logging)
13. [Backup & Maintenance](#backup--maintenance)
14. [Troubleshooting](#troubleshooting)
15. [Deployment Checklist](#deployment-checklist)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet / Users                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS (443)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 NGINX (Reverse Proxy)                            │
│  - SSL/TLS Termination                                          │
│  - Load Balancing                                               │
│  - Static File Serving                                          │
│  - Request Logging                                              │
└──┬────────────────┬────────────────┬──────────────────┬─────────┘
   │                │                │                  │
   ▼                ▼                ▼                  ▼
┌────────────┐ ┌──────────┐ ┌──────────────┐ ┌─────────────────┐
│ Gunicorn 1 │ │Gunicorn2 │ │ Gunicorn 3   │ │ Static Files &  │
│ (Port8000) │ │(Port8001)│ │ (Port 8002)  │ │ React SPA       │
│   Django   │ │  Django  │ │   Django     │ │ (/home/app/...  │
└────────────┘ └──────────┘ └──────────────┘ └─────────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
         ┌──────────────────────────┐
         │   PostgreSQL Database    │
         │   (Port 5432 - local)    │
         └──────────────────────────┘
```

---

## Server Setup & Prerequisites

### 1. Initial Ubuntu Server Configuration

```bash
# Log in as root or with sudo privileges
ssh root@your_server_ip

# Update system packages
apt update && apt upgrade -y

# Install essential packages
apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    postgresql \
    postgresql-contrib \
    nginx \
    git \
    curl \
    wget \
    ufw \
    supervisor \
    redis-server \
    build-essential \
    libpq-dev

# Verify installations
python3 --version
nginx -v
psql --version
```

### 2. Install Node.js (for React build)

```bash
# Install Node.js 18+ (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verify
node --version
npm --version
```

### 3. Install Certbot for SSL

```bash
apt install -y certbot python3-certbot-nginx

# Verify
certbot --version
```

### 4. Create Non-Root User

```bash
# Create application user
useradd -m -s /bin/bash appuser

# Add to sudo group (optional)
usermod -aG sudo appuser

# Switch to new user
su - appuser
```

---

## User & Directory Structure

### Recommended Directory Layout

```
/home/appuser/
├── myproject/                    # Main project directory
│   ├── backend/                  # Django app
│   │   ├── manage.py
│   │   ├── requirements.txt
│   │   ├── backend/
│   │   │   ├── settings.py
│   │   │   ├── urls.py
│   │   │   ├── wsgi.py
│   │   │   └── __init__.py
│   │   ├── cms/
│   │   ├── staticfiles/          # Collected static files
│   │   ├── media/                # User uploads
│   │   ├── logs/                 # Django logs
│   │   └── .env
│   │
│   ├── frontend/                 # React app
│   │   ├── package.json
│   │   ├── src/
│   │   ├── public/
│   │   ├── dist/                 # React build output
│   │   └── node_modules/
│   │
│   ├── .git/                     # Git repository
│   └── .env                      # Environment variables
│
├── venv/                         # Virtual environment
├── logs/                         # Application logs
│   ├── gunicorn.log
│   ├── nginx_access.log
│   ├── nginx_error.log
│   └── django/
│
└── backups/                      # Database backups
```

### Create Directory Structure

```bash
# As appuser
mkdir -p /home/appuser/myproject
mkdir -p /home/appuser/venv
mkdir -p /home/appuser/logs
mkdir -p /home/appuser/backups

# Navigate to project
cd /home/appuser/myproject

# Clone your repository
git clone https://github.com/yourusername/django-react-crud.git .
# or if already cloned
cd existing-project
```

---

## Application Setup

### 1. Clone and Setup Project

```bash
# Create Python virtual environment
python3 -m venv /home/appuser/venv

# Activate virtual environment
source /home/appuser/venv/bin/activate

# Navigate to backend
cd /home/appuser/myproject/backend

# Install Python dependencies
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies & Build

```bash
# Navigate to frontend
cd /home/appuser/myproject/frontend

# Install Node dependencies
npm install

# Build React for production
npm run build

# Verify dist folder was created
ls -la dist/
```

### 3. Setup Environment File

```bash
# Create .env file in project root
cd /home/appuser/myproject
nano .env
```

```bash
# ==========================================
# Django Settings
# ==========================================
DEBUG=False
SECRET_KEY=your-super-secret-key-change-this
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,your.server.ip

# ==========================================
# Database
# ==========================================
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=myproject_db
DATABASE_USER=myproject_user
DATABASE_PASSWORD=very-strong-password-here
DATABASE_HOST=localhost
DATABASE_PORT=5432

# ==========================================
# CORS & Security
# ==========================================
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# ==========================================
# Email Configuration
# ==========================================
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=app-specific-password

# ==========================================
# AWS S3 (Optional, for media files)
# ==========================================
USE_S3=False
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_REGION_NAME=us-east-1

# ==========================================
# Application Settings
# ==========================================
TIMEZONE=UTC
LANGUAGE_CODE=en-us
```

**⚠️ Security Note**: Change ownership and permissions:

```bash
# Make .env readable only by appuser
chmod 600 /home/appuser/myproject/.env
```

---

## Django Configuration

### 1. Create Production Settings

Update `backend/backend/settings.py` to use environment variables:

See [django_production_settings.py](./django_production_settings.py) file in this repository.

Key settings for production:

```python
from pathlib import Path
import os
from decouple import config

# Security
DEBUG = config('DEBUG', default=False, cast=bool)
SECRET_KEY = config('SECRET_KEY')
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=lambda v: [s.strip() for s in v.split(',')])

# HTTPS
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=True, cast=bool)
CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=True, cast=bool)
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Database
DATABASES = {
    'default': {
        'ENGINE': config('DATABASE_ENGINE', default='django.db.backends.sqlite3'),
        'NAME': config('DATABASE_NAME', default='db.sqlite3'),
        'USER': config('DATABASE_USER', default=''),
        'PASSWORD': config('DATABASE_PASSWORD', default=''),
        'HOST': config('DATABASE_HOST', default='localhost'),
        'PORT': config('DATABASE_PORT', default='5432'),
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = '/home/appuser/myproject/backend/staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = '/home/appuser/myproject/backend/media'
```

### 2. Initialize Database

```bash
# Activate virtual environment
source /home/appuser/venv/bin/activate

# Navigate to backend
cd /home/appuser/myproject/backend

# Create superuser (will prompt for username/password)
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Test locally
python manage.py runserver 0.0.0.0:8000  # Then press Ctrl+C
```

---

## Gunicorn Setup

### 1. Install Gunicorn (already in requirements.txt)

```bash
source /home/appuser/venv/bin/activate
pip install gunicorn
gunicorn --version
```

### 2. Test Gunicorn

```bash
cd /home/appuser/myproject/backend

# Test run (should show "Listening at" messages)
gunicorn \
    --workers 4 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile /home/appuser/logs/gunicorn_access.log \
    --error-logfile /home/appuser/logs/gunicorn_error.log \
    backend.wsgi:application

# Press Ctrl+C to stop
```

### 3. Create Gunicorn Socket & Service File

Create `/etc/systemd/system/gunicorn.socket`:

```ini
[Unit]
Description=gunicorn socket for myproject
Before=gunicorn.service

[Socket]
ListenStream=127.0.0.1:8000
ListenStream=[::1]:8000

[Install]
WantedBy=sockets.target
```

Create `/etc/systemd/system/gunicorn.service`:

```ini
[Unit]
Description=gunicorn daemon for myproject
Requires=gunicorn.socket
After=network.target

[Service]
Type=notify
User=appuser
Group=www-data
WorkingDirectory=/home/appuser/myproject/backend
EnvironmentFile=/home/appuser/myproject/.env
ExecStart=/home/appuser/venv/bin/gunicorn \
    --workers 4 \
    --worker-class sync \
    --timeout 120 \
    --bind unix:/run/gunicorn.sock \
    --access-logfile /home/appuser/logs/gunicorn_access.log \
    --error-logfile /home/appuser/logs/gunicorn_error.log \
    backend.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
KillSignal=SIGINT

# Restart policy
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

### 4. Enable and Start Gunicorn

```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Enable socket and service
sudo systemctl enable gunicorn.socket gunicorn.service

# Start services
sudo systemctl start gunicorn.socket
sudo systemctl start gunicorn.service

# Check status
sudo systemctl status gunicorn.service
sudo systemctl status gunicorn.socket

# View logs
sudo journalctl -u gunicorn.service -n 50 -f
```

### Worker Configuration

Recommended workers: **(2 × CPU cores) + 1**

```bash
# Check your CPU cores
nproc

# If you have 2 cores: 2*2 + 1 = 5 workers
# If you have 4 cores: 2*4 + 1 = 9 workers
```

---

## NGINX Configuration

### 1. Remove Default NGINX Config

```bash
# Backup default
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak

# Remove symbolic link
sudo rm /etc/nginx/sites-enabled/default
```

### 2. Create NGINX Server Block

Create `/etc/nginx/sites-available/myproject`:

```nginx
# ==========================================
# NGINX Configuration for Django + React
# Production Ready
# ==========================================

# Rate limiting
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# Gzip compression
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript
           application/x-javascript application/xml+rss
           application/javascript application/json;

# Upstream Gunicorn
upstream django_app {
    server unix:/run/gunicorn.sock fail_timeout=0;
}

# ==========================================
# HTTP to HTTPS Redirect
# ==========================================
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Let's Encrypt challenges
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# ==========================================
# HTTPS Server Block
# ==========================================
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name yourdomain.com www.yourdomain.com;
    server_tokens off;

    # SSL Certificates (generated by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration (Mozilla Intermediate)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Logging
    access_log /home/appuser/logs/nginx_access.log combined buffer=32k;
    error_log /home/appuser/logs/nginx_error.log warn;

    client_max_body_size 50M;

    # ==========================================
    # React Frontend
    # ==========================================
    location / {
        alias /home/appuser/myproject/frontend/dist/;

        # SPA routing
        try_files $uri $uri/ /index.html;

        # No caching for index.html
        location = /index.html {
            add_header Cache-Control "public, must-revalidate, proxy-revalidate";
            expires 1h;
        }

        # Cache other assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        access_log /home/appuser/logs/nginx_frontend.log combined buffer=32k;
    }

    # ==========================================
    # Django Admin
    # ==========================================
    location /admin/ {
        limit_req zone=general_limit burst=10 nodelay;

        proxy_pass http://django_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;

        access_log /home/appuser/logs/nginx_admin.log combined;
    }

    # ==========================================
    # REST API Endpoints
    # ==========================================
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://django_app;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        access_log /home/appuser/logs/nginx_api.log combined;
    }

    # ==========================================
    # Django Static Files
    # ==========================================
    location /static/ {
        alias /home/appuser/myproject/backend/staticfiles/;

        expires 30d;
        add_header Cache-Control "public, immutable";

        # Disable logging for static files
        access_log off;
    }

    # ==========================================
    # Media Files (User Uploads)
    # ==========================================
    location /media/ {
        alias /home/appuser/myproject/backend/media/;

        expires 7d;
        add_header Cache-Control "public, must-revalidate";

        # Security: Prevent PHP execution
        location ~ /media/.*\.php$ {
            deny all;
        }

        location ~ /media/.*\.sh$ {
            deny all;
        }

        access_log off;
    }

    # ==========================================
    # Health Check
    # ==========================================
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # ==========================================
    # Deny access to hidden files
    # ==========================================
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 3. Enable NGINX Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/myproject /etc/nginx/sites-enabled/

# Test NGINX configuration
sudo nginx -t

# If OK, reload NGINX
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# View NGINX logs
sudo tail -f /home/appuser/logs/nginx_error.log
sudo tail -f /home/appuser/logs/nginx_access.log
```

---

## SSL/Authentication with Let's Encrypt

### 1. Obtain SSL Certificate

```bash
# Stop NGINX temporarily
sudo systemctl stop nginx

# Generate certificate with certbot
sudo certbot certonly --standalone \
    -d yourdomain.com \
    -d www.yourdomain.com \
    --agree-tos \
    -m your-email@example.com

# Or use webroot method (recommended)
sudo certbot certonly --webroot \
    -w /var/www/certbot \
    -d yourdomain.com \
    -d www.yourdomain.com \
    --agree-tos \
    -m your-email@example.com

# Verify certificate
sudo ls -la /etc/letsencrypt/live/yourdomain.com/
```

### 2. Setup Auto-Renewal

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Enable automatic renewal
sudo systemctl enable certbot.timer

# Check renewal timer
sudo systemctl status certbot.timer

# View renewal log
sudo cat /var/log/letsencrypt/renewal.log
```

### 3. Update NGINX Configuration

The NGINX config above already includes the correct SSL paths:

```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

Just update `yourdomain.com` in the NGINX config and reload.

---

## Systemd Service & Supervisor

### Option 1: Systemd (Recommended)

We already created the systemd service above. Additional commands:

```bash
# Check service status
sudo systemctl status gunicorn.service

# View recent logs
sudo journalctl -u gunicorn.service -n 50

# Follow logs in real-time
sudo journalctl -u gunicorn.service -f

# Restart service
sudo systemctl restart gunicorn.service

# Stop service
sudo systemctl stop gunicorn.service

# Start service
sudo systemctl start gunicorn.service
```

### Option 2: Supervisor (Alternative)

Create `/etc/supervisor/conf.d/myproject.conf`:

```ini
[program:myproject_gunicorn]
directory=/home/appuser/myproject/backend
command=/home/appuser/venv/bin/gunicorn \
    --workers=4 \
    --worker-class=sync \
    --timeout=120 \
    --bind=127.0.0.1:8000 \
    --access-logfile=/home/appuser/logs/gunicorn_access.log \
    --error-logfile=/home/appuser/logs/gunicorn_error.log \
    backend.wsgi:application

user=appuser
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/home/appuser/logs/supervisor.log
environment=PATH="/home/appuser/venv/bin",HOME="/home/appuser"

# Process monitoring
startsecs=10
stopwaitsecs=10
```

Enable Supervisor:

```bash
# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update

# Start program
sudo supervisorctl start myproject_gunicorn

# Check status
sudo supervisorctl status

# View logs
tail -f /home/appuser/logs/supervisor.log
```

---

## Security & Firewall

### 1. Setup UFW (Uncomplicated Firewall)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (important: do this first!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow specific IP SSH access (optional)
sudo ufw allow from 192.168.1.100 to any port 22

# Deny all other inbound
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Check status
sudo ufw status
sudo ufw status verbose
```

### 2. SSH Key Authentication

```bash
# As root
sudo vi /etc/ssh/sshd_config

# Change/verify these settings:
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes
# Protocol 2

# Restart SSH
sudo systemctl restart ssh

# Verify
sudo systemctl status ssh
```

### 3. Disable Root Login

```bash
sudo passwd -l root
```

### 4. Fail2Ban Setup (Optional)

```bash
# Install
sudo apt install -y fail2ban

# Create config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo vi /etc/fail2ban/jail.local

# Add this to [DEFAULT] section:
# bantime = 3600
# findtime = 600
# maxretry = 5

# Enable and start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status sshd
```

### 5. Additional Security Measures

```bash
# Disable unnecessary services
sudo systemctl disable bluetooth
sudo systemctl disable avahi-daemon

# Update system regularly
sudo apt update && sudo apt upgrade -y

# Setup unattended upgrades
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Database Setup

### 1. PostgreSQL Installation & Configuration

```bash
# PostgreSQL should be installed already, verify:
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database & User

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside psql console:
CREATE DATABASE myproject_db;
CREATE USER myproject_user WITH PASSWORD 'very-strong-password';
ALTER ROLE myproject_user SET client_encoding TO 'utf8';
ALTER ROLE myproject_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE myproject_user SET default_transaction_deferrable TO on;
ALTER ROLE myproject_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE myproject_db TO myproject_user;
ALTER DATABASE myproject_db OWNER TO myproject_user;

# Exit psql
\q
```

### 3. Run Django Migrations

```bash
# Activate venv
source /home/appuser/venv/bin/activate

# Navigate to backend
cd /home/appuser/myproject/backend

# Run migrations
python manage.py migrate

# Create superuser (if not already done)
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput
```

### 4. Backup PostgreSQL

```bash
# Manual backup
sudo -u postgres pg_dump myproject_db > /home/appuser/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with compression
sudo -u postgres pg_dump -Fc myproject_db > /home/appuser/backups/backup_$(date +%Y%m%d_%H%M%S).dump

# Automated daily backup
sudo crontab -e

# Add this line:
0 2 * * * sudo -u postgres pg_dump -Fc myproject_db > /home/appuser/backups/backup_$(date +\%Y\%m\%d).dump

# Restore from backup
sudo -u postgres pg_restore -d myproject_db /path/to/backup.dump
```

---

## Monitoring & Logging

### 1. Django Logging Configuration

Update `backend/backend/settings.py`:

```python
# ==========================================
# Logging Configuration
# ==========================================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/home/appuser/logs/django.log',
            'maxBytes': 1024 * 1024 * 100,  # 100MB
            'backupCount': 20,
            'formatter': 'verbose',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/home/appuser/logs/django_errors.log',
            'maxBytes': 1024 * 1024 * 100,  # 100MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['error_file'],
            'level': 'ERROR',
            'propagate': False,
        },
        'cms': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

### 2. Logrotate Configuration

Create `/etc/logrotate.d/myproject`:

```bash
/home/appuser/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 appuser www-data
    sharedscripts
    postrotate
        sudo systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

Enable:

```bash
sudo logrotate -f /etc/logrotate.d/myproject
```

### 3. Monitoring Commands

```bash
# System resources
top -u appuser
free -h
df -h

# Services status
sudo systemctl status gunicorn.service nginx postgresql

# Application logs
tail -f /home/appuser/logs/nginx_access.log
tail -f /home/appuser/logs/django.log
tail -f /home/appuser/logs/gunicorn_error.log

# Count requests per minute
awk '{print $4}' /home/appuser/logs/nginx_access.log | cut -d: -f1-2 | sort | uniq -c

# Find errors in logs
grep ERROR /home/appuser/logs/django.log
grep 500 /home/appuser/logs/nginx_access.log

# Monitor in real-time
watch -n 1 'ps aux | grep gunicorn | grep -v grep'
```

### 4. Setup Monitoring with Systemd-Monitor (Optional)

```bash
# Create monitoring script
sudo cat > /usr/local/bin/check_app_health.sh << 'EOF'
#!/bin/bash

# Check if gunicorn is running
if ! systemctl is-active --quiet gunicorn.service; then
    echo "ERROR: Gunicorn is not running"
    systemctl restart gunicorn.service
fi

# Check if nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "ERROR: NGINX is not running"
    systemctl restart nginx
fi

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    echo "ERROR: PostgreSQL is not running"
    systemctl restart postgresql
fi

# Check disk space
disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -gt 80 ]; then
    echo "WARNING: Disk usage is at ${disk_usage}%"
fi

echo "All systems OK at $(date)"
EOF

sudo chmod +x /usr/local/bin/check_app_health.sh

# Add to crontab to run every 5 minutes
sudo crontab -e
# Add: */5 * * * * /usr/local/bin/check_app_health.sh >> /var/log/app_health.log 2>&1
```

---

## Backup & Maintenance

### 1. Automated Backup Strategy

Create `/home/appuser/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/home/appuser/backups"
DATABASE_NAME="myproject_db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Database backup
echo "Backing up database..."
sudo -u postgres pg_dump -Fc $DATABASE_NAME > $BACKUP_DIR/db_${TIMESTAMP}.dump

# Application files backup (optional)
echo "Backing up application files..."
tar -czf $BACKUP_DIR/app_${TIMESTAMP}.tar.gz \
    --exclude=node_modules \
    --exclude=venv \
    --exclude=.git \
    --exclude=__pycache__ \
    --exclude=media \
    /home/appuser/myproject

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.dump" -mtime +30 -delete
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR"
```

Setup:

```bash
# Make executable
chmod +x /home/appuser/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /home/appuser/backup.sh >> /home/appuser/logs/backup.log 2>&1
```

### 2. Regular Maintenance Tasks

```bash
# Update system (should be automated)
sudo apt update && sudo apt upgrade -y

# Clear pip cache
pip cache purge

# Clear Django static files and recollect
cd /home/appuser/myproject/backend
python manage.py clearcache
python manage.py collectstatic --noinput

# Check database integrity
sudo -u postgres psql myproject_db -c "REINDEX DATABASE myproject_db;"
```

### 3. Version Updates

```bash
# Update Python packages
source /home/appuser/venv/bin/activate
pip install --upgrade pip setuptools wheel
pip list --outdated
pip install -U -r requirements.txt

# Test locally
python manage.py test

# Commit to git
git add requirements.txt
git commit -m "Update dependencies"

# Restart application
sudo systemctl restart gunicorn.service

# Check logs
sudo journalctl -u gunicorn.service -n 20 -f
```

---

## Troubleshooting

### Common Issues & Solutions

#### **502 Bad Gateway Error**

```bash
# Check Gunicorn status
sudo systemctl status gunicorn.service

# Check Gunicorn socket
ls -la /run/gunicorn.sock

# Check logs
sudo journalctl -u gunicorn.service -n 50
tail -f /home/appuser/logs/gunicorn_error.log

# Restart Gunicorn
sudo systemctl restart gunicorn.service

# Test Django directly
source /home/appuser/venv/bin/activate
cd /home/appuser/myproject/backend
python manage.py shell
```

#### **404 on API Endpoints**

```bash
# Check NGINX configuration
sudo nginx -t

# Check NGINX logs
tail -f /home/appuser/logs/nginx_error.log

# Verify Django is running
sudo systemctl status gunicorn.service

# Test API endpoint locally
source /home/appuser/venv/bin/activate
cd /home/appuser/myproject/backend
python manage.py runserver 0.0.0.0:8000
curl http://localhost:8000/api/
```

#### **Static Files Not Loading**

```bash
# Collect static files
source /home/appuser/venv/bin/activate
cd /home/appuser/myproject/backend
python manage.py collectstatic --noinput --clear

# Check permissions
ls -la staticfiles/
sudo chown -R appuser:www-data /home/appuser/myproject/backend/staticfiles

# Reload NGINX
sudo systemctl reload nginx
```

#### **React SPA Routes Not Working**

```bash
# Verify dist folder exists
ls -la /home/appuser/myproject/frontend/dist/

# Check NGINX configuration has try_files
grep -A2 "location /" /etc/nginx/sites-available/myproject

# Should include: try_files $uri $uri/ /index.html;
```

#### **Database Connection Error**

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
sudo -u postgres psql myproject_db -c "SELECT 1;"

# Check .env database settings
cat /home/appuser/myproject/.env | grep DATABASE

# Check Django settings
source /home/appuser/venv/bin/activate
cd /home/appuser/myproject/backend
python manage.py shell
from django.db import connection
connection.ensure_connection()
```

#### **High Memory Usage**

```bash
# Check what's using memory
ps aux --sort=-%mem | head -20

# Check Gunicorn workers
ps aux | grep gunicorn

# Reduce workers if needed
sudo systemctl edit gunicorn.service
# Change --workers to smaller number

# Check for memory leaks
sudo valgrind --leak-check=full gunicorn ...  # For development only
```

#### **NGINX 413 Request Entity Too Large**

```bash
# Update NGINX config
sudo nano /etc/nginx/sites-available/myproject
# Increase: client_max_body_size 100M;

sudo systemctl reload nginx
```

---

## Deployment Checklist

### Before Deployment

- [ ] Code reviewed and tested locally
- [ ] All dependencies in requirements.txt
- [ ] Frontend built and tested
- [ ] Environment variables configured in .env
- [ ] SECRET_KEY generated and secured
- [ ] Database migrations ready
- [ ] Static files collected
- [ ] SSL certificate ready

### During Deployment

- [ ] Clone repository on server
- [ ] Create virtual environment
- [ ] Install dependencies
- [ ] Configure .env file
- [ ] Run database migrations
- [ ] Collect static files
- [ ] Configure Gunicorn systemd service
- [ ] Configure NGINX
- [ ] Install SSL certificate
- [ ] Enable firewall rules
- [ ] Start services

### After Deployment

- [ ] Test all endpoints (API, admin, frontend)
- [ ] Check logs for errors
- [ ] Monitor resource usage
- [ ] Test SSL/HTTPS
- [ ] Verify database backups
- [ ] Test email functionality
- [ ] Monitor for 24 hours
- [ ] Document any issues
- [ ] Create incident response plan

### Performance Checklist

- [ ] Gunicorn workers: `(2 × CPU) + 1`
- [ ] Database indexes created
- [ ] Caching headers set correctly
- [ ] GZIP compression enabled
- [ ] Image optimization done
- [ ] CDN setup (optional)
- [ ] Database connection pooling configured

### Security Checklist

- [ ] Firewall enabled (UFW)
- [ ] SSH key authentication only
- [ ] Root login disabled
- [ ] Fail2Ban configured
- [ ] HTTPS enforced
- [ ] HSTS headers set
- [ ] Security headers added
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Regular security updates scheduled

---

## Performance Optimization Tips

### 1. Database Optimization

```python
# Use select_related for foreign keys
QuerySet.select_related('foreign_key')

# Use prefetch_related for reverse relationships
QuerySet.prefetch_related('reverse_relation')

# Index frequently queried fields
class Model(models.Model):
    email = models.EmailField(db_index=True)
```

### 2. Caching

```python
# Enable Redis caching
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Use cache in views
from django.views.decorators.cache import cache_page

@cache_page(60 * 5)  # Cache for 5 minutes
def my_view(request):
    ...
```

### 3. API Optimization

```python
# Pagination
'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
'PAGE_SIZE': 20

# Filtering
'DEFAULT_FILTER_BACKENDS': [
    'django_filters.rest_framework.DjangoFilterBackend',
    'rest_framework.filters.SearchFilter',
]

# Throttling
'DEFAULT_THROTTLE_CLASSES': [
    'rest_framework.throttling.AnonRateThrottle',
    'rest_framework.throttling.UserRateThrottle'
],
'DEFAULT_THROTTLE_RATES': {
    'anon': '100/hour',
    'user': '1000/hour'
}
```

### 4. Frontend Optimization

```bash
# Build optimization
npm run build

# Analyze bundle size
npm install -D webpack-bundle-analyzer

# Tree-shaking and minification are automatic with production build
```

### 5. NGINX Optimization

```nginx
# Already configured in our NGINX setup:
# - Gzip compression
# - Browser caching
# - Upstream keepalive connections
# - Buffering
```

---

## Scalability Considerations

### 1. Horizontal Scaling (Multiple Servers)

```
Load Balancer (HAProxy)
    ├── App Server 1 (Django + Gunicorn)
    ├── App Server 2 (Django + Gunicorn)
    └── App Server 3 (Django + Gunicorn)
```

### 2. Database Replication

```
Primary PostgreSQL (write)
    ├── Read Replica 1
    └── Read Replica 2
```

### 3. Caching Layer

```
Redis/Memcached for:
- Session storage
- Query results
- API response caching
```

### 4. CDN for Static Files

```
CloudFront / Cloudflare
    └── Origin: /static/ and /media/
```

---

## Additional Resources

- [Django Deployment Documentation](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [Gunicorn Documentation](https://gunicorn.org/)
- [NGINX Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Systemd Documentation](https://www.freedesktop.org/software/systemd/man/)

---

## Support & Troubleshooting

For issues not covered here:

1. Check application logs: `/home/appuser/logs/`
2. Check system logs: `sudo journalctl -xn`
3. Check NGINX logs: `/home/appuser/logs/nginx_*.log`
4. Run diagnostics: `sudo systemctl status gunicorn.service`
5. Test endpoints: `curl -v https://yourdomain.com/api/`

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Status**: Production Ready ✅
