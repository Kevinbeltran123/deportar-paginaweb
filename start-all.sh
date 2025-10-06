#!/bin/bash

echo "🚀 Iniciando DeporTur..."

# Cargar variables de entorno desde .env
set -a
source .env
set +a

# Función para matar procesos en puertos específicos
cleanup_ports() {
    echo "🧹 Limpiando puertos 8080 y 5173..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    lsof -ti:5173 | xargs kill -9 2>/dev/null
}

# Limpiar puertos antes de iniciar
cleanup_ports

echo ""
echo "📦 Iniciando Backend (Spring Boot)..."
cd deportur-backend && mvn spring-boot:run &
BACKEND_PID=$!

echo ""
echo "⚛️  Iniciando Frontend (Vite)..."
cd ../deportur-frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servicios iniciados:"
echo "   - Backend: http://localhost:8080 (PID: $BACKEND_PID)"
echo "   - Frontend: http://localhost:5173 (PID: $FRONTEND_PID)"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios..."

# Esperar a que se presione Ctrl+C
trap "echo ''; echo '🛑 Deteniendo servicios...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Mantener el script corriendo
wait
