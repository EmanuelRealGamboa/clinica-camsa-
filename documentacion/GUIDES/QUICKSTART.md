# 🚀 Quick Start - CAMSA Project

## Pasos Rápidos de Configuración

### 1️⃣ Aplicar Migraciones
```bash
cd clinica-camsa-
.\venv\Scripts\activate
python manage.py migrate
```

### 2️⃣ Crear Superusuario
```bash
python manage.py createsuperuser
# Email: admin@camsa.com
# Full name: Admin CAMSA
# Password: (tu elección, ej: Camsa2026!Admin)
```

### 3️⃣ Cargar Datos de Prueba
```bash
python manage.py seed_demo_data
```

### 4️⃣ Iniciar Backend (Terminal 1)
```bash
cd clinica-camsa-
.\venv\Scripts\activate
python manage.py runserver
```
→ Backend en: http://localhost:8000

### 5️⃣ Iniciar Frontend (Terminal 2)
```bash
cd clinica-camsa-/frontend
npm run dev
```
→ Frontend en: http://localhost:5173

## 🎯 URLs Principales

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Admin Panel** | http://localhost:5173/admin/login | `enfermera.maria@camsa.com` / `staff123` |
| **Kiosk** | http://localhost:5173/kiosk/IPAD-01 | No requiere login |
| **Django Admin** | http://localhost:8000/admin | `admin@camsa.com` / (tu password) |

## 📦 Datos Creados

- ✅ 3 usuarios staff
- ✅ 12 productos (4 categorías)
- ✅ 5 salas
- ✅ 4 dispositivos (3 iPads + 1 Web)
- ✅ 3 pacientes con asignaciones
- ✅ Inventario inicial: 100 unidades por producto

## 📚 Documentación Completa

Ver [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) para instrucciones detalladas.

## ⚡ Troubleshooting Rápido

**Error de base de datos:**
```bash
psql -U postgres
CREATE DATABASE camsa_db;
\q
```

**Reinstalar dependencias Python:**
```bash
.\venv\Scripts\activate
pip install -r requirements.txt
```

**Reinstalar dependencias Frontend:**
```bash
cd frontend
npm install
```

¡Listo para empezar! 🎉
