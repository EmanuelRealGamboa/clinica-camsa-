# PLAN DE IMPLEMENTACIÓN - AUDITORÍA CAMSA
**Fecha:** 21 de Marzo 2026
**Objetivo:** Corregir todas las vulnerabilidades críticas, limpiar el proyecto y arreglar el bug de producción
**Entorno:** Railway Hobby (producción)

---

## DISTRIBUCIÓN DE AGENTES

```
┌─────────────────────────────────────────────────────────┐
│                   AGENTE COORDINADOR                     │
│              (tú y yo en esta conversación)              │
└────────┬──────────┬──────────┬──────────┬───────────────┘
         │          │          │          │
    ┌────▼───┐ ┌───▼────┐ ┌──▼───┐ ┌───▼────┐
    │AGENTE 1│ │AGENTE 2│ │AGT 3 │ │AGENTE 4│
    │Segurida│ │Arquitec│ │Bug   │ │Limpieza│
    │Backend │ │Escalab.│ │Prod. │ │Proyecto│
    └────────┘ └────────┘ └──────┘ └────────┘
```

---

## FASE 1 — SEGURIDAD CRÍTICA (45 min)
> **Agentes:** 1 (Seguridad) + 4 (Limpieza) en paralelo

### AGENTE 1 — Seguridad Backend

| # | Tarea | Archivo | Detalle |
|---|-------|---------|---------|
| 1.1 | Eliminar endpoint `/api/auth/init-db/` | `accounts/urls.py` | Comentar/eliminar la línea `path('init-db/', ...)` |
| 1.2 | Convertir init-db en management command | `accounts/management/commands/init_db.py` | Crear comando `python manage.py init_db` para uso local |
| 1.3 | Agregar rate limiting global | `clinic_service/settings.py` | Configurar `DEFAULT_THROTTLE_CLASSES` y `DEFAULT_THROTTLE_RATES` |
| 1.4 | Arreglar Procfile | `Procfile` | Quitar `makemigrations` del comando de arranque |
| 1.5 | Ocultar errores internos en respuestas | `orders/views.py`, `feedbacks/views.py`, `inventory/views.py` | Reemplazar `str(e)` por mensaje genérico + logging |
| 1.6 | Agregar validación de tamaño en uploads | `catalog/serializers.py` | Validar max 5MB y tipos MIME permitidos |
| 1.7 | Configurar logging estructurado | `clinic_service/settings.py` | Reemplazar `print()` por `logging.getLogger()` |

**Test de verificación:**
```bash
# Verificar que init-db ya no responde
curl -X POST http://localhost:8000/api/auth/init-db/  # Debe dar 404

# Verificar rate limiting
for i in {1..110}; do curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/public/categories/; done
# Después de 100: debe dar 429

# Verificar que errores no exponen detalles
curl -X POST http://localhost:8000/api/orders/ -d '{"bad": "data"}'
# No debe contener traceback ni nombres de tablas
```

---

### AGENTE 4 — Limpieza de Proyecto (en paralelo con Agente 1)

| # | Tarea | Detalle |
|---|-------|---------|
| 4.1 | Eliminar app `feedback/` vacía | `rm -rf feedback/` (la app real es `feedbacks/`) |
| 4.2 | Eliminar app `reports/` vacía | `rm -rf reports/` (la app real es `report_analytics/`) |
| 4.3 | Eliminar archivos obsoletos | `AdminDashboardPage.old.tsx`, `settings_backup.py`, `dump.rdb`, `db.sqlite3` |
| 4.4 | Mover scripts sueltos a `documentacion/scripts/` | `add_device_101.py`, `fix_cloudinary_urls.py`, `seed_data.py`, `init_users.py` |
| 4.5 | Eliminar archivos sensibles del repo | `.env`, `.env.production`, `backup_produccion.sql` |
| 4.6 | Agregar al `.gitignore` | `.env`, `.env.production`, `backup_produccion.sql`, `dump.rdb`, `db.sqlite3` |
| 4.7 | Reorganizar carpeta `documentacion/` | Crear subcarpetas: `API/`, `GUIDES/`, `DEPLOYMENT/`, `scripts/`, `assets/` |
| 4.8 | Mover documentación de auditoría | `AUDITORIA.md` y `VULNERABILIDADES_RESUMIDAS.md` → `documentacion/` |
| 4.9 | Limpiar `__pycache__` del repo | `git rm -r --cached **/__pycache__` |
| 4.10 | Eliminar carpetas vacías | `Producto/`, `Productos`, archivo `Logos/` si no se usa en código |

