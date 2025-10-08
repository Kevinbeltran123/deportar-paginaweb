#!/bin/bash

# ====================================================
# DeporTur - Complete Project Setup Script
# ====================================================
# This script performs a complete setup of the DeporTur project
# including environment configuration, dependency installation,
# and health checks.
#
# Usage: ./scripts/setup/setup-project.sh
# ====================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ====================================================
# 1. Welcome Message
# ====================================================
clear
print_header "🏔️  DeporTur - Project Setup"
echo "This script will set up your DeporTur development environment."
echo "It will:"
echo "  1. Check system prerequisites"
echo "  2. Set up environment variables"
echo "  3. Install backend dependencies"
echo "  4. Install frontend dependencies"
echo "  5. Verify database connectivity"
echo "  6. Run health checks"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# ====================================================
# 2. Check Prerequisites
# ====================================================
print_header "📋 Checking Prerequisites"

# Check Java
if command_exists java; then
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -ge 17 ]; then
        print_success "Java $JAVA_VERSION detected"
    else
        print_error "Java 17 or higher required. Found Java $JAVA_VERSION"
        exit 1
    fi
else
    print_error "Java not found. Please install Java 17 or higher."
    exit 1
fi

# Check Maven
if command_exists mvn; then
    MVN_VERSION=$(mvn -version | head -n 1 | awk '{print $3}')
    print_success "Maven $MVN_VERSION detected"
else
    print_error "Maven not found. Please install Maven 3.8 or higher."
    exit 1
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        print_success "Node.js $(node -v) detected"
    else
        print_error "Node.js 18 or higher required. Found Node.js v$NODE_VERSION"
        exit 1
    fi
else
    print_error "Node.js not found. Please install Node.js 18 or higher."
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_success "npm $NPM_VERSION detected"
else
    print_error "npm not found. Please install npm."
    exit 1
fi

# Check Git
if command_exists git; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    print_success "Git $GIT_VERSION detected"
else
    print_warning "Git not found. Version control features may not work."
fi

# ====================================================
# 3. Environment Variables Setup
# ====================================================
print_header "🔐 Setting Up Environment Variables"

# Check if .env exists
if [ -f ".env" ]; then
    print_warning ".env file already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Keeping existing .env file"
    else
        cp .env.example .env
        print_success "Created .env from template"
        print_warning "IMPORTANT: Please edit .env and add your actual credentials!"
        print_info "You need to configure:"
        print_info "  - Supabase database credentials"
        print_info "  - Auth0 configuration"
        read -p "Press Enter after you've configured .env..."
    fi
else
    cp .env.example .env
    print_success "Created .env from template"
    print_warning "IMPORTANT: Please edit .env and add your actual credentials!"
    print_info "You need to configure:"
    print_info "  - Supabase database credentials"
    print_info "  - Auth0 configuration"

    # Open .env in default editor
    if command_exists nano; then
        read -p "Open .env in nano editor? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            nano .env
        fi
    else
        print_info "Please edit .env manually with your preferred editor"
        read -p "Press Enter after you've configured .env..."
    fi
fi

# Create backend .env if needed
if [ ! -f "deportur-backend/.env" ]; then
    if [ -f "deportur-backend/.env.example" ]; then
        print_info "Backend can use root .env or its own .env file"
        print_success "Skipping backend .env (will use root .env)"
    fi
fi

# Create frontend .env if needed
if [ ! -f "deportur-frontend/.env" ]; then
    if [ -f "deportur-frontend/.env.example" ]; then
        print_info "Frontend can use root .env or its own .env file"
        print_success "Skipping frontend .env (will use root .env)"
    fi
fi

# ====================================================
# 4. Backend Setup
# ====================================================
print_header "☕ Setting Up Backend (Spring Boot)"

cd deportur-backend

print_info "Cleaning previous builds..."
mvn clean > /dev/null 2>&1 || true

print_info "Downloading dependencies and building project..."
if mvn install -DskipTests; then
    print_success "Backend dependencies installed and project built"
else
    print_error "Backend setup failed"
    exit 1
fi

cd ..

