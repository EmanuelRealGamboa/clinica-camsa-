# Guía para Subir el Proyecto a Otro Repositorio (Railway)

Esta guía te ayudará a crear una copia del proyecto en otro repositorio para desplegarlo en Railway.

## 📚 Documentación Completa

Para la guía completa de configuración en Railway con todas las variables de entorno y pasos detallados, consulta: **[RAILWAY_SETUP.md](./RAILWAY_SETUP.md)**

## 🎯 Repositorio de la Empresa

- **URL del Repositorio**: `https://github.com/Quint4n4/MenuInteractivo.git`
- **Remote Name**: `railway`
- **Estado**: Configurado y listo para push

## Opción 1: Agregar un Nuevo Remote (Recomendado)

Esta opción te permite mantener ambos repositorios sincronizados.

### Pasos:

1. **Crea el nuevo repositorio en GitHub/GitLab/etc.**
   - Crea un repositorio vacío en tu plataforma preferida
   - Copia la URL del repositorio (ej: `https://github.com/usuario/nuevo-repo.git`)

2. **Agrega el nuevo remote usando el script:**
   
   **En Windows (PowerShell):**
   ```powershell
   .\scripts\add_railway_remote.ps1 -NewRepoUrl "https://github.com/usuario/nuevo-repo.git"
   ```
   
   **En Linux/Mac:**
   ```bash
   chmod +x scripts/add_railway_remote.sh
   ./scripts/add_railway_remote.sh https://github.com/usuario/nuevo-repo.git
   ```

3. **O manualmente:**
   ```bash
   # Agregar el nuevo remote (ya configurado)
   git remote add railway https://github.com/Quint4n4/MenuInteractivo.git
   
   # Verificar que se agregó correctamente
   git remote -v
   
   # Hacer push al nuevo repositorio
   git push railway main
   ```

**⚠️ Nota sobre Permisos**: Si obtienes un error de permisos al hacer push, necesitas:
1. Autenticarte con GitHub usando tus credenciales de la cuenta de la empresa
2. O configurar un token de acceso personal (PAT) en GitHub
3. O usar SSH en lugar de HTTPS: `git remote set-url railway git@github.com:Quint4n4/MenuInteractivo.git`

### Ventajas:
- ✅ Mantienes ambos repositorios sincronizados
- ✅ Puedes hacer push a ambos con comandos separados
- ✅ El repositorio original sigue funcionando normalmente

### Comandos útiles:

```bash
# Ver todos los remotes
git remote -v

# Hacer push solo al repositorio original
git push origin main

# Hacer push solo al repositorio de Railway
git push railway main

# Hacer push a ambos repositorios
git push origin main
git push railway main

# Eliminar un remote (si es necesario)
git remote remove railway
```

---

## Opción 2: Cambiar el Remote (Solo un Repositorio)

Si solo quieres usar el nuevo repositorio y no necesitas mantener el original:

```bash
# Cambiar la URL del remote origin
git remote set-url origin https://github.com/usuario/nuevo-repo.git

# Verificar
git remote -v

# Hacer push
git push origin main
```

---

## Opción 3: Clonar y Cambiar Remote

Si prefieres trabajar con una copia completamente separada:

```bash
# Clonar el repositorio actual
git clone https://github.com/EmanuelRealGamboa/clinica-camsa-.git proyecto-railway
cd proyecto-railway

# Cambiar el remote
git remote set-url origin https://github.com/usuario/nuevo-repo.git

# Hacer push
git push origin main
```

---

## Configuración para Railway

Una vez que tengas el código en el nuevo repositorio:

1. **Conecta Railway al nuevo repositorio:**
   - En Railway, crea un nuevo proyecto
   - Selecciona "Deploy from GitHub repo"
   - Elige el repositorio: `Quint4n4/MenuInteractivo`

2. **Variables de entorno:**
   - **Consulta la guía completa**: [RAILWAY_SETUP.md](./RAILWAY_SETUP.md)
   - Railway leerá automáticamente los archivos `.env.example`
   - Configura todas las variables de entorno en el dashboard de Railway
   - **IMPORTANTE**: Genera una nueva `SECRET_KEY` para el proyecto de la empresa

3. **Build y Deploy:**
   - Railway detectará automáticamente que es un proyecto Django + React
   - El `Procfile` ya está configurado correctamente
   - Los usuarios iniciales se crearán automáticamente en el primer deploy

### 📋 Checklist Rápido

- [ ] Repositorio creado: `https://github.com/Quint4n4/MenuInteractivo.git`
- [ ] Remote agregado: `git remote add railway <url>`
- [ ] Push completado: `git push railway main`
- [ ] Proyecto creado en Railway
- [ ] Base de datos PostgreSQL agregada
- [ ] Variables de entorno configuradas (ver [RAILWAY_SETUP.md](./RAILWAY_SETUP.md))
- [ ] Deployment exitoso
- [ ] Credenciales iniciales cambiadas

---

## Notas Importantes

- ⚠️ **No olvides configurar las variables de entorno** en Railway (ver [RAILWAY_SETUP.md](./RAILWAY_SETUP.md))
- ⚠️ **Genera una nueva SECRET_KEY** para el proyecto de la empresa (no uses la misma del proyecto personal)
- ⚠️ **El proyecto tendrá una base de datos limpia** - no se subirán datos de usuarios
- ⚠️ **Los usuarios iniciales se crearán automáticamente** con `init_users.py` en el primer deploy
- ⚠️ **Cambia las credenciales por defecto** después del primer deployment
- ⚠️ **Mantén ambos proyectos separados**: 
  - Proyecto personal: `origin` → tu Railway personal
  - Proyecto empresa: `railway` → nuevo Railway de la empresa

## 🔒 Verificación de Seguridad

Antes de hacer push, verifica que no se suban archivos sensibles:

```powershell
# Ejecutar script de verificación
.\scripts\verify_clean_push.ps1
```

Este script verificará que no haya archivos `.env`, `db.sqlite3`, o otros archivos sensibles en staging.

---

## Troubleshooting

### Error: "remote already exists"
Si el remote ya existe, puedes:
- Eliminarlo: `git remote remove railway`
- O usar otro nombre: `git remote add railway2 <url>`

### Error: "Permission denied"
- Verifica que tienes acceso al nuevo repositorio
- Puede que necesites autenticarte con GitHub/GitLab

### Error: "Repository not found"
- Verifica que el repositorio existe: `https://github.com/Quint4n4/MenuInteractivo.git`
- Verifica que tienes permisos de escritura en el repositorio de la empresa
- Puede que necesites ser agregado como colaborador en el repositorio

### Error: "Permission denied" al hacer push
**Solución**:
1. **Opción 1 - Autenticación con GitHub CLI:**
   ```powershell
   gh auth login
   git push railway main
   ```

2. **Opción 2 - Usar SSH en lugar de HTTPS:**
   ```powershell
   git remote set-url railway git@github.com:Quint4n4/MenuInteractivo.git
   git push railway main
   ```

3. **Opción 3 - Token de Acceso Personal (PAT):**
   - Crear un PAT en GitHub: Settings → Developer settings → Personal access tokens
   - Usar el token como contraseña al hacer push

## 📖 Siguiente Paso

Una vez que hayas hecho push al repositorio, sigue la guía completa:
👉 **[RAILWAY_SETUP.md](./RAILWAY_SETUP.md)** - Configuración detallada paso a paso
