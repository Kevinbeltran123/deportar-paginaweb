#!/bin/bash

# ====================================================
# DeporTur - Start All Services Script
# ====================================================
# This script starts both backend and frontend services
# with automatic port cleanup and environment loading.
#
# Usage: ./scripts/start-all.sh
# ====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ====================================================
# 1. Header
# ====================================================
clear
print_header "🏔️  DeporTur - Starting All Services"

# ====================================================
# 2. Check Environment File
# ====================================================
print_header "🔐 Checking Environment Configuration"

if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    print_info "Creating .env from template..."

    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Created .env from template"
        print_warning "IMPORTANT: Please configure .env with your actual credentials!"
        read -p "Press Enter after configuring .env, or Ctrl+C to cancel..."
    else
        print_error ".env.example not found. Cannot proceed."
        exit 1
    fi
fi

# Load environment variables
set -a
source .env
set +a

print_success "Environment variables loaded"

# ====================================================
# 3. Clean Ports
# ====================================================
print_header "🔌 Cleaning Ports"

clean_port() {
    PORT=$1
    SERVICE=$2

    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $PORT is in use by $SERVICE"
        print_info "Attempting to free port $PORT..."

        # Get PID
        PID=$(lsof -ti:$PORT)

        if [ -n "$PID" ]; then
            print_info "Killing process $PID on port $PORT..."
            kill -9 $PID 2>/dev/null || true
            sleep 1

            # Verify port is free
            if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
                print_error "Failed to free port $PORT"
                return 1
            else
                print_success "Port $PORT is now free"
            fi
        fi
    else
        print_success "Port $PORT is available"
    fi
}

clean_port 8080 "Backend"
clean_port 5173 "Frontend"

# ====================================================
# 4. Check Dependencies
# ====================================================
print_header "📦 Checking Dependencies"

# Check backend dependencies
if [ ! -d "deportur-backend/target" ]; then
    print_warning "Backend not compiled. Compiling now..."
    cd deportur-backend
    mvn clean install -DskipTests
    cd ..
    print_success "Backend compiled"
else
    print_success "Backend dependencies OK"
fi

# Check frontend dependencies
if [ ! -d "deportur-frontend/node_modules" ]; then
    print_warning "Frontend dependencies not installed. Installing now..."
    cd deportur-frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
else
    print_success "Frontend dependencies OK"
fi

# ====================================================
# 5. Create Log Directory
# ====================================================
mkdir -p logs
print_success "Log directory ready"

# ====================================================
# 6. Start Services
# ====================================================
print_header "🚀 Starting Services"

# Trap Ctrl+C to clean up processes
trap 'echo -e "\n${YELLOW}Stopping services...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT TERM

# Start Backend
print_info "Starting backend on port 8080..."
cd deportur-backend
mvn spring-boot:run > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to initialize
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    print_success "Backend started (PID: $BACKEND_PID)"
else
    print_error "Backend failed to start"
    print_info "Check logs/backend.log for details"
    exit 1
fi

# Start Frontend
print_info "Starting frontend on port 5173..."
cd deportur-frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a bit for frontend to initialize
sleep 2

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    print_success "Frontend started (PID: $FRONTEND_PID)"
else
    print_error "Frontend failed to start"
    print_info "Check logs/frontend.log for details"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# ====================================================
# 7. Health Check
# ====================================================
print_header "🏥 Performing Health Checks"

sleep 5  # Give services time to fully start

# Check backend health
print_info "Checking backend health..."
BACKEND_RETRIES=0
BACKEND_MAX_RETRIES=10

while [ $BACKEND_RETRIES -lt $BACKEND_MAX_RETRIES ]; do
    if curl -s -f http://localhost:8080/actuator/health >/dev/null 2>&1 || \
       curl -s -f http://localhost:8080/api >/dev/null 2>&1; then
        print_success "Backend is healthy and responding"
        break
    else
        BACKEND_RETRIES=$((BACKEND_RETRIES + 1))
        if [ $BACKEND_RETRIES -lt $BACKEND_MAX_RETRIES ]; then
            print_info "Waiting for backend to be ready... ($BACKEND_RETRIES/$BACKEND_MAX_RETRIES)"
            sleep 2
        else
            print_warning "Backend may not be fully ready yet"
        fi
    fi
done

# Check frontend health
print_info "Checking frontend health..."
if curl -s -f http://localhost:5173 >/dev/null 2>&1; then
    print_success "Frontend is healthy and responding"
else
    print_warning "Frontend may not be fully ready yet"
fi

# ====================================================
# 8. Success Message
# ====================================================
print_header "✅ DeporTur is Running!"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🎉 All services started successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📍 Access URLs:"
echo "   ${BLUE}Frontend:${NC}  http://localhost:5173"
echo "   ${BLUE}Backend:${NC}   http://localhost:8080"
echo "   ${BLUE}Swagger:${NC}   http://localhost:8080/swagger-ui.html"
echo ""
echo "📝 Process IDs:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "📊 Logs:"
echo "   Backend:  logs/backend.log"
echo "   Frontend: logs/frontend.log"
echo ""
echo "💡 Useful commands:"
echo "   ${YELLOW}tail -f logs/backend.log${NC}   - Watch backend logs"
echo "   ${YELLOW}tail -f logs/frontend.log${NC}  - Watch frontend logs"
echo "   ${YELLOW}./scripts/maintenance/check-health.sh${NC}  - Check system health"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# ====================================================
# 9. Keep Script Running
# ====================================================
# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
