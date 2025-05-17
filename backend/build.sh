#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies using Poetry
poetry install

# Collect static files
python manage.py collectstatic --no-input

# Apply database migrations
python manage.py migrate