**Test de verificación:**
```bash
# Verificar que no hay archivos sensibles rastreados
git ls-files | grep -E "\.env$|\.env\.production|backup_produccion"
# Debe estar vacío

# Verificar que apps eliminadas no rompen nada
python manage.py check
python manage.py showmigrations
```

---

## FASE 2 — BUG DE PRODUCCIÓN (1 hora)
> **Agente:** 3 (Bug Fix)

### AGENTE 3 — Bug: Encuesta + Finalizar Sesión post-entrega

**Diagnóstico del bug:**
Cuando una orden se marca como DELIVERED:
1. El botón "Habilitar Encuesta" aparece correctamente
2. El botón "Finalizar Atención" también aparece al mismo tiempo
3. Si la enfermera presiona "Habilitar Encuesta" → el kiosk muestra la encuesta → el paciente responde → la sesión se cierra **automáticamente** en el backend (`end_care()`)
4. Pero el panel de enfermera **no se actualiza** → sigue mostrando los botones → si presiona "Finalizar Atención" después → **ERROR: "Assignment already ended"**

**Causa raíz:** Dependencia circular + falta de actualización de estado en el frontend

| # | Tarea | Archivo | Detalle |
|---|-------|---------|---------|
| 3.1 | Mejorar flujo post-DELIVERED en UI | `DashboardPage.tsx` | Mostrar modal de decisión: "¿Habilitar encuesta o finalizar directamente?" |
| 3.2 | Deshabilitar "Finalizar" cuando encuesta está habilitada | `DashboardPage.tsx` | Si `survey_enabled=true`, ocultar botón "Finalizar Atención" |
| 3.3 | Actualizar estado del panel cuando encuesta se completa | `DashboardPage.tsx` | Escuchar WebSocket `survey_completed` para refrescar estado |
| 3.4 | Emitir evento WebSocket cuando encuesta se completa | `feedbacks/views.py` | Después de `end_care()`, enviar mensaje al grupo de staff |
| 3.5 | Agregar estado visual del progreso | `DashboardPage.tsx` | Mostrar indicador: "Esperando encuesta del paciente..." |
| 3.6 | Manejar caso de timeout de encuesta | `DashboardPage.tsx` | Si pasan 10 min sin encuesta, permitir "Finalizar sin encuesta" |

**Flujo corregido:**
```
ORDEN DELIVERED
    ↓
Panel enfermera muestra:
┌──────────────────────────────────┐
│  ¿Qué deseas hacer?             │
│                                  │
│  [📝 Habilitar Encuesta]        │
│  [🚪 Finalizar sin Encuesta]    │
└──────────────────────────────────┘
    ↓                    ↓
Opción A:            Opción B:
Encuesta             Finalizar directo
    ↓                    ↓
Panel muestra:       Sesión termina ✅
"⏳ Esperando
 encuesta..."
    ↓
Paciente completa
    ↓
WebSocket notifica
    ↓
Panel muestra:
"✅ Encuesta recibida.
 Sesión finalizada."
```

