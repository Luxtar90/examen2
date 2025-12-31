# Guía para ejecutar el Frontend y Backend

Este proyecto tiene dos carpetas:
- `backexam`: API Node.js con Prisma y SQLite
- `frontexam`: Aplicación Svelte con Vite

## Requisitos
- Node.js 18 o superior (recomendado 20+)
- npm

## Backend (`backexam`)
1. Abrir una terminal en `backexam`
2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Inicializar la base de datos (SQLite local):

   ```bash
   npm run db:push
   ```

   Esto crea el archivo `prisma/dev.db` y sincroniza el esquema.

4. Variables de entorno (opcional):
   - `AUTH_SECRET`: clave para firmar tokens (por defecto `dev-secret`)
   - `ADMIN_INVITE_SECRET`: clave para crear admins (por defecto `dev-admin-secret`)

5. Iniciar el servidor:

   ```bash
   npm run dev
   ```

   - URL base: `http://localhost:3000`
   - Documentación Swagger: `http://localhost:3000/api/docs`

### Usuarios y acceso
- Admin predefinido para pruebas:
  - Email: `admin@example.com`
  - Password: `admin123`
- Crear cliente o admin vía frontend (ver sección Frontend).
- Crear administrador vía API requiere `ADMIN_INVITE_SECRET` (`dev-admin-secret` por defecto).

## Frontend (`frontexam`)
1. Abrir otra terminal en `frontexam`
2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   - URL: `http://localhost:5173`

4. Configuración de API:
   - En desarrollo usa por defecto `http://localhost:3000/api`
   - Puede sobrescribirse con `VITE_API_BASE_URL`

## Flujo de prueba sugerido
1. Backend corriendo en `http://localhost:3000`
2. Frontend corriendo en `http://localhost:5173`
3. Entrar como:
   - Admin: `admin@example.com` / `admin123`
     - Crear artículos y ver pedidos
   - Cliente: marcar “Crear cuenta nueva” y registrarse
     - Hacer pedidos, ver stock actualizado y “Mis pedidos”

## Endpoints principales
- `GET /api/items` — listar artículos
- `POST /api/items` — crear artículo (requiere admin)
- `POST /api/orders` — crear pedido (requiere cliente)
- `GET /api/orders` — listar pedidos (admin)
- `GET /api/vendor/orders` — listar pedidos (admin)
- `GET /api/my/orders` — listar tus pedidos (autenticado)
- `POST /api/auth/register` — registrar cliente o admin
- `POST /api/auth/login` — iniciar sesión
- `POST /api/admin/promote` — cambiar rol (admin)
- `GET /api/docs` — Swagger UI

## Problemas comunes
- Puerto ocupado 3000/5173: cerrar procesos previos y reintentar.
- Reset de base de datos: borrar `backexam/prisma/dev.db` y ejecutar `npm run db:push`.
- Errores de autenticación: verificar que el backend esté arriba y que el token esté presente.

## Producción (opcional)
- Backend: `npm run deploy` (Vercel), configurando variables de entorno.
- Frontend: `npm run build` y servir `dist/` o desplegar en proveedor estático.
