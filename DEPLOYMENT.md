## Despliegue CAMSA – Versión Kiosk UI + Íconos

### 1. Objetivo

- **Actualizar producción en Railway** a la versión nueva del sistema que incluye:
  - Rediseño de kiosk (UI/UX y mobile).
  - Nuevo flujo de íconos de categorías basados en imágenes (`icon_image`).
  - Ajustes en admin y notificaciones.

Este documento describe **qué cambió** y **paso a paso qué hacer** para desplegarlo, incluyendo migraciones de Django.

---

### 2. Cambios backend relevantes

- **Modelo `ProductCategory` (`catalog/models.py`)**
  - Campo nuevo:
    - `icon_image = models.ImageField(upload_to='category-icons/', blank=True, null=True, ...)`.
  - El campo `icon` (emoji) sigue existiendo pero queda **deprecado**; se prefiere `icon_image`.

- **Serializers (`catalog/serializers.py`)**
  - `ProductCategorySerializer` y `PublicProductCategorySerializer`:
    - Añaden:
      - `icon_image` (ImageField).
      - `icon_image_url` (SerializerMethodField) que:
        - Usa `obj.icon_image.url`.
        - Si hay `request` en el contexto, devuelve una URL **absoluta** (`request.build_absolute_uri`).

- **Vistas (`catalog/views.py`)**
  - `ProductCategoryViewSet`:
    - `parser_classes = [MultiPartParser, FormParser, JSONParser]` para aceptar `multipart/form-data` en el admin (subida de íconos).
  - `get_carousel_categories(request)`:
    - Usa `PublicProductCategorySerializer(categories, many=True, context={'request': request})`.
    - Así, en el kiosk se reciben URLs absolutas de `icon_image_url`.

- **Admin (`catalog/admin.py`)**
  - `ProductCategoryAdmin`:
    - Formulario incluye `icon_image`.
    - Lista muestra `icon_image_preview` (miniatura del ícono).
    - Se mantiene `icon` pero con texto de ayuda que recomienda `icon_image`.

- **Migraciones**
  - Se generó al menos una migración en `catalog/migrations/` que:
    - Agrega el campo `icon_image` a `ProductCategory`.
  - Durante `makemigrations` se aceptó poner **default 0** para un campo de rating (ej. `staff_rating`), creando otra migración.  
  - **Estas migraciones deben estar versionadas en git** y nunca crearse directamente en producción.

---

### 3. Cambios frontend relevantes

- **Admin – Gestión de categorías (`frontend/src/pages/admin/ProductsManagementPage.tsx`)**
  - El formulario de categoría ahora:
    - Permite subir archivo de ícono (`icon_image_file`) y ver un preview.
    - Permite limpiar el ícono.
    - Envía los datos como `FormData` al crear/editar.
  - Tablas:
    - Muestran `icon_image_url` como `<img>` con fallback al emoji.

- **API admin (`frontend/src/api/admin.ts`)**
  - `createCategory` y `updateCategory`:
    - Si reciben un `FormData`, envían `Content-Type: multipart/form-data`.

- **Kiosk – Navegación y carruseles**
  - `CategoryQuickNav.tsx` y `CategoryCarousel.tsx`:
    - Usan `category.icon_image_url` (PNG/JPG) con fallback a `category.icon` (emoji).
  - `KioskHomePage.tsx`:
    - Los carruseles de categorías ahora cargan **todos** los productos de cada categoría.
    - Header móvil rediseñado, con menú y botón de carrito separados.
  - `KioskCategoryPage.tsx`:
    - Botón de *volver* siempre visible (sticky), más pequeño en móvil.
    - Menú móvil propio sin opción redundante de “Volver”.
  - `MobileHeaderMenu.tsx`:
    - Panel centrado y con:
      - `width: calc(100vw - 24px)` y `maxWidth`.
      - `maxHeight: calc(100vh - 120px)` y `overflow-y: auto`.
    - Así, nunca se sale fuera de la pantalla en móvil.
  - `AddToCartNotification.tsx`:
    - Toast de “¡Agregado al carrito!”:
      - Visible ~1.3s.
      - En móvil aparece centrado en la parte baja, sin tapar el contenido principal.

