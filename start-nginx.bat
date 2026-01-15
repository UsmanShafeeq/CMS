@echo off
REM This script starts the Django React application with Nginx on Windows

echo Starting Django React CRUD with Nginx...
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running as administrator
) else (
    echo [ERROR] This script requires administrator privileges
    echo Please run as administrator
    pause
    exit /b 1
)

REM Build React frontend
echo.
echo [Step 1] Building React frontend...
cd frontend
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
npm run build
if errorLevel 1 (
    echo [ERROR] Failed to build frontend
    pause
    exit /b 1
)
cd ..
echo [OK] Frontend built successfully

REM Install Python dependencies
echo.
echo [Step 2] Installing Python dependencies...
cd backend
pip install -q -r requirements.txt
if errorLevel 1 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)

REM Collect static files
echo.
echo [Step 3] Collecting Django static files...
python manage.py collectstatic --noinput
if errorLevel 1 (
    echo [ERROR] Failed to collect static files
    pause
    exit /b 1
)
echo [OK] Static files collected
cd ..

REM Start Nginx
echo.
echo [Step 4] Starting Nginx...
echo Please ensure Nginx is installed at C:\nginx
if not exist C:\nginx\nginx.exe (
    echo [ERROR] Nginx not found at C:\nginx
    echo Please download and install Nginx from https://nginx.org/en/download.html
    pause
    exit /b 1
)

REM Copy nginx config
copy nginx.conf C:\nginx\conf\nginx.conf
cd C:\nginx
start nginx.exe
echo [OK] Nginx started on port 80

REM Start Gunicorn
echo.
echo [Step 5] Starting Django with Gunicorn...
cd %~dp0backend
start cmd /k "pip install -q gunicorn && gunicorn backend.wsgi:application --bind 127.0.0.1:8000 --workers 4 --reload"
echo [OK] Django started on port 8000

echo.
echo ============================================
echo Application is running!
echo ============================================
echo.
echo Access the application at: http://localhost
echo.
echo Django Admin: http://localhost/admin/
echo API: http://localhost/api/
echo.
echo Frontend dist: %~dp0frontend\dist\
echo.
echo To stop:
echo - Close the Django/Gunicorn command prompt
echo - Run: nginx -s stop (from C:\nginx)
echo.
pause
