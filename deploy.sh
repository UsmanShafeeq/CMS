#!/bin/bash

# ==========================================
# Automated Deployment Script
# Django + React Application
# Usage: bash deploy.sh
# ==========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/appuser/myproject"
VENV_DIR="/home/appuser/venv"
LOGS_DIR="/home/appuser/logs"
GIT_REPO="https://github.com/yourusername/django-react-crud.git"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Django + React Deployment Script${NC}"
echo -e "${YELLOW}========================================${NC}"

# ==========================================
# Step 1: Pre-deployment checks
# ==========================================
echo -e "\n${YELLOW}[1/8] Running pre-deployment checks...${NC}"

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}ERROR: Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi

if [ ! -d "$VENV_DIR" ]; then
    echo -e "${RED}ERROR: Virtual environment not found: $VENV_DIR${NC}"
    exit 1
fi

if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${RED}ERROR: .env file not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Pre-deployment checks passed${NC}"

# ==========================================
# Step 2: Pull latest code
# ==========================================
echo -e "\n${YELLOW}[2/8] Pulling latest code from git...${NC}"

cd "$PROJECT_DIR"
git fetch origin
git pull origin main

echo -e "${GREEN}✓ Code updated${NC}"

# ==========================================
# Step 3: Activate virtual environment
# ==========================================
echo -e "\n${YELLOW}[3/8] Activating virtual environment...${NC}"

source "$VENV_DIR/bin/activate"

echo -e "${GREEN}✓ Virtual environment activated${NC}"

# ==========================================
# Step 4: Install/Update Python dependencies
# ==========================================
echo -e "\n${YELLOW}[4/8] Installing Python dependencies...${NC}"

cd "$PROJECT_DIR/backend"
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo -e "${GREEN}✓ Python dependencies installed${NC}"

# ==========================================
# Step 5: Build React frontend
# ==========================================
echo -e "\n${YELLOW}[5/8] Building React frontend...${NC}"

cd "$PROJECT_DIR/frontend"

# Install Node dependencies
npm install

# Build for production
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}ERROR: React build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ React build completed${NC}"

# ==========================================
# Step 6: Django setup
# ==========================================
echo -e "\n${YELLOW}[6/8] Running Django setup...${NC}"

cd "$PROJECT_DIR/backend"

# Migrate database
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

echo -e "${GREEN}✓ Django setup completed${NC}"

# ==========================================
# Step 7: Reload services
# ==========================================
echo -e "\n${YELLOW}[7/8] Reloading services...${NC}"

# Restart Gunicorn
sudo systemctl restart gunicorn.service

# Reload NGINX
sudo systemctl reload nginx

# Wait for services to restart
sleep 2

echo -e "${GREEN}✓ Services reloaded${NC}"

# ==========================================
# Step 8: Post-deployment checks
# ==========================================
echo -e "\n${YELLOW}[8/8] Running post-deployment checks...${NC}"

# Check if services are running
if ! sudo systemctl is-active --quiet gunicorn.service; then
    echo -e "${RED}ERROR: Gunicorn is not running${NC}"
    sudo journalctl -u gunicorn.service -n 20
    exit 1
fi

if ! sudo systemctl is-active --quiet nginx; then
    echo -e "${RED}ERROR: NGINX is not running${NC}"
    sudo journalctl -u nginx -n 20
    exit 1
fi

# Test API endpoint
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null || echo "000")

if [ "$API_STATUS" != "200" ]; then
    echo -e "${RED}WARNING: Health check returned status $API_STATUS${NC}"
else
    echo -e "${GREEN}✓ Health check passed${NC}"
fi

# ==========================================
# Deployment Summary
# ==========================================
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Service Status:"
sudo systemctl status gunicorn.service --no-pager | grep "Active:"
sudo systemctl status nginx --no-pager | grep "Active:"
echo ""
echo "Application URL: https://yourdomain.com"
echo "Admin Panel: https://yourdomain.com/admin/"
echo "API Documentation: https://yourdomain.com/api/docs/"
echo ""
echo "View logs with:"
echo "  - Django logs: tail -f $LOGS_DIR/django.log"
echo "  - Gunicorn logs: tail -f $LOGS_DIR/gunicorn_error.log"
echo "  - NGINX logs: tail -f $LOGS_DIR/nginx_error.log"
echo ""
echo "To rollback, run: git revert <commit_hash>"
echo ""

deactivate