**Test de verificación:**
```bash
# Test backend: crear orden → entregar → habilitar encuesta → completar encuesta
python manage.py test orders.tests.TestOrderDeliveryFlow
python manage.py test feedbacks.tests.TestSurveyFlow

# Test frontend: verificar flujo completo en navegador
# 1. Crear orden desde kiosk
# 2. Marcar como DELIVERED desde staff
# 3. Habilitar encuesta
# 4. Completar encuesta desde kiosk
# 5. Verificar que sesión se cierra correctamente
```

---

## FASE 3 — ARQUITECTURA Y ESCALABILIDAD (1.5 horas)
> **Agentes:** 1 + 2 en paralelo

### AGENTE 1 — Continúa seguridad

| # | Tarea | Archivo | Detalle |
|---|-------|---------|---------|
| 1.8 | Cambiar `InMemoryChannelLayer` a Redis | `clinic_service/settings.py` | Usar `channels_redis` con variable de entorno |
| 1.9 | Arreglar race condition en inventario | `orders/views.py` | Mover validación dentro de `transaction.atomic` con `select_for_update` ordenado |

### AGENTE 2 — Arquitectura Backend

| # | Tarea | Archivo | Detalle |
|---|-------|---------|---------|
| 2.1 | Agregar índices de BD en campos de búsqueda | Todos los `models.py` | `db_index=True` en campos filtrados + índices compuestos en Order |
| 2.2 | Optimizar N+1 queries | `feedbacks/views.py`, `inventory/views.py`, `catalog/views.py` | Agregar `select_related`/`prefetch_related` |
| 2.3 | Crear capa de servicios para órdenes | `orders/services.py` (nuevo) | Extraer lógica de negocio de `views.py` a `OrderService` |
| 2.4 | Estandarizar respuestas de error | `common/responses.py` (nuevo) | Crear helper `error_response()` y usarlo en todas las vistas |
| 2.5 | Agregar paginación a endpoints custom | `orders/views.py`, `feedbacks/views.py` | `order_queue`, stats, endpoints sin paginación |

**Test de verificación:**
```bash
# Verificar migraciones por índices nuevos
python manage.py makemigrations --check  # No debe haber pendientes después de crear migración
python manage.py migrate

# Verificar que no hay queries N+1 (con django-debug-toolbar o logging)
python manage.py shell -c "
from django.test.utils import override_settings
from django.db import connection, reset_queries
reset_queries()
# ... ejecutar endpoint ...
print(f'Queries: {len(connection.queries)}')
"

# Verificar race condition arreglada
python manage.py test orders.tests.TestConcurrentOrderCreation
```

---

## FASE 4 — FRONTEND Y TESTS (1.5 horas)
> **Agentes:** 2 + 3 en paralelo

### AGENTE 2 — Mejoras Frontend

| # | Tarea | Archivo | Detalle |
|---|-------|---------|---------|
| 2.6 | Agregar timeout a Axios | `api/client.ts` | `timeout: 30000` en la instancia |
| 2.7 | Implementar lazy loading de rutas | `App.tsx` | Usar `React.lazy()` + `Suspense` para admin y staff |
| 2.8 | Crear logger utility | `utils/logger.ts` (nuevo) | Reemplazar `console.log` en producción |
| 2.9 | Centralizar manejo de errores API | `api/errorHandler.ts` (nuevo) | Helper `handleApiError()` que parsea respuestas del backend |

### AGENTE 3 — Tests de Integración

| # | Tarea | Archivo | Detalle |
|---|-------|---------|---------|
| 3.7 | Tests de seguridad: rate limiting | `accounts/tests.py` | Verificar que se bloquea después de N requests |
| 3.8 | Tests de órdenes: flujo completo | `orders/tests.py` | PLACED → PREPARING → READY → DELIVERED |
| 3.9 | Tests de inventario: concurrencia | `inventory/tests.py` | Simular 2 órdenes simultáneas al mismo producto |
| 3.10 | Tests de feedback: flujo encuesta | `feedbacks/tests.py` | Crear feedback con assignment activo + survey_enabled |
| 3.11 | Tests de clinic: fin de sesión | `clinic/tests.py` | end_care después de feedback |
| 3.12 | Test de permisos: endpoints admin | `accounts/tests.py` | Verificar que staff no accede a endpoints admin |

