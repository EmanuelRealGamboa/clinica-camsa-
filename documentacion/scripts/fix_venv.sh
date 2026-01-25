#!/bin/bash

echo "========================================"
echo "Reparando Entorno Virtual"
echo "========================================"
echo ""

echo "[INFO] Activando entorno virtual..."
source venv/Scripts/activate

echo ""
echo "[INFO] Instalando dependencias en el entorno virtual..."
python -m pip install --no-cache-dir Django==5.2.3
python -m pip install --no-cache-dir djangorestframework==3.16.0
python -m pip install --no-cache-dir djangorestframework-simplejwt==5.5.1
python -m pip install --no-cache-dir django-cors-headers==4.9.0
python -m pip install --no-cache-dir python-dotenv==1.1.1
python -m pip install --no-cache-dir psycopg2-binary==2.9.10
python -m pip install --no-cache-dir dj-database-url==3.0.1

echo ""
echo "[INFO] Verificando instalación..."
python -c "import django; print('Django version:', django.__version__)"

if [ $? -ne 0 ]; then
    echo "[ERROR] Django no se pudo importar"
    exit 1
fi

echo ""
echo "[SUCCESS] Django instalado correctamente!"
echo ""
echo "Ahora puedes ejecutar:"
echo "  python manage.py makemigrations"
echo "  python manage.py migrate"
echo ""
