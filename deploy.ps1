# PasoBet - Script de Deployment para Windows
# Uso: .\deploy.ps1 [plataforma]

param(
    [string]$Plataforma = "vercel"
)

Write-Host "🚀 Iniciando deployment de PasoBet..." -ForegroundColor Green
Write-Host "📍 Plataforma: $Plataforma" -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (!(Test-Path "package.json") -or !(Test-Path "backend") -or !(Test-Path "frontend")) {
    Write-Host "❌ Error: Ejecutar desde la raíz del proyecto PasoBet" -ForegroundColor Red
    exit 1
}

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Descárgalo desde https://nodejs.org" -ForegroundColor Red
    exit 1
}

switch ($Plataforma) {
    "vercel" {
        Write-Host "🔧 Configurando para Vercel..." -ForegroundColor Yellow

        # Instalar Vercel CLI si no está instalado
        try {
            vercel --version | Out-Null
            Write-Host "✅ Vercel CLI detectado" -ForegroundColor Green
        } catch {
            Write-Host "📦 Instalando Vercel CLI..." -ForegroundColor Yellow
            npm install -g vercel
        }

        # Build del backend
        Write-Host "🔧 Construyendo backend..." -ForegroundColor Yellow
        Set-Location backend
        npm install
        npm run build
        Set-Location ..

        # Build del frontend
        Write-Host "🎨 Construyendo frontend..." -ForegroundColor Yellow
        Set-Location frontend
        npm install
        npm run build
        Set-Location ..

        # Deploy
        Write-Host "🚀 Desplegando en Vercel..." -ForegroundColor Green
        vercel --prod
    }

    "render" {
        Write-Host "📝 Para Render:" -ForegroundColor Cyan
        Write-Host "   1. Ve a https://render.com" -ForegroundColor White
        Write-Host "   2. Conecta tu repositorio GitHub" -ForegroundColor White
        Write-Host "   3. Usa el archivo render.yaml incluido" -ForegroundColor White
        Write-Host "   4. Configura las variables de entorno" -ForegroundColor White
    }

    "docker" {
        Write-Host "🐳 Construyendo imagen Docker..." -ForegroundColor Yellow
        docker build -t pasobet .

        Write-Host "🚀 Ejecutando contenedor..." -ForegroundColor Green
        docker run -d `
            --name pasobet `
            -p 3000:3000 `
            -p 5000:5000 `
            --env-file .env `
            pasobet

        Write-Host "✅ PasoBet ejecutándose en:" -ForegroundColor Green
        Write-Host "   🔗 Backend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "   🎨 Frontend: http://localhost:5000" -ForegroundColor Cyan
    }

    default {
        Write-Host "❌ Plataforma no soportada: $Plataforma" -ForegroundColor Red
        Write-Host "📋 Plataformas disponibles: vercel, render, docker" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "" -ForegroundColor White
Write-Host "🎉 ¡Deployment completado!" -ForegroundColor Green
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Configurar variables de entorno en la plataforma" -ForegroundColor White
Write-Host "   2. Ejecutar migraciones de base de datos: npx prisma db push" -ForegroundColor White
Write-Host "   3. Verificar que la aplicación funciona" -ForegroundColor White
Write-Host "   4. Configurar dominio personalizado (opcional)" -ForegroundColor White