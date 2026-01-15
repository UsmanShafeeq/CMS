# COMMAND REFERENCE GUIDE

## Copy-Paste Commands for Production Deployment

---

## 🔧 Server Setup Commands

### 1. Initial System Setup

```bash
# Log in and update
ssh root@your_server_ip
apt update && apt upgrade -y

# Install essential packages
apt install -y python3 python3-pip python3-venv postgresql postgresql-contrib \
    nginx git curl wget ufw supervisor build-essential libpq-dev nodejs npm \
    certbot python3-certbot-nginx redis-server

# Verify installations
python3 --version
node --version
npm --version
nginx -v
psql --version
```

### 2. Create Application User

```bash
# Create user
useradd -m -s /bin/bash appuser
usermod -aG sudo appuser  # Optional

# Switch to appuser
su - appuser
```

### 3. Setup Directory Structure

```bash
# Create directories
mkdir -p ~/myproject ~/venv ~/logs ~/backups

# Navigate to project
cd ~/myproject

# Clone repository
git clone https://github.com/yourusername/django-react-crud.git .
# OR if already cloned:
cd existing-project
```

---

## 🐍 Python Setup Commands

### 1. Create Virtual Environment

```bash
# Create venv
python3 -m venv ~/venv

# Activate
source ~/venv/bin/activate

# Verify
which python
python --version
```

### 2. Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip setuptools wheel

# Navigate to backend
cd ~/myproject/backend

# Install requirements
pip install -r requirements.txt

# Verify
pip list
```

---

## ⚛️ React Build Commands

```bash
# Navigate to frontend
cd ~/myproject/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Verify build
ls -la dist/
```

---

## 🔐 Environment Configuration

```bash
# Create .env file
cd ~/myproject
nano .env
```

**Paste this template and edit values:**

```bash
# Django
DEBUG=False
SECRET_KEY=your-secret-key-here-generate-new
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,your.server.ip

# Database
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=myproject_db
DATABASE_USER=myproject_user
DATABASE_PASSWORD=very-strong-password-123
DATABASE_HOST=localhost
DATABASE_PORT=5432

# CORS & Security
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-app-password

# Optional: AWS S3
USE_S3=False
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_STORAGE_BUCKET_NAME=
# AWS_S3_REGION_NAME=us-east-1
```

**Secure the file:**

```bash
chmod 600 ~/myproject/.env
```

---

## 🗄️ Database Setup Commands

### 1. PostgreSQL Connection

```bash
# Connect as postgres user
sudo -u postgres psql
```

### 2. Create Database and User

```bash
# Inside psql prompt:
CREATE DATABASE myproject_db;
CREATE USER myproject_user WITH PASSWORD 'very-strong-password-123';

ALTER ROLE myproject_user SET client_encoding TO 'utf8';
ALTER ROLE myproject_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE myproject_user SET default_transaction_deferrable TO on;
ALTER ROLE myproject_user SET timezone TO 'UTC';

GRANT ALL PRIVILEGES ON DATABASE myproject_db TO myproject_user;
ALTER DATABASE myproject_db OWNER TO myproject_user;

# Exit psql
\q
```

### 3. Django Database Setup

```bash
# Activate venv
source ~/venv/bin/activate

# Navigate to backend
cd ~/myproject/backend

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Test Django
python manage.py runserver 0.0.0.0:8000
# Then press Ctrl+C to stop
```

---

## 🚀 Gunicorn Setup Commands

### 1. Test Gunicorn

```bash
cd ~/myproject/backend

gunicorn \
    --workers 4 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile ~/logs/gunicorn_access.log \
    --error-logfile ~/logs/gunicorn_error.log \
    backend.wsgi:application

# Press Ctrl+C to stop
```

### 2. Copy Systemd Files

```bash
# As regular user
cd ~/myproject

# Copy service files
sudo cp gunicorn.service /etc/systemd/system/
sudo cp gunicorn.socket /etc/systemd/system/
```

### 3. Enable and Start Gunicorn

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable services
sudo systemctl enable gunicorn.socket
sudo systemctl enable gunicorn.service

# Start services
sudo systemctl start gunicorn.socket
sudo systemctl start gunicorn.service

# Check status
sudo systemctl status gunicorn.service
sudo systemctl status gunicorn.socket

# View logs
sudo journalctl -u gunicorn.service -f
```

---

## 🌐 NGINX Configuration Commands

### 1. Create NGINX Config

```bash
# Create config file
sudo nano /etc/nginx/sites-available/myproject
```

