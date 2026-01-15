# Production Deployment Checklist

## Pre-Deployment

- [ ] Code review completed
- [ ] All tests passing
- [ ] Dependencies updated and tested
- [ ] Database migrations reviewed
- [ ] Static files ready
- [ ] Environment variables configured

## Security Checklist

- [ ] `DEBUG = False` in settings
- [ ] `SECRET_KEY` is strong and secret
- [ ] `ALLOWED_HOSTS` configured correctly
- [ ] CORS origins restricted to trusted domains
- [ ] HTTPS/SSL certificates installed
- [ ] Security headers enabled in NGINX
- [ ] Rate limiting configured
- [ ] CSRF protection enabled
- [ ] SQL injection protection (via ORM)
- [ ] XSS protection enabled

## Configuration Checklist

- [ ] Database credentials set in `.env`
- [ ] Email settings configured
- [ ] Media file storage configured
- [ ] Static files collected
- [ ] Logging configured and tested
- [ ] Error notifications set up
- [ ] Backup strategy in place

## Docker Checklist

- [ ] Docker and Docker Compose installed
- [ ] `.env` file created from `.env.example`
- [ ] All required images built
- [ ] Volumes created
- [ ] Networks configured
- [ ] Port mappings verified

## Deployment Steps

1. **Prepare**

   ```bash
   git pull origin main
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Build**

   ```bash
   docker-compose build
   ```

3. **Start Services**

   ```bash
   docker-compose up -d
   ```

4. **Initialize Database**

   ```bash
   docker-compose exec django python manage.py migrate
   docker-compose exec django python manage.py createsuperuser
   docker-compose exec django python manage.py collectstatic --noinput
   ```

5. **Verify**

   ```bash
   docker-compose ps
   curl http://localhost/health
   curl http://localhost/api/
   curl http://localhost/admin/
   ```

6. **Monitor**
   ```bash
   docker-compose logs -f
   ```

## Post-Deployment

- [ ] All endpoints responding correctly
- [ ] Logs created and rotating properly
- [ ] Performance metrics acceptable
- [ ] Backups running on schedule
- [ ] Monitoring and alerting active
- [ ] Team notified of deployment

## Rollback Procedure

If deployment fails:

```bash
# Stop current containers
docker-compose down

# Checkout previous version
git checkout previous-tag

# Rebuild and restart
docker-compose build
docker-compose up -d
```

## Monitoring Metrics

Monitor these in production:

- **Response times**: Should be < 500ms for most endpoints
- **Error rate**: Should be < 1%
- **CPU usage**: Should be < 80%
- **Memory usage**: Should be < 80%
- **Disk usage**: Monitor logs directory size

## Backup Strategy

1. **Database**: Daily automated backups
2. **Media files**: Backup to S3 or external storage
3. **Configuration**: Version control in git
4. **Logs**: Retain for 30 days

```bash
# Manual backup
docker-compose exec db pg_dump -U django_user django_db | gzip > backup.sql.gz

# Restore from backup
gunzip backup.sql.gz
docker-compose exec -T db psql -U django_user django_db < backup.sql
```

## Troubleshooting

### Service won't start

```bash
docker-compose logs <service_name>
docker-compose build --no-cache
docker-compose up -d
```

### Database connection error

```bash
docker-compose exec django python manage.py shell
from django.db import connection
connection.ensure_connection()
```

### Static files not loading

```bash
docker-compose exec django python manage.py collectstatic --noinput
docker-compose restart nginx
```

### High memory usage

```bash
docker stats
docker-compose exec django python manage.py shell
# Check for memory leaks
```

## Useful Commands

```bash
# View all logs
docker-compose logs

# View specific service logs with tail
docker-compose logs -f nginx

# Enter container shell
docker-compose exec django bash

# Run management commands
docker-compose exec django python manage.py <command>

# Database operations
docker-compose exec db psql -U django_user -d django_db

# Check container health
docker-compose ps

# Remove everything and start fresh
docker-compose down -v
docker-compose up -d
```
