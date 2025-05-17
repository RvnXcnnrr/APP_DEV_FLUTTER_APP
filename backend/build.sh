#!/usr/bin/env bash
# exit on error
set -o errexit

# Print current directory for debugging
echo "Current directory: $(pwd)"
echo "Directory contents: $(ls -la)"

# Install dependencies using Poetry from the root directory
poetry install

# Change to the backend directory
cd backend

# Print backend directory for debugging
echo "Backend directory: $(pwd)"
echo "Backend directory contents: $(ls -la)"

# Collect static files
python manage.py collectstatic --no-input

# Apply database migrations
python manage.py migrate
