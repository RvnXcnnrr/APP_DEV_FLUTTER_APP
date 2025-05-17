@echo off
echo Checking virtual environment...

if not exist ..\venv (
    echo Virtual environment not found. Please run fix_dependencies.bat first.
    exit /b 1
)

echo Activating virtual environment...
call ..\venv\Scripts\activate

if %ERRORLEVEL% neq 0 (
    echo Failed to activate virtual environment. Please run fix_dependencies.bat first.
    exit /b 1
)

echo Starting server with WebSocket support...
daphne -b 0.0.0.0 -p 8000 motion_detector_backend.asgi:application

rem Alternative: Use Django's built-in server (WebSockets won't work)
rem python manage.py runserver 0.0.0.0:8000
