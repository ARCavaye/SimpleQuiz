#!/bin/bash

cd /app/src

# Wait for the database to be ready
# until python manage.py migrate --check; do
#   echo "Waiting for the database to be ready..."
#   sleep 2
# done

# Run database migrations
python manage.py migrate

# Start the Django development server
exec python manage.py runserver 0.0.0.0:8000