- **Kiosk – Íconos personalizados**
  - `InitialWelcomeScreen`, `KioskHomePage`, `KioskOrdersPage`:
    - Usan los PNG de `frontend/src/assets/icons/` (`te.png`, `store.png`, `comida.png`, etc.) en lugar de íconos de librería.

---

### 4. Migraciones: flujo recomendado

#### 4.1. En desarrollo/local (antes de subir código)

1. **Generar migraciones** cuando se cambian modelos:
   ```bash
   python manage.py makemigrations catalog
   ```
   - Si Django pide un default (ej. para un rating), elegir el valor adecuado (se usó `0`).

2. **Aplicar migraciones localmente** para validar:
   ```bash
   python manage.py migrate
   ```

3. **Probar la aplicación**:
   - Admin:
     - Crear/editar categoría.
     - Subir un `icon_image`.
   - Kiosk:
     - Ver íconos en navegación, carruseles y páginas de categoría.
     - Revisar comportamiento en móvil (menú, toast de carrito, botón de volver).

4. **Confirmar que las migraciones están versionadas**:
   ```bash
   git status
   ```
   - Verificar que los archivos nuevos en `catalog/migrations/` están añadidos al commit.

#### 4.2. En producción (Railway)

> **Importante:** en producción solo se debe ejecutar `migrate`. **No** usar `makemigrations` allí.

1. **Desplegar el código** (ver sección 5).
2. Una vez que el contenedor esté activo, en la consola de Railway:
   ```bash
   python manage.py migrate
   ```
3. Verificar que se aplican las migraciones de `catalog` y de rating sin errores.
4. Si se usa `collectstatic` en el proceso de deploy:
   ```bash
   python manage.py collectstatic --noinput
   ```

---

### 5. Pasos para desplegar en Railway (hobby)

#### 5.1. Preparar código y subirlo al remoto

1. Asegúrate de que el árbol esté limpio y probado localmente:
   ```bash
   git status
   ```

2. Añadir cambios y migraciones:
   ```bash
   git add .
   git commit -m "Kiosk UI, admin icons & mobile fixes"
   ```

3. Enviar a la rama que Railway usa para deploy (por ejemplo `main`):
   ```bash
   git push origin main
   ```

#### 5.2. Supervisar el deploy en Railway

1. En el panel de Railway, abrir el servicio de Django.
2. Revisar:
   - Logs de build (instalación de dependencias, etc.).
   - Que el comando de arranque no falle.

#### 5.3. Ejecutar migraciones en Railway

1. Abrir la consola del servicio en Railway.
2. Ejecutar:
   ```bash
   python manage.py migrate
   ```
3. Esperar a que termine y confirmar que no hay errores.
4. Reiniciar el servicio si es necesario (a veces Railway lo hace solo).

---

### 6. Media / archivos estáticos

- Los íconos de categorías se almacenan en `MEDIA_ROOT` bajo `category-icons/`.
- Asegurarse en producción de que:
  - `MEDIA_URL` y `MEDIA_ROOT` están correctamente configurados.
  - El servidor (Django/nginx/otro) sirve los archivos de media.
- La lógica de `icon_image_url` genera URLs absolutas (ej. `https://tu-dominio/media/category-icons/...`), lo cual es compatible con el kiosk y el admin.

Si se rehacen las categorías en producción, se pueden volver a subir íconos desde el admin sin tocar código.

---

### 7. Checklist rápido antes de ir a producción

- **Local**
  - [ ] `python manage.py migrate` corre sin errores.
  - [ ] Kiosk muestra correctamente los íconos nuevos y la UI móvil.
  - [ ] Admin permite subir y previsualizar `icon_image`.
  - [ ] Test rápido de flujo de pedido y notificaciones.

- **Repo remoto**
  - [ ] Migraciones de `catalog` y de rating están incluidas en git.
  - [ ] `git push` se hizo a la rama usada por Railway.

- **Railway**
  - [ ] Build OK (sin errores en logs).
  - [ ] `python manage.py migrate` ejecutado con éxito.
  - [ ] (Si aplica) `python manage.py collectstatic --noinput` ejecutado.
  - [ ] Kiosk y admin en producción probados visualmente (incluyendo vista móvil vía DevTools).

