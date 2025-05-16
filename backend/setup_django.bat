@echo off
echo Creating virtual environment...
python -m venv ..\venv
call ..\venv\Scripts\activate

echo Installing setuptools and wheel packages...
pip install setuptools wheel

echo Creating Django project...
django-admin startproject motion_detector_backend .

echo Creating Django apps...
cd motion_detector_backend
django-admin startapp users
django-admin startapp sensors
cd ..

echo Setup complete!
echo Run the server with: python manage.py runserver
