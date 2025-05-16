@echo off
echo Installing Pillow for image support...
call ..\venv\Scripts\activate

echo Trying to install latest Pillow version...
pip install Pillow

echo Installation complete!
