#!/bin/bash

# ==========================================
# Health Check & Monitoring Script
# ==========================================

LOGS_DIR="/home/appuser/logs"

echo "========================================="
echo "Application Health Check - $(date)"
echo "========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Check Gunicorn
echo "1. Gunicorn Service:"
if sudo systemctl is-active --quiet gunicorn.service; then
    echo -e "${GREEN}   ✓ Running${NC}"
else
    echo -e "${RED}   ✗ Not running${NC}"
    sudo systemctl restart gunicorn.service
fi

# 2. Check NGINX
echo ""
echo "2. NGINX Service:"
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}   ✓ Running${NC}"
else
    echo -e "${RED}   ✗ Not running${NC}"
    sudo systemctl restart nginx
fi

# 3. Check PostgreSQL
echo ""
echo "3. PostgreSQL Service:"
if sudo systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}   ✓ Running${NC}"
else
    echo -e "${RED}   ✗ Not running${NC}"
    sudo systemctl restart postgresql
fi

# 4. Check Disk Space
echo ""
echo "4. Disk Usage:"
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}   ✓ $DISK_USAGE% used${NC}"
else
    echo -e "${RED}   ✗ $DISK_USAGE% used (Warning!)${NC}"
fi

# 5. Check Memory Usage
echo ""
echo "5. Memory Usage:"
MEM_USAGE=$(free | awk 'NR==2 {printf("%.0f", $3/$2 * 100)}')
if [ "$MEM_USAGE" -lt 80 ]; then
    echo -e "${GREEN}   ✓ $MEM_USAGE% used${NC}"
else
    echo -e "${RED}   ✗ $MEM_USAGE% used (Warning!)${NC}"
fi

# 6. Health Endpoint
echo ""
echo "6. API Health Check:"
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)
if [ "$HEALTH_STATUS" = "200" ]; then
    echo -e "${GREEN}   ✓ API responding ($HEALTH_STATUS)${NC}"
else
    echo -e "${RED}   ✗ API not responding ($HEALTH_STATUS)${NC}"
fi

# 7. Recent Errors
echo ""
echo "7. Recent Errors (last 10):"
if [ -f "$LOGS_DIR/gunicorn_error.log" ]; then
    ERROR_COUNT=$(tail -50 "$LOGS_DIR/gunicorn_error.log" | grep -i "error" | wc -l)
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}   ⚠ Found $ERROR_COUNT errors${NC}"
        tail -5 "$LOGS_DIR/gunicorn_error.log" | grep -i "error"
    else
        echo -e "${GREEN}   ✓ No recent errors${NC}"
    fi
fi

# 8. Process Count
echo ""
echo "8. Gunicorn Workers:"
WORKER_COUNT=$(ps aux | grep "gunicorn" | grep -v grep | wc -l)
echo "   $WORKER_COUNT processes"

echo ""
echo "========================================="
echo "Health check completed at $(date)"
echo "========================================="
