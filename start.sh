#!/bin/bash

echo "================================================"
echo "Starting Django deployment on Railway"
echo "================================================"

# Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the application server
echo "Starting Daphne server..."
daphne -b 0.0.0.0 -p $PORT clinic_service.asgi:application
