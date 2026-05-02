#!/bin/bash

# PasoBet - Script de Deployment Automático
# Uso: ./deploy.sh [plataforma]

set -e

PLATAFORMA=${1:-"vercel"}

echo "🚀 Iniciando deployment de PasoBet..."
echo "📍 Plataforma: $PLATAFORMA"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Ejecutar desde la raíz del proyecto PasoBet"
    exit 1
fi

# Verificar variables de entorno
echo "🔍 Verificando configuración..."

if [ "$PLATAFORMA" = "vercel" ]; then
    # Deployment con Vercel
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel

    echo "🔧 Configurando backend..."
    cd backend
    npm install
    npm run build
    cd ..

    echo "🎨 Configurando frontend..."
    cd frontend
    npm install
    npm run build
    cd ..

    echo "🚀 Desplegando en Vercel..."
    vercel --prod

elif [ "$PLATAFORMA" = "render" ]; then
    echo "📝 Para Render, conecta tu repositorio GitHub a https://render.com"
    echo "📋 Usa el archivo render.yaml incluido en el proyecto"
    echo "🔗 URL: https://render.com"

elif [ "$PLATAFORMA" = "docker" ]; then
    echo "🐳 Construyendo imagen Docker..."
    docker build -t pasobet .

    echo "🚀 Ejecutando contenedor..."
    docker run -d \
        --name pasobet \
        -p 3000:3000 \
        -p 5000:5000 \
        --env-file .env \
        pasobet

    echo "✅ PasoBet ejecutándose en:"
    echo "   🔗 Backend: http://localhost:3000"
    echo "   🎨 Frontend: http://localhost:5000"

else
    echo "❌ Plataforma no soportada: $PLATAFORMA"
    echo "📋 Plataformas disponibles: vercel, render, docker"
    exit 1
fi

echo ""
echo "🎉 ¡Deployment completado!"
echo "📋 Próximos pasos:"
echo "   1. Configurar variables de entorno en la plataforma"
echo "   2. Ejecutar migraciones de base de datos"
echo "   3. Verificar que la aplicación funciona"
echo "   4. Configurar dominio personalizado (opcional)"