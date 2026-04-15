#!/usr/bin/env bash
# script de build pour Render

set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Initialisation du SuperAdministrateur par défaut dans la base cloud PostgreSQL vierge
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@pharmacie.com', '12345')"
