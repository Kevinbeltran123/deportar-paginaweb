#!/bin/bash

# ====================================================
# DeporTur - Clean Installation Script
# ====================================================
# This script performs a clean installation by removing
# all build artifacts, dependencies, and cached files
# before running a fresh setup.
#
# Usage: ./scripts/setup/clean-install.sh
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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ====================================================
# 1. Warning
# ====================================================
clear
print_header "🧹 DeporTur - Clean Installation"

echo -e "${RED}WARNING: This will delete:${NC}"
echo "  - Backend build files (target/)"
echo "  - Frontend build files (dist/, node_modules/)"
echo "  - All cached dependencies"
echo "  - IDE-specific files (.idea/, .vscode/)"
echo ""
echo -e "${YELLOW}Your .env file and source code will NOT be deleted.${NC}"
echo ""
read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# ====================================================
# 2. Clean Backend
# ====================================================
print_header "☕ Cleaning Backend"

cd deportur-backend

# Clean Maven build
if [ -d "target" ]; then
    print_info "Removing target/ directory..."
    rm -rf target/
    print_success "Removed target/"
fi

# Clean Maven cache (optional)
print_info "Running Maven clean..."
mvn clean > /dev/null 2>&1 || true
print_success "Maven clean complete"

# Clean IDE files
if [ -d ".idea" ]; then
    print_info "Removing .idea/ directory..."
    rm -rf .idea/
    print_success "Removed .idea/"
fi

if [ -f "*.iml" ]; then
    print_info "Removing .iml files..."
    rm -f *.iml
    print_success "Removed .iml files"
fi

cd ..

# ====================================================
# 3. Clean Frontend
# ====================================================
print_header "⚛️  Cleaning Frontend"

cd deportur-frontend

# Clean node_modules
if [ -d "node_modules" ]; then
    print_info "Removing node_modules/ directory (this may take a moment)..."
    rm -rf node_modules/
    print_success "Removed node_modules/"
fi

# Clean dist
if [ -d "dist" ]; then
    print_info "Removing dist/ directory..."
    rm -rf dist/
    print_success "Removed dist/"
fi

# Clean Vite cache
if [ -d ".vite" ]; then
    print_info "Removing .vite/ cache..."
    rm -rf .vite/
    print_success "Removed .vite/"
fi

# Clean package-lock
if [ -f "package-lock.json" ]; then
    print_info "Removing package-lock.json..."
    rm -f package-lock.json
    print_success "Removed package-lock.json"
fi

# Clean IDE files
if [ -d ".vscode" ]; then
    print_info "Removing .vscode/ directory..."
    rm -rf .vscode/
    print_success "Removed .vscode/"
fi

cd ..

# ====================================================
# 4. Clean Root Directory
# ====================================================
print_header "🗑️  Cleaning Root Directory"

# Clean logs
if [ -d "logs" ]; then
    print_info "Removing logs/ directory..."
    rm -rf logs/
    print_success "Removed logs/"
fi

# Clean temporary files
find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true

print_success "Removed temporary files"

# ====================================================
# 5. Run Fresh Setup
# ====================================================
print_header "🚀 Running Fresh Setup"

if [ -f "scripts/setup/setup-project.sh" ]; then
    print_info "Starting fresh project setup..."
    chmod +x scripts/setup/setup-project.sh
    ./scripts/setup/setup-project.sh
else
    print_warning "setup-project.sh not found"
    print_info "Please run the setup manually"
fi

# ====================================================
# 6. Summary
# ====================================================
print_header "✅ Clean Installation Complete"

echo -e "${GREEN}All build artifacts and caches have been removed.${NC}"
echo -e "${GREEN}Fresh dependencies have been installed.${NC}"
echo ""
echo "You can now start the development servers:"
echo "  ${YELLOW}./scripts/start-all.sh${NC}"
echo ""
