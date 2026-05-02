# PasoBet - Guía de Deployment para Producción

## 📋 Requisitos Previos

### 1. Base de Datos
- **Supabase** (recomendado) o PostgreSQL en la nube
- Configurar variables de entorno para conexión

### 2. Variables de Entorno
Crear archivos `.env` en backend y frontend:

#### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"
PORT=3000
NODE_ENV=production
JWT_SECRET="tu_jwt_secret_seguro"
```

#### Frontend (.env.production)
```env
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="tu_anon_key"
VITE_API_URL="https://tu-backend-url.com"
```

### 3. Build de Producción
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## 🚀 Opciones de Deployment

### Opción 1: Vercel + Railway (Recomendado)

#### Backend en Railway
1. Crear cuenta en [Railway.app](https://railway.app)
2. Conectar repositorio GitHub
3. Configurar variables de entorno
4. Railway detectará automáticamente Node.js

#### Frontend en Vercel
1. Crear cuenta en [Vercel.com](https://vercel.com)
2. Conectar repositorio GitHub
3. Configurar variables de entorno de frontend
4. Vercel detectará automáticamente Vite

### Opción 2: Render (Todo en uno)

#### Configuración
1. Crear cuenta en [Render.com](https://render.com)
2. Conectar repositorio GitHub

#### Archivo render.yaml
```yaml
services:
  - type: web
    name: pasobet-backend
    env: node
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: DATABASE_URL
        value: postgresql://...
      - key: NODE_ENV
        value: production

  - type: web
    name: pasobet-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/dist
    envVars:
      - key: VITE_SUPABASE_URL
        value: https://...
      - key: VITE_API_URL
        value: https://pasobet-backend.onrender.com
```

### Opción 3: Docker + VPS

#### Dockerfile (raíz del proyecto)
```dockerfile
# Multi-stage build
FROM node:18-alpine AS base

# Backend stage
FROM base AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
RUN npm run build

# Frontend stage
FROM base AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Install serve for frontend
RUN npm install -g serve

# Copy backend
COPY --from=backend /app/backend/dist ./backend/dist
COPY --from=backend /app/backend/node_modules ./backend/node_modules
COPY --from=backend /app/backend/package.json ./backend/

# Copy frontend
COPY --from=frontend /app/frontend/dist ./frontend/dist

# Expose ports
EXPOSE 3000 5000

# Start both services
CMD ["sh", "-c", "cd backend && npm start & serve -s frontend/dist -l 5000"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  pasobet:
    build: .
    ports:
      - "3000:3000"  # Backend
      - "5000:5000"  # Frontend
    environment:
      - DATABASE_URL=postgresql://...
      - NODE_ENV=production
    restart: unless-stopped
```

## 🔧 Configuraciones Adicionales

### 1. CORS Configuration
Asegurarse de que el backend permita el dominio del frontend:

```javascript
// backend/src/index.ts
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://tu-dominio.com', 'https://www.tu-dominio.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

### 2. Socket.IO para Producción
```javascript
// backend/src/index.ts
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://tu-dominio.com']
      : ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});
```

### 3. Variables de Entorno Seguras
- Nunca commitear `.env` files
- Usar servicios como Vercel Secrets o Railway Variables
- Para JWT_SECRET usar una cadena aleatoria segura

## 📊 Monitoreo y Mantenimiento

### 1. Logs
- Railway/Vercel proporcionan logs en tiempo real
- Configurar Winston para logging estructurado

### 2. Base de Datos
- Configurar backups automáticos en Supabase
- Monitorear uso de recursos

### 3. SSL
- Automático en Vercel/Railway/Render
- Certificado gratuito con Let's Encrypt para VPS

## 🚨 Checklist Pre-Deployment

- [ ] Variables de entorno configuradas
- [ ] Base de datos en producción creada
- [ ] Schema de Prisma migrado
- [ ] Seeds ejecutados (si aplica)
- [ ] Build local funcionando
- [ ] CORS configurado correctamente
- [ ] Dominio comprado (opcional)
- [ ] SSL configurado

## 💰 Costos Estimados

- **Railway**: $5/mes (backend)
- **Vercel**: Gratis (frontend)
- **Supabase**: $25/mes (base de datos)
- **Dominio**: $10-15/año

¡Tu aplicación estará lista para usuarios públicos!