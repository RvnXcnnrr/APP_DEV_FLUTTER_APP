@echo off
echo Activating virtual environment...
call ..\venv\Scripts\activate

echo Making migrations...
python manage.py makemigrations users
python manage.py makemigrations sensors

echo Applying migrations...
python manage.py migrate

echo Creating superuser...
python manage.py createsuperuser

echo Creating media directories...
mkdir media
mkdir media\profile_pictures
mkdir media\motion_events

echo Database initialization complete!
