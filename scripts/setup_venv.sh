#!/bin/bash

echo "========================================"
echo "Configurando Entorno Virtual"
echo "========================================"
echo ""

# Verificar si existe el entorno virtual
if [ -d "venv" ]; then
    echo "[OK] Entorno virtual encontrado"
else
    echo "[INFO] Creando entorno virtual..."
    python -m venv venv
    if [ $? -ne 0 ]; then
        echo "[ERROR] No se pudo crear el entorno virtual"
        exit 1
    fi
    echo "[OK] Entorno virtual creado"
fi

echo ""
echo "[INFO] Activando entorno virtual..."
source venv/Scripts/activate

echo ""
echo "[INFO] Actualizando pip..."
python -m pip install --upgrade pip

echo ""
echo "[INFO] Instalando dependencias desde requirements.txt..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "[ERROR] Hubo un problema al instalar las dependencias"
    exit 1
fi

echo ""
echo "========================================"
echo "[SUCCESS] Configuración completa!"
echo "========================================"
echo ""
echo "Para activar el entorno virtual en el futuro, ejecuta:"
echo "  source venv/Scripts/activate"
echo ""
echo "Para desactivar:"
echo "  deactivate"
echo ""
