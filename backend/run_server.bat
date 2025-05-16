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

echo Starting Django server...
python manage.py runserver 0.0.0.0:8000