**Paste the complete NGINX configuration** from [NGINX section in PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md#nginx-configuration)

### 2. Enable NGINX Config

```bash
# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/myproject /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload NGINX
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# View logs
sudo tail -f /home/appuser/logs/nginx_error.log
```

---

## 🔒 SSL/HTTPS Setup Commands

### 1. Create Directory for Let's Encrypt

```bash
sudo mkdir -p /var/www/certbot
```

### 2. Get SSL Certificate

```bash
# Using certbot standalone (stop nginx first)
sudo systemctl stop nginx

sudo certbot certonly --standalone \
    -d yourdomain.com \
    -d www.yourdomain.com \
    --agree-tos \
    -m your-email@example.com

# OR using webroot method (nginx still running)
sudo certbot certonly --webroot \
    -w /var/www/certbot \
    -d yourdomain.com \
    -d www.yourdomain.com

# Verify certificate
sudo ls -la /etc/letsencrypt/live/yourdomain.com/
```

### 3. Update NGINX with SSL Paths

Edit `/etc/nginx/sites-available/myproject` and update:

```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

Then reload:

```bash
sudo systemctl reload nginx
```

### 4. Setup Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Enable timer
sudo systemctl enable certbot.timer

# Check status
sudo systemctl status certbot.timer
```

---

## 🛡️ Firewall Setup Commands

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Check status
sudo ufw status
sudo ufw status verbose

# Show rules
sudo ufw show added
```

---

## 🔄 Deployment Commands

### 1. Using Deploy Script

```bash
# Make script executable
chmod +x ~/myproject/deploy.sh

# Run deployment
bash ~/myproject/deploy.sh
```

### 2. Manual Deployment

```bash
cd ~/myproject

# Pull latest code
git fetch origin
git pull origin main

# Activate venv
source ~/venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Migrate database
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Build frontend
cd ../frontend
npm install
npm run build

# Restart services
sudo systemctl restart gunicorn.service
sudo systemctl reload nginx
```

---

## 📋 Service Management Commands

### Gunicorn

```bash
# Start
sudo systemctl start gunicorn.service

# Stop
sudo systemctl stop gunicorn.service

# Restart
sudo systemctl restart gunicorn.service

# Status
sudo systemctl status gunicorn.service

# Enable on boot
sudo systemctl enable gunicorn.service

# Logs
sudo journalctl -u gunicorn.service -n 50
sudo journalctl -u gunicorn.service -f  # Follow
```

### NGINX

```bash
# Start
sudo systemctl start nginx

# Stop
sudo systemctl stop nginx

# Restart
sudo systemctl restart nginx

# Reload (without stopping)
sudo systemctl reload nginx

# Status
sudo systemctl status nginx

# Test config
sudo nginx -t

# View logs
tail -f /home/appuser/logs/nginx_error.log
tail -f /home/appuser/logs/nginx_access.log
```

### PostgreSQL

```bash
# Start
sudo systemctl start postgresql

# Status
sudo systemctl status postgresql

# Stop
sudo systemctl stop postgresql

# Restart
sudo systemctl restart postgresql
```

---

## 🔍 Monitoring & Logging Commands

### View Logs

```bash
# Django logs
tail -f ~/logs/django.log
tail -f ~/logs/django_errors.log

# Gunicorn logs
tail -f ~/logs/gunicorn_error.log
tail -f ~/logs/gunicorn_access.log

# NGINX logs
tail -f ~/logs/nginx_error.log
tail -f ~/logs/nginx_access.log

# Systemd logs
sudo journalctl -u gunicorn.service -f
sudo journalctl -u nginx -f
```

### System Monitoring

```bash
# Real-time monitoring
top -u appuser

# Disk usage
df -h /
du -sh ~/

# Memory usage
free -h

# Network connections
netstat -tulnp
ss -tulnp

# Process list
ps aux | grep gunicorn
ps aux | grep nginx
ps aux | grep python
```

### Health Checks

```bash
# API health
curl https://yourdomain.com/health

# Frontend
curl -I https://yourdomain.com

# API test
curl https://yourdomain.com/api/

# Admin panel
curl -I https://yourdomain.com/admin/

# Test database connection
sudo -u postgres psql -c "SELECT 1;"
```

---

## 💾 Backup Commands

### 1. Manual Backup

```bash
# Database backup
sudo -u postgres pg_dump -Fc myproject_db > ~/backups/backup_$(date +%Y%m%d_%H%M%S).dump

# Compressed backup
sudo -u postgres pg_dump myproject_db | gzip > ~/backups/backup_$(date +%Y%m%d).sql.gz
```

### 2. Using Backup Script

```bash
# Make executable
chmod +x ~/myproject/backup.sh

# Run manually
bash ~/myproject/backup.sh

# Schedule with crontab
crontab -e

# Add this line for daily 2 AM backup:
0 2 * * * ~/myproject/backup.sh >> ~/logs/backup.log 2>&1
```

### 3. Restore Backup

```bash
# Restore from .dump file
sudo -u postgres pg_restore -d myproject_db ~/backups/backup.dump

# Restore from .sql.gz file
gunzip < ~/backups/backup.sql.gz | sudo -u postgres psql myproject_db

# Restore to new database
sudo -u postgres createdb new_myproject_db
sudo -u postgres pg_restore -d new_myproject_db ~/backups/backup.dump
```

---

## 🆘 Troubleshooting Commands

### Check Services

```bash
# All services
sudo systemctl status gunicorn.service nginx postgresql

# List all services
sudo systemctl list-units --all | grep active

# Enable all services on boot
sudo systemctl enable gunicorn.service nginx postgresql
```

### Fix 502 Bad Gateway

```bash
# Check Gunicorn
sudo systemctl restart gunicorn.service
sudo journalctl -u gunicorn.service -n 20

# Check socket
ls -la /run/gunicorn.sock

# Test Django directly
source ~/venv/bin/activate
cd ~/myproject/backend
python manage.py shell
from django.db import connection
connection.ensure_connection()
```

### Fix Static Files

```bash
# Collect static files
cd ~/myproject/backend
python manage.py collectstatic --noinput --clear

# Check permissions
ls -la ~/myproject/backend/staticfiles/
sudo chown -R appuser:www-data ~/myproject/backend/staticfiles

# Reload NGINX
sudo systemctl reload nginx
```

### Fix Database Issues

```bash
# Check PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -l  # List databases

# Test connection
sudo -u postgres psql myproject_db -c "SELECT 1;"

# Check user permissions
sudo -u postgres psql -c "\du"
```

### View System Errors

```bash
# Recent system errors
sudo journalctl -xn -50

# Specific service errors
sudo journalctl -u gunicorn.service -b

# All errors from last hour
sudo journalctl --since 1h -p err
```

---

## 📊 Performance Monitoring

### Check Resource Usage

```bash
# Memory by process
ps aux --sort=-%mem | head

# Disk usage
du -sh ~/myproject/*
du -sh ~/logs/

# CPU usage
top -n 1 -b | grep Cpu

# Network connections
netstat -an | grep :8000
```

### Database Optimization

```bash
# Connect to database
sudo -u postgres psql myproject_db

# Check table sizes
\dt+

# Check indexes
\di

# Vacuum database
VACUUM ANALYZE;

# Exit
\q
```

---

## 🔐 Security Commands

### User Management

```bash
# Disable root login
sudo passwd -l root

# Lock user account
sudo passwd -l appuser

# Unlock user account
sudo passwd -u appuser
```

### SSH Security

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Key changes:
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes
# Protocol 2

# Restart SSH
sudo systemctl restart ssh

# Check status
sudo systemctl status ssh
```

### Fail2Ban (Optional)

```bash
# Install
sudo apt install -y fail2ban

# Configure
sudo nano /etc/fail2ban/jail.local

# Start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status sshd
```

---

## 🔧 Useful Debugging Commands

```bash
# Generate new SECRET_KEY
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Check Python version
python --version

# Check Django version
python -m django --version

# Check installed packages
pip list

# Freeze requirements
pip freeze > requirements.txt

# Count gunicorn processes
ps aux | grep gunicorn | grep -v grep | wc -l

# Show open ports
sudo lsof -i -P -n | grep LISTEN

# Check SSL certificate
sudo openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout | grep -A2 "Validity"
```

---

## 📝 Important File Paths

```
Configuration:
/etc/nginx/sites-available/myproject
/etc/nginx/sites-enabled/myproject
/etc/systemd/system/gunicorn.service
/etc/systemd/system/gunicorn.socket
/etc/supervisor/conf.d/myproject.conf

Application:
~/myproject/
~/myproject/backend/
~/myproject/frontend/
~/myproject/.env

Logs:
~/logs/
~/logs/django.log
~/logs/gunicorn_error.log
~/logs/nginx_error.log

Database:
/var/lib/postgresql/

Backups:
~/backups/
/etc/letsencrypt/live/
```

---

## ⏱️ Time Estimates

| Task                  | Time        |
| --------------------- | ----------- |
| Server setup          | 5 min       |
| Project clone & setup | 5 min       |
| Database setup        | 5 min       |
| Gunicorn setup        | 5 min       |
| NGINX setup           | 5 min       |
| SSL certificate       | 5 min       |
| Firewall setup        | 3 min       |
| Initial deployment    | 5 min       |
| **Total**             | **~40 min** |

---

**Last Updated**: January 2026  
**Ready for Production**: ✅ Yes