# ====================================================
# 5. Frontend Setup
# ====================================================
print_header "⚛️  Setting Up Frontend (React + Vite)"

cd deportur-frontend

print_info "Installing npm dependencies..."
if npm install; then
    print_success "Frontend dependencies installed"
else
    print_error "Frontend setup failed"
    exit 1
fi

cd ..

# ====================================================
# 6. Database Connectivity Check
# ====================================================
print_header "🗄️  Checking Database Connectivity"

# Load environment variables
set -a
source .env
set +a

if [ -z "$SUPABASE_DB_HOST" ] || [ "$SUPABASE_DB_HOST" = "your-project.pooler.supabase.com" ]; then
    print_warning "Database credentials not configured in .env"
    print_warning "Skipping database connectivity check"
else
    print_info "Testing connection to Supabase..."

    # Check if psql is available
    if command_exists psql; then
        # Try to connect (will timeout after 5 seconds)
        if timeout 5 psql "postgresql://$SUPABASE_DB_USER:$SUPABASE_DB_PASSWORD@$SUPABASE_DB_HOST:$SUPABASE_DB_PORT/$SUPABASE_DB_NAME?sslmode=require" -c "SELECT 1;" >/dev/null 2>&1; then
            print_success "Database connection successful"
        else
            print_warning "Could not connect to database. Please verify your credentials."
            print_info "You can continue and fix this later"
        fi
    else
        print_warning "psql not found. Skipping database connectivity check."
        print_info "Install PostgreSQL client to enable database checks"
    fi
fi

# ====================================================
# 7. Port Availability Check
# ====================================================
print_header "🔌 Checking Port Availability"

check_port() {
    PORT=$1
    SERVICE=$2

    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $PORT is in use (needed for $SERVICE)"
        return 1
    else
        print_success "Port $PORT is available ($SERVICE)"
        return 0
    fi
}

PORTS_OK=true
check_port 8080 "Backend" || PORTS_OK=false
check_port 5173 "Frontend" || PORTS_OK=false

if [ "$PORTS_OK" = false ]; then
    print_warning "Some ports are in use. You may need to stop other services."
fi

# ====================================================
# 8. Git Setup (Optional)
# ====================================================
print_header "🔧 Git Configuration"

if command_exists git; then
    # Check if .git exists
    if [ -d ".git" ]; then
        print_success "Git repository detected"

        # Check if there are any uncommitted changes to .env
        if git ls-files --error-unmatch .env >/dev/null 2>&1; then
            print_error ".env file is tracked by Git!"
            print_warning "This is a security risk. Removing .env from Git..."
            git rm --cached .env
            print_success ".env removed from Git tracking"
        else
            print_success ".env is not tracked by Git (correct)"
        fi
    else
        print_info "Not a Git repository (optional)"
    fi
fi

# ====================================================
# 9. Create Helper Scripts
# ====================================================
print_header "📝 Verifying Helper Scripts"

if [ -f "scripts/start-all.sh" ]; then
    chmod +x scripts/start-all.sh
    print_success "start-all.sh is executable"
fi

if [ -f "scripts/maintenance/check-health.sh" ]; then
    chmod +x scripts/maintenance/check-health.sh
    print_success "check-health.sh is executable"
fi

# ====================================================
# 10. Final Summary
# ====================================================
print_header "🎉 Setup Complete!"

echo -e "${GREEN}✓ Prerequisites verified${NC}"
echo -e "${GREEN}✓ Environment variables configured${NC}"
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Next Steps:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Verify your .env configuration:"
echo "   ${YELLOW}nano .env${NC}"
echo ""
echo "2. Start the development servers:"
echo "   ${YELLOW}./scripts/start-all.sh${NC}"
echo ""
echo "3. Access the application:"
echo "   ${YELLOW}Frontend: http://localhost:5173${NC}"
echo "   ${YELLOW}Backend:  http://localhost:8080${NC}"
echo "   ${YELLOW}Swagger:  http://localhost:8080/swagger-ui.html${NC}"
echo ""
echo "4. Check system health:"
echo "   ${YELLOW}./scripts/maintenance/check-health.sh${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
