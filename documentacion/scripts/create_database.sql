-- Script para crear la base de datos en PostgreSQL
-- Ejecutar desde pgAdmin o línea de comandos de PostgreSQL

-- Crear la base de datos
CREATE DATABASE clinic_service_db
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Mexico.1252'
    LC_CTYPE = 'Spanish_Mexico.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Comentario sobre la base de datos
COMMENT ON DATABASE clinic_service_db
    IS 'Base de datos para el sistema de Room Service + Inventario + Satisfacción de clínica';

-- Conectar a la base de datos (solo necesario si ejecutas desde psql)
\c clinic_service_db

-- Otorgar permisos al usuario postgres
GRANT ALL PRIVILEGES ON DATABASE clinic_service_db TO postgres;
