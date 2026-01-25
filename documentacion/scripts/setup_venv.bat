@echo off
echo ========================================
echo Configurando Entorno Virtual
echo ========================================
echo.

REM Verificar si existe el entorno virtual
if exist venv\Scripts\activate.bat (
    echo [OK] Entorno virtual encontrado
) else (
    echo [INFO] Creando entorno virtual...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] No se pudo crear el entorno virtual
        pause
        exit /b 1
    )
    echo [OK] Entorno virtual creado
)

echo.
echo [INFO] Activando entorno virtual...
call venv\Scripts\activate.bat

echo.
echo [INFO] Actualizando pip...
python -m pip install --upgrade pip

echo.
echo [INFO] Instalando dependencias desde requirements.txt...
pip install -r requirements.txt

if errorlevel 1 (
    echo [ERROR] Hubo un problema al instalar las dependencias
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Configuracion completa!
echo ========================================
echo.
echo Para activar el entorno virtual en el futuro, ejecuta:
echo   venv\Scripts\activate
echo.
echo Para desactivar:
echo   deactivate
echo.
pause
