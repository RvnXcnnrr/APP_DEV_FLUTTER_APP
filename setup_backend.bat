@echo off
echo Setting up backend environment...
cd backend
call fix_dependencies.bat
call init_db.bat
