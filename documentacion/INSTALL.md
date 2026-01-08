# Guía de Instalación - Clinic Service

## Problema Actual

Si ves el error:
```
ModuleNotFoundError: No module named 'django'
ImportError: Couldn't import Django. Are you sure it's installed and available on your PYTHONPATH environment variable? Did you forget to activate a virtual environment?
```

Esto significa que el entorno virtual no tiene las dependencias instaladas correctamente.

## Solución Rápida

### Opción 1: Script Automático (Recomendado)

#### En Windows (CMD o PowerShell):
```bash
setup_venv.bat
```

#### En Git Bash / Linux / macOS:
```bash
chmod +x setup_venv.sh
./setup_venv.sh
```

### Opción 2: Manual

#### Paso 1: Desactivar entorno virtual actual (si está activo)
```bash
deactivate
```

#### Paso 2: Eliminar entorno virtual existente (opcional)
```bash
# Windows
rmdir /s venv

# Git Bash / Linux / macOS
rm -rf venv
```

#### Paso 3: Crear nuevo entorno virtual
```bash
python -m venv venv
```

#### Paso 4: Activar entorno virtual

**Windows CMD:**
```bash
venv\Scripts\activate.bat
```

**Windows PowerShell:**
```bash
venv\Scripts\Activate.ps1
```

**Git Bash / Linux / macOS:**
```bash
source venv/Scripts/activate
# o en Linux/macOS:
source venv/bin/activate
```

#### Paso 5: Actualizar pip
```bash
python -m pip install --upgrade pip
```

#### Paso 6: Instalar dependencias
```bash
pip install -r requirements.txt
```

#### Paso 7: Verificar instalación
```bash
pip list
```

Deberías ver:
- Django==5.2.3
- djangorestframework==3.16.0
- django-cors-headers==4.9.0
- psycopg2-binary==2.9.10
- etc.

## Verificar que el Entorno Virtual está Activo

Deberías ver `(venv)` al inicio de tu línea de comando:
```
(venv) USUARIO@DESKTOP MINGW64 /c/camsa-project
$
```

## Ejecutar Migraciones

Una vez que Django esté instalado correctamente:

```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

## Comandos Útiles

### Activar entorno virtual:
```bash
# Windows CMD
venv\Scripts\activate.bat

# Git Bash
source venv/Scripts/activate

# PowerShell
venv\Scripts\Activate.ps1
```

### Desactivar entorno virtual:
```bash
deactivate
```

### Ver paquetes instalados:
```bash
pip list
```

### Verificar versión de Django:
```bash
python -m django --version
```

### Verificar que Django puede importarse:
```bash
python -c "import django; print(django.__version__)"
```

## Problemas Comunes

### Error: "venv\Scripts\activate no es reconocido"

**Solución**: Usa la ruta completa o asegúrate de estar en el directorio del proyecto:
```bash
cd c:\camsa-project
venv\Scripts\activate
```

### Error: "execution of scripts is disabled on this system" (PowerShell)

**Solución**: Ejecuta PowerShell como administrador y ejecuta:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Luego intenta activar de nuevo:
```powershell
venv\Scripts\Activate.ps1
```

### Las dependencias se instalan en el usuario, no en el venv

**Causa**: El entorno virtual no está activado correctamente.

**Solución**:
1. Verifica que ves `(venv)` al inicio de tu terminal
2. Si no lo ves, activa el entorno virtual primero
3. NO uses `pip install --user` cuando el venv esté activo

### Error: "pip: command not found"

**Solución**: Usa `python -m pip` en lugar de `pip`:
```bash
python -m pip install -r requirements.txt
```

### El entorno virtual no se crea

**Causa**: Python no está instalado correctamente o no tiene el módulo venv.

**Solución en Windows**:
```bash
python -m pip install virtualenv
python -m virtualenv venv
```

## Estructura Esperada

Después de la instalación correcta:
```
camsa-project/
├── venv/                    # Entorno virtual (NO subir a git)
│   ├── Scripts/            # Windows
│   │   ├── activate.bat
│   │   ├── python.exe
│   │   └── pip.exe
│   └── Lib/
│       └── site-packages/  # Aquí están Django y demás paquetes
├── clinic_service/
├── accounts/
├── .env
├── requirements.txt
└── manage.py
```

## Verificación Final

Ejecuta estos comandos para verificar que todo está bien:

```bash
# 1. Verificar que el venv está activo
echo $VIRTUAL_ENV  # Git Bash / Linux
echo %VIRTUAL_ENV%  # CMD

# 2. Verificar Python
python --version

# 3. Verificar Django
python -c "import django; print(django.__version__)"

# 4. Verificar que manage.py funciona
python manage.py --version

# 5. Verificar conexión a base de datos
python manage.py check --database default
```

Si todos estos comandos funcionan, ¡estás listo para continuar!

## Próximos Pasos

1. Crear la base de datos PostgreSQL (ver [SETUP_DATABASE.md](SETUP_DATABASE.md))
2. Ejecutar migraciones
3. Crear superusuario
4. Iniciar servidor de desarrollo

## Notas Importantes

- **Siempre activa el entorno virtual** antes de trabajar en el proyecto
- El entorno virtual está en `.gitignore`, no se sube a git
- Cada desarrollador debe crear su propio entorno virtual
- Si agregas nuevas dependencias, actualiza `requirements.txt`:
  ```bash
  pip freeze > requirements.txt
  ```
