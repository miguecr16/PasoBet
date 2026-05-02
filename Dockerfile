# Multi-stage build for PasoBet
FROM node:18-alpine AS base

# Install dependencies for both frontend and backend
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install all dependencies
RUN npm ci

# Build backend
FROM deps AS backend-build
WORKDIR /app/backend
COPY backend/ .
RUN npm run build

# Build frontend
FROM deps AS frontend-build
WORKDIR /app/frontend
COPY frontend/ .
RUN npm run build

# Production image
FROM base AS production
WORKDIR /app

# Install serve for static files
RUN npm install -g serve

# Copy built backend
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/package.json ./backend/
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Expose ports
EXPOSE 3000 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start both services
CMD ["sh", "-c", "cd backend && npm start & serve -s frontend/dist -l 5000"]