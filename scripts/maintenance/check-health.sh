#!/bin/bash

# ====================================================
# DeporTur - System Health Check Script
# ====================================================
# This script checks the health of all DeporTur services
# including backend API, frontend, and database connectivity.
#
# Usage: ./scripts/maintenance/check-health.sh
# ====================================================

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

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ====================================================
# 1. Header
# ====================================================
clear
print_header "🏥 DeporTur - System Health Check"

OVERALL_STATUS=0

# ====================================================
# 2. Environment Check
# ====================================================
print_header "🔐 Environment Configuration"

if [ -f ".env" ]; then
    print_success ".env file exists"

    # Load .env
    set -a
    source .env 2>/dev/null
    set +a

    # Check critical variables
    MISSING_VARS=0

    if [ -z "$SUPABASE_DB_HOST" ] || [ "$SUPABASE_DB_HOST" = "your-project.pooler.supabase.com" ]; then
        print_warning "SUPABASE_DB_HOST not configured"
        MISSING_VARS=$((MISSING_VARS + 1))
    else
        print_success "SUPABASE_DB_HOST configured"
    fi

    if [ -z "$AUTH0_DOMAIN" ] || [ "$AUTH0_DOMAIN" = "your-tenant.us.auth0.com" ]; then
        print_warning "AUTH0_DOMAIN not configured"
        MISSING_VARS=$((MISSING_VARS + 1))
    else
        print_success "AUTH0_DOMAIN configured"
    fi

    if [ -z "$VITE_API_URL" ]; then
        print_warning "VITE_API_URL not configured"
        MISSING_VARS=$((MISSING_VARS + 1))
    else
        print_success "VITE_API_URL configured"
    fi

    if [ $MISSING_VARS -gt 0 ]; then
        print_warning "$MISSING_VARS environment variable(s) need configuration"
        OVERALL_STATUS=1
    fi
else
    print_error ".env file not found"
    print_info "Run: cp .env.example .env"
    OVERALL_STATUS=1
fi

# ====================================================
# 3. Port Availability Check
# ====================================================
print_header "🔌 Port Status"

# Check Backend Port (8080)
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_success "Backend is running on port 8080"
    BACKEND_RUNNING=true
else
    print_warning "Backend is not running on port 8080"
    BACKEND_RUNNING=false
fi

# Check Frontend Port (5173)
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_success "Frontend is running on port 5173"
    FRONTEND_RUNNING=true
else
    print_warning "Frontend is not running on port 5173"
    FRONTEND_RUNNING=false
fi

# ====================================================
# 4. Backend Health Check
# ====================================================
print_header "☕ Backend API Health"

if [ "$BACKEND_RUNNING" = true ]; then
    # Check if curl exists
    if command_exists curl; then
        # Try to access actuator health endpoint
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null || echo "000")

        if [ "$HTTP_CODE" = "200" ]; then
            print_success "Backend health endpoint responding (200 OK)"
        else
            # Try base API endpoint
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api 2>/dev/null || echo "000")

            if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
                print_success "Backend API responding (HTTP $HTTP_CODE)"
            else
                print_warning "Backend API not responding properly (HTTP $HTTP_CODE)"
                OVERALL_STATUS=1
            fi
        fi

        # Check Swagger
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/swagger-ui.html 2>/dev/null || echo "000")
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
            print_success "Swagger UI accessible"
        else
            print_warning "Swagger UI not accessible"
        fi
    else
        print_warning "curl not found - cannot check backend health"
    fi
else
    print_warning "Backend is not running - start it with ./scripts/start-all.sh"
    OVERALL_STATUS=1
fi

# ====================================================
# 5. Frontend Health Check
# ====================================================
print_header "⚛️  Frontend Health"

if [ "$FRONTEND_RUNNING" = true ]; then
    if command_exists curl; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null || echo "000")

        if [ "$HTTP_CODE" = "200" ]; then
            print_success "Frontend responding (200 OK)"
        else
            print_warning "Frontend not responding properly (HTTP $HTTP_CODE)"
            OVERALL_STATUS=1
        fi
    else
        print_warning "curl not found - cannot check frontend health"
    fi
else
    print_warning "Frontend is not running - start it with ./scripts/start-all.sh"
    OVERALL_STATUS=1
fi

# ====================================================
# 6. Database Connectivity
# ====================================================
print_header "🗄️  Database Connectivity"

if [ -n "$SUPABASE_DB_HOST" ] && [ "$SUPABASE_DB_HOST" != "your-project.pooler.supabase.com" ]; then
    if command_exists psql; then
        if timeout 5 psql "postgresql://$SUPABASE_DB_USER:$SUPABASE_DB_PASSWORD@$SUPABASE_DB_HOST:$SUPABASE_DB_PORT/$SUPABASE_DB_NAME?sslmode=require" -c "SELECT 1;" >/dev/null 2>&1; then
            print_success "Database connection successful"
        else
            print_error "Cannot connect to database"
            print_info "Check your database credentials in .env"
            OVERALL_STATUS=1
        fi
    else
        print_warning "psql not installed - cannot check database connectivity"
        print_info "Install PostgreSQL client to enable database checks"
    fi
else
    print_warning "Database credentials not configured"
    OVERALL_STATUS=1
fi

# ====================================================
# 7. Dependencies Check
# ====================================================
print_header "📦 Dependencies Status"

# Backend dependencies
if [ -d "deportur-backend/target" ]; then
    print_success "Backend compiled (target/ exists)"
else
    print_warning "Backend not compiled - run: cd deportur-backend && mvn install"
    OVERALL_STATUS=1
fi

# Frontend dependencies
if [ -d "deportur-frontend/node_modules" ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Frontend dependencies not installed - run: cd deportur-frontend && npm install"
    OVERALL_STATUS=1
fi

# ====================================================
# 8. File System Check
# ====================================================
print_header "📁 File System Status"

MISSING_FILES=0

# Check critical files
check_file() {
    if [ -f "$1" ]; then
        print_success "$1 exists"
    else
        print_error "$1 missing"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
}

check_file "deportur-backend/pom.xml"
check_file "deportur-backend/src/main/resources/application.properties"
check_file "deportur-frontend/package.json"
check_file "deportur-frontend/vite.config.js"

if [ $MISSING_FILES -gt 0 ]; then
    print_error "$MISSING_FILES critical file(s) missing"
    OVERALL_STATUS=1
fi

# ====================================================
# 9. Git Status (Optional)
# ====================================================
print_header "🔧 Git Repository Status"

if command_exists git && [ -d ".git" ]; then
    # Check if .env is tracked
    if git ls-files --error-unmatch .env >/dev/null 2>&1; then
        print_error ".env is tracked by Git (SECURITY RISK!)"
        print_info "Run: git rm --cached .env"
        OVERALL_STATUS=1
    else
        print_success ".env is not tracked by Git"
    fi

    # Check for uncommitted changes
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        print_success "No uncommitted changes"
    else
        print_info "You have uncommitted changes"
    fi
else
    print_info "Not a Git repository or Git not installed"
fi

# ====================================================
# 10. Summary
# ====================================================
print_header "📊 Health Check Summary"

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✅ ALL SYSTEMS OPERATIONAL${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "🎉 DeporTur is healthy and ready to use!"
    echo ""
    echo "Access URLs:"
    echo "  Frontend: ${BLUE}http://localhost:5173${NC}"
    echo "  Backend:  ${BLUE}http://localhost:8080${NC}"
    echo "  Swagger:  ${BLUE}http://localhost:8080/swagger-ui.html${NC}"
else
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  ⚠️  SOME ISSUES DETECTED${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Please review the warnings and errors above."
    echo ""
    echo "Common fixes:"
    echo "  1. Configure .env: ${YELLOW}cp .env.example .env${NC}"
    echo "  2. Install dependencies: ${YELLOW}./scripts/setup/setup-project.sh${NC}"
    echo "  3. Start services: ${YELLOW}./scripts/start-all.sh${NC}"
fi

echo ""
exit $OVERALL_STATUS
