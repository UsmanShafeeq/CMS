# QUICK SETUP GUIDE

## Production Deployment in 30 Minutes

> This is a condensed version of PRODUCTION_DEPLOYMENT.md for quick reference

---

## Prerequisites

- Ubuntu 20.04+ LTS server
- Root or sudo access
- Domain name (for SSL)
- Git repository access

---

## 🚀 Quick Setup Commands

### 1. Initial Server Setup (5 minutes)

```bash
# SSH into server
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Install packages
apt install -y python3 python3-pip python3-venv postgresql postgresql-contrib \
    nginx git curl wget ufw supervisor build-essential libpq-dev \
    nodejs npm certbot python3-certbot-nginx redis-server

# Create app user
useradd -m -s /bin/bash appuser
su - appuser
```

### 2. Setup Project (5 minutes)

```bash
# Create directories
mkdir -p ~/myproject ~/venv ~/logs ~/backups

# Clone project
cd ~/myproject
git clone https://github.com/yourusername/django-react-crud.git .

# Setup Python environment
python3 -m venv ~/venv
source ~/venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment (3 minutes)

```bash
# Create .env file
cd ~/myproject
nano .env
```

Paste this and edit values:

```bash
DEBUG=False
SECRET_KEY=generate-with-python
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=myproject_db
DATABASE_USER=myproject_user
DATABASE_PASSWORD=strong-password
DATABASE_HOST=localhost
DATABASE_PORT=5432
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### 4. Build Frontend (5 minutes)

```bash
cd ~/myproject/frontend
npm install
npm run build
```

### 5. Setup Database (3 minutes)

```bash
sudo -u postgres psql

# Inside psql:
CREATE DATABASE myproject_db;
CREATE USER myproject_user WITH PASSWORD 'strong-password';
ALTER ROLE myproject_user SET client_encoding TO 'utf8';
ALTER ROLE myproject_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE myproject_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE myproject_db TO myproject_user;
\q

# Run migrations
source ~/venv/bin/activate
cd ~/myproject/backend
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

### 6. Setup Gunicorn (2 minutes)

```bash
# Copy systemd files
sudo cp ~/myproject/gunicorn.service /etc/systemd/system/
sudo cp ~/myproject/gunicorn.socket /etc/systemd/system/

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable gunicorn.socket gunicorn.service
sudo systemctl start gunicorn.socket gunicorn.service
```

### 7. Setup NGINX (2 minutes)

Create `/etc/nginx/sites-available/myproject`:

```nginx
upstream django_app {
    server unix:/run/gunicorn.sock fail_timeout=0;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/javascript;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    client_max_body_size 50M;

    # React frontend
    location / {
        alias /home/appuser/myproject/frontend/dist/;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://django_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin
    location /admin/ {
        proxy_pass http://django_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /home/appuser/myproject/backend/staticfiles/;
        expires 30d;
    }

    # Media files
    location /media/ {
        alias /home/appuser/myproject/backend/media/;
    }
}
```

Enable NGINX:

```bash
sudo ln -s /etc/nginx/sites-available/myproject /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Get SSL Certificate (2 minutes)

```bash
sudo certbot certonly --webroot \
    -w /var/www/certbot \
    -d yourdomain.com \
    -d www.yourdomain.com
```

Update NGINX with certificate paths and reload:

```bash
sudo systemctl reload nginx
```

### 9. Setup Firewall (1 minute)

```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

### 10. Verify Setup

```bash
# Check services
sudo systemctl status gunicorn.service
sudo systemctl status nginx
sudo systemctl status postgresql

# Test endpoints
curl https://yourdomain.com
curl https://yourdomain.com/api/
curl https://yourdomain.com/admin/
```

---

## 📋 Essential Commands

### Service Management

```bash
# Gunicorn
sudo systemctl start/stop/restart gunicorn.service
sudo systemctl status gunicorn.service
sudo journalctl -u gunicorn.service -f

# NGINX
sudo systemctl start/stop/restart/reload nginx
sudo systemctl status nginx
sudo tail -f /home/appuser/logs/nginx_error.log

# PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql
```

### Deployment

```bash
# Pull and deploy
cd ~/myproject
git pull origin main
source ~/venv/bin/activate
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn.service
sudo systemctl reload nginx
```

### Database

```bash
# Backup
sudo -u postgres pg_dump -Fc myproject_db > backup.dump

# Restore
sudo -u postgres pg_restore -d myproject_db backup.dump

# Connect
sudo -u postgres psql myproject_db
```

### Logs

```bash
tail -f /home/appuser/logs/django.log
tail -f /home/appuser/logs/gunicorn_error.log
tail -f /home/appuser/logs/nginx_error.log
sudo journalctl -u gunicorn.service -f
```

---

## 🔐 Security Checklist

- [ ] Set `DEBUG=False`
- [ ] Generate strong `SECRET_KEY`
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (UFW)
- [ ] Disable root SSH login
- [ ] Use SSH keys only
- [ ] Set strong database password
- [ ] Configure CORS correctly
- [ ] Setup automatic backups
- [ ] Monitor logs

---

## 📊 Performance Tips

1. **Gunicorn workers**: `(2 × CPU cores) + 1`
2. **NGINX caching**: Set for static files (30 days)
3. **Gzip compression**: Enabled for text files
4. **Database indexes**: On frequently queried fields
5. **Use PostgreSQL**: Not SQLite for production

---

## 🆘 Troubleshooting

### 502 Bad Gateway

```bash
sudo systemctl restart gunicorn.service
sudo journalctl -u gunicorn.service -n 20
```

### Static Files Missing

```bash
cd ~/myproject/backend
python manage.py collectstatic --noinput --clear
```

### Database Connection Error

```bash
sudo -u postgres psql
\l  # List databases
\du # List users
```

---

## 📞 For More Details

See `PRODUCTION_DEPLOYMENT.md` for:

- Advanced NGINX configuration
- Monitoring and logging setup
- Backup strategies
- Scaling options
- Advanced troubleshooting

---

**Time to deploy**: ~30 minutes ⏱️
