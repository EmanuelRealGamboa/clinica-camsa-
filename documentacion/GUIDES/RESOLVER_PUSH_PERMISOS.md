# 🔐 Resolver Problema de Permisos al Hacer Push

Si obtuviste el error:
```
remote: Permission to Quint4n4/MenuInteractivo.git denied to EmanuelRealGamboa.
fatal: unable to access 'https://github.com/Quint4n4/MenuInteractivo.git/': The requested URL returned error: 403
```

Esto significa que necesitas autenticarte con las credenciales de la cuenta de la empresa (`Quint4n4`).

## Soluciones

### Opción 1: Usar GitHub CLI (Recomendado)

1. Instala GitHub CLI si no lo tienes:
   ```powershell
   winget install GitHub.cli
   ```

2. Autentícate:
   ```powershell
   gh auth login
   ```
   - Selecciona GitHub.com
   - Selecciona HTTPS
   - Selecciona "Login with a web browser"
   - Sigue las instrucciones en el navegador
   - **IMPORTANTE**: Asegúrate de iniciar sesión con la cuenta de la empresa (`Quint4n4`)

3. Configura las credenciales para el repositorio:
   ```powershell
   gh auth setup-git
   ```

4. Intenta hacer push de nuevo:
   ```powershell
   git push railway main
   ```

### Opción 2: Usar SSH en lugar de HTTPS

1. Cambia la URL del remote a SSH:
   ```powershell
   git remote set-url railway git@github.com:Quint4n4/MenuInteractivo.git
   ```

2. Asegúrate de tener una clave SSH configurada en tu cuenta de GitHub de la empresa:
   - Ve a: https://github.com/settings/keys
   - Agrega tu clave SSH pública si no la tienes

3. Intenta hacer push:
   ```powershell
   git push railway main
   ```

### Opción 3: Usar Token de Acceso Personal (PAT)

1. Crea un Token de Acceso Personal:
   - Ve a: https://github.com/settings/tokens
   - Haz clic en "Generate new token" → "Generate new token (classic)"
   - Dale un nombre: "Railway Deployment"
   - Selecciona los scopes: `repo` (acceso completo a repositorios)
   - Genera el token y **cópialo** (solo se muestra una vez)

2. Configura Git para usar el token:
   ```powershell
   git remote set-url railway https://<TU_TOKEN>@github.com/Quint4n4/MenuInteractivo.git
   ```
   
   O mejor, usa el credential helper:
   ```powershell
   git config --global credential.helper wincred
   ```
   
   Luego cuando hagas push, usa:
   - Username: `Quint4n4` (o el nombre de usuario de la empresa)
   - Password: `<TU_TOKEN>` (el token que generaste)

3. Intenta hacer push:
   ```powershell
   git push railway main
   ```

### Opción 4: Configurar Credenciales en Windows Credential Manager

1. Abre "Administrador de credenciales de Windows":
   - Presiona `Win + R`
   - Escribe: `control /name Microsoft.CredentialManager`
   - O busca "Credenciales de Windows" en el menú inicio

2. Agrega una credencial genérica:
   - Haz clic en "Credenciales de Windows"
   - Haz clic en "Agregar una credencial genérica"
   - Dirección de Internet: `git:https://github.com`
   - Nombre de usuario: `Quint4n4` (o el usuario de la empresa)
   - Contraseña: Tu token de acceso personal o contraseña

3. Intenta hacer push:
   ```powershell
   git push railway main
   ```

## Verificar Configuración

Después de configurar, verifica:

```powershell
# Ver los remotes configurados
git remote -v

# Deberías ver:
# railway  https://github.com/Quint4n4/MenuInteractivo.git (fetch)
# railway  https://github.com/Quint4n4/MenuInteractivo.git (push)
```

## Nota Importante

Si el repositorio pertenece a una organización (`Quint4n4`), asegúrate de:

1. Tener acceso al repositorio como colaborador
2. Estar autenticado con la cuenta correcta
3. Tener permisos de escritura en el repositorio

Si no tienes acceso, contacta al administrador del repositorio para que te agregue como colaborador.

## Siguiente Paso

Una vez que puedas hacer push exitosamente, sigue la guía:
👉 **[RAILWAY_SETUP.md](./RAILWAY_SETUP.md)** - Configuración completa en Railway