**Comandos de test:**
```bash
# Correr todos los tests
python manage.py test --verbosity=2

# Tests específicos
python manage.py test orders.tests -v2
python manage.py test feedbacks.tests -v2
python manage.py test clinic.tests -v2
python manage.py test accounts.tests -v2
python manage.py test inventory.tests -v2

# Frontend
cd frontend && npm run build  # Verificar que compila sin errores
cd frontend && npm run lint   # Verificar linting
```

---

## FASE 5 — VALIDACIÓN PRE-DEPLOY (30 min)
> **Agente:** Coordinador (nosotros)

| # | Tarea | Comando | Criterio de éxito |
|---|-------|---------|-------------------|
| 5.1 | Verificar que Django arranca | `python manage.py check --deploy` | 0 errores |
| 5.2 | Verificar migraciones | `python manage.py showmigrations` | Todas aplicadas |
| 5.3 | Correr todos los tests | `python manage.py test` | 0 fallos |
| 5.4 | Build de frontend | `cd frontend && npm run build` | 0 errores |
| 5.5 | Lint de frontend | `cd frontend && npm run lint` | 0 errores bloqueantes |
| 5.6 | Verificar .gitignore | `git status` | Sin archivos sensibles |
| 5.7 | Revisar diff completo | `git diff` | Todo correcto |
| 5.8 | Crear commit de auditoría | `git commit` | Commit limpio |

---

## FASE 6 — DEPLOY A RAILWAY (15 min)
> **Agente:** Coordinador (nosotros)

| # | Paso | Detalle |
|---|------|---------|
| 6.1 | Actualizar variables en Railway | Nuevas variables: rate limiting, Redis URL, logging |
| 6.2 | Push a rama de staging | `git push origin audit-fixes` |
| 6.3 | Verificar deploy en Railway | Monitorear logs de arranque |
| 6.4 | Test de humo en producción | Verificar endpoints críticos |
| 6.5 | Merge a main si todo OK | `git merge audit-fixes` + push |

---

## TIMELINE ESTIMADO

```
HORA        FASE                    AGENTES     ESTADO
─────────────────────────────────────────────────────
00:00       FASE 1 — Seguridad      1 + 4       ⬜ Pendiente
00:45       FASE 2 — Bug Fix        3           ⬜ Pendiente
01:45       FASE 3 — Arquitectura   1 + 2       ⬜ Pendiente
03:15       FASE 4 — Frontend+Tests 2 + 3       ⬜ Pendiente
04:45       FASE 5 — Validación     Coordinador ⬜ Pendiente
05:15       FASE 6 — Deploy         Coordinador ⬜ Pendiente
05:30       ✅ COMPLETADO
```

---

## CHECKLIST FINAL ANTES DE DEPLOY

- [ ] Endpoint `init-db` eliminado
- [ ] Rate limiting configurado
- [ ] Procfile sin `makemigrations`
- [ ] Errores internos ocultos al usuario
- [ ] Logging configurado correctamente
- [ ] `InMemoryChannelLayer` → Redis
- [ ] Race condition de inventario arreglada
- [ ] Bug de encuesta/finalizar sesión arreglado
- [ ] Apps vacías (`feedback/`, `reports/`) eliminadas
- [ ] Archivos sensibles fuera del repo
- [ ] Archivos obsoletos eliminados
- [ ] Índices de BD creados
- [ ] N+1 queries optimizadas
- [ ] Tests pasando (backend + frontend build)
- [ ] `python manage.py check --deploy` sin errores
- [ ] Frontend compila sin errores

---

**¿Listo para empezar? Dime "INICIO" y lanzo las Fases 1 y 4 (Seguridad + Limpieza) en paralelo.**
