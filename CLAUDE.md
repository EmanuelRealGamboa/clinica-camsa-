# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CAMSA is a clinic order management system with a Django REST API backend and a React SPA frontend. It supports three user roles: **Kiosk** (patients ordering), **Staff** (order management), and **Admin** (full system management).

## Commands

### Backend (Django)

```bash
# Setup
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser

# Development
python manage.py runserver

# Tests
python manage.py test                     # All tests
python manage.py test <app_name>          # Single app
coverage run --source='.' manage.py test  # With coverage
```

### Frontend (React + Vite)

```bash
cd frontend

npm install
npm run dev       # Dev server (http://localhost:5173)
npm run build     # TypeScript compile + Vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Environment Setup

Copy `.env.example` to `.env` and fill in:
- `SECRET_KEY`, `DEBUG`, database credentials
- `CORS_ALLOWED_ORIGINS` (e.g., `http://localhost:5173`)
- Cloudinary keys (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
- `CHANNEL_LAYERS_HOST`/`PORT` (Redis, for WebSockets)

Frontend: copy `frontend/.env.example` to `frontend/.env` with `VITE_API_BASE_URL=http://localhost:8000`.

## Architecture

### Backend — Django Apps

| App | Responsibility |
|-----|---------------|
| `accounts/` | Custom email-based user model, JWT auth, role-based permissions |
| `clinic/` | Rooms, devices (iPad/kiosk), patient assignments |
| `catalog/` | Products, categories (with icon images), tags |
| `inventory/` | Stock quantities, reorder levels; auto-updated via signals on order changes |
| `orders/` | Order lifecycle (PLACED → PREPARING → READY → DELIVERED), WebSocket consumer |
| `feedbacks/` | Post-order ratings and comments from kiosk |
| `report_analytics/` | Sales metrics and business analytics |
| `common/` | Shared base models and utilities |

**URL prefixes:** `/api/auth/`, `/api/clinic/`, `/api/catalog/`, `/api/inventory/`, `/api/orders/`, `/api/feedbacks/`, `/api/report_analytics/`, `/api/public/` (unauthenticated kiosk endpoints).

**Real-time:** Django Channels + Redis. WebSocket consumers live in `orders/consumers.py`. The ASGI server is Daphne (`clinic_service/asgi.py`).

**Media:** Cloudinary in production (`django-cloudinary-storage`), local `/media/` in development. Static files served via WhiteNoise.

**Auth flow:** JWT (Simple JWT). Frontend stores `access_token`/`refresh_token` in localStorage. Axios interceptor (`frontend/src/api/client.ts`) attaches Bearer tokens and handles refresh.

### Frontend — React SPA

```
frontend/src/
├── App.tsx               # Root router
├── api/                  # Axios clients (admin, auth, kiosk, orders, products)
├── auth/                 # AuthContext, ProtectedRoute, AdminProtectedRoute
├── contexts/             # SurveyContext
├── hooks/                # useKioskState, useStoreCart, useWebSocket, useServiceBooking
├── pages/
│   ├── kiosk/            # Patient ordering UI (/kiosk/:deviceId)
│   ├── staff/            # Staff dashboard & order management (/staff)
│   └── admin/            # Admin management pages (/admin)
├── components/           # kiosk/, staff/, admin/, services/ sub-folders
├── types/                # TypeScript interfaces
├── styles/               # Global styles, color constants
├── constants/            # API URL constants
└── utils/                # Responsive helpers, image utilities
```

**Routing:**
- `/kiosk/:deviceId` — Patient ordering (public)
- `/staff/login` + `/staff/dashboard` — Staff (authenticated)
- `/admin/login` + `/admin/*` — Admin (authenticated + role check)

**State management:** React Context for auth; custom hooks for feature state (cart, kiosk flow, WebSocket); no Redux.

**Key libraries:** React Router DOM 7, Axios, Framer Motion (animations), Recharts (analytics charts), Lucide React (icons).
