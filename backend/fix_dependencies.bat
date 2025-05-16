@echo off
echo Checking virtual environment...

if not exist ..\venv (
    echo Virtual environment not found. Creating new one...
    python -m venv ..\venv
)

echo Activating virtual environment...
call ..\venv\Scripts\activate

echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing setuptools and wheel packages...
pip install setuptools wheel

echo Installing individual packages to handle potential build issues...
pip install Django==5.0.6
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.3.1
pip install Pillow==10.2.0
pip install python-decouple==3.8
pip install dj-rest-auth==5.0.2
pip install djangorestframework-simplejwt==5.3.1
pip install django-allauth==0.58.2
pip install psycopg2-binary==2.9.9
pip install gunicorn==21.2.0
pip install whitenoise==6.6.0
pip install drf-yasg==1.21.7

echo Installation complete!
echo You can now run the server with: .\run_server.bat
