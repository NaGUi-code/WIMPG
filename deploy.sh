#!/bin/bash
set -e

# WIMPG Deployment Script for Debian 13
# This script handles building and deploying the application with Docker

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running with sudo/root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root or with sudo"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warn ".env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_info "Please edit .env with your configuration before continuing."
        print_info "Run: nano .env"
        exit 0
    else
        print_error ".env.example not found. Please create .env manually."
        exit 1
    fi
fi

print_info "Starting WIMPG deployment..."

# Stop existing containers
print_info "Stopping existing containers..."
docker compose down

# Remove old images (optional, uncomment if you want to force rebuild)
# print_info "Removing old images..."
# docker compose rm -f

# Build images
print_info "Building Docker images..."
docker compose build --no-cache

# Start containers
print_info "Starting containers..."
docker compose up -d

# Wait for services to be healthy
print_info "Waiting for services to be healthy..."
sleep 10

# Check service health
print_info "Checking service health..."

backend_health=$(docker inspect --format='{{.State.Health.Status}}' wimpg-backend 2>/dev/null || echo "not running")
frontend_health=$(docker inspect --format='{{.State.Health.Status}}' wimpg-frontend 2>/dev/null || echo "not running")

if [ "$backend_health" == "healthy" ] || [ "$backend_health" == "starting" ]; then
    print_info "Backend is $backend_health"
else
    print_error "Backend health check failed: $backend_health"
fi

if [ "$frontend_health" == "healthy" ] || [ "$frontend_health" == "starting" ]; then
    print_info "Frontend is $frontend_health"
else
    print_error "Frontend health check failed: $frontend_health"
fi

# Show logs
print_info "Recent logs:"
docker compose logs --tail=50

print_info "Deployment complete!"
print_info "Frontend is running on http://localhost:80"
print_info "Backend API is running on http://localhost:8000"
print_info ""
print_info "Useful commands:"
print_info "  View logs: docker compose logs -f"
print_info "  Stop services: docker compose down"
print_info "  Restart services: docker compose restart"
print_info "  View status: docker compose ps"
