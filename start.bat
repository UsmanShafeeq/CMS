@echo off
REM Quick Start Script for Django React CMS Blog

echo Starting My CMS Blog...
echo.

REM Check if running from correct directory
if not exist "backend" (
    echo Error: Please run this script from the project root directory
    pause
    exit /b 1
)

echo.
echo ========================================
echo Starting Backend Server (Django)
echo ========================================
echo.
start cmd /k "cd backend && python manage.py runserver 0.0.0.0:8000"

echo.
echo Waiting 3 seconds before starting frontend...
timeout /t 3

echo.
echo ========================================
echo Starting Frontend Server (React/Vite)
echo ========================================
echo.
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Servers Starting!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173 (or 5174 if 5173 is in use)
echo Docs:     http://localhost:8000/swagger/
echo.
echo Press Ctrl+C in either terminal to stop
echo.
pause
