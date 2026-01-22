web: python manage.py makemigrations && python manage.py migrate && python init_users.py && python manage.py collectstatic --noinput && daphne -b 0.0.0.0 -p $PORT clinic_service.asgi:application
