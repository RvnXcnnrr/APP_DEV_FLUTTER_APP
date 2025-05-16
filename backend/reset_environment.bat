@echo off
echo This script will completely reset your virtual environment.
echo All installed packages will be removed and reinstalled.
echo.

set /p confirm=Are you sure you want to continue? (y/n):
if /i not "%confirm%"=="y" (
    echo Operation cancelled.
    exit /b 0
)

echo.
echo Removing existing virtual environment...
if exist ..\venv (
    rmdir /s /q ..\venv
    echo Existing virtual environment removed.
) else (
    echo No existing virtual environment found.
)

echo.
echo Creating new virtual environment...
python -m venv ..\venv
if %ERRORLEVEL% neq 0 (
    echo Failed to create virtual environment.
    exit /b 1
)

echo.
echo Activating virtual environment...
call ..\venv\Scripts\activate
if %ERRORLEVEL% neq 0 (
    echo Failed to activate virtual environment.
    exit /b 1
)

echo.
echo Upgrading pip...
python -m pip install --upgrade pip

echo.
echo Installing setuptools and wheel packages...
pip install setuptools wheel

echo.
echo Installing all required packages...
pip install Django==5.0.6
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.3.1
pip install Pillow==10.2.0
pip install python-decouple==3.8
pip install dj-rest-auth==5.0.2
pip install djangorestframework-simplejwt==5.3.1
pip install django-allauth==0.58.2
rem Skip psycopg2-binary as it requires PostgreSQL client libraries
rem pip install psycopg2-binary==2.9.9
pip install gunicorn==21.2.0
pip install whitenoise==6.6.0
pip install drf-yasg==1.21.7

echo.
echo Environment reset complete!
echo You can now run the server with: .\run_server.bat
echo.
