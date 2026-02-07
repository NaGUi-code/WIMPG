#!/bin/bash
# Initial server setup script for WIMPG on Debian 13

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Debian
if [ ! -f /etc/debian_version ]; then
    print_error "This script is designed for Debian systems"
    exit 1
fi

print_info "WIMPG Server Setup Script for Debian"
print_info "======================================"

# Check if Docker is installed
if command -v docker &> /dev/null; then
    print_info "Docker is already installed ($(docker --version))"
else
    print_info "Installing Docker..."

    sudo apt-get update
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release

    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    print_info "Docker installed successfully"
fi

# Add current user to docker group
if groups $USER | grep -q '\bdocker\b'; then
    print_info "User $USER is already in docker group"
else
    print_info "Adding $USER to docker group..."
    sudo usermod -aG docker $USER
    print_warn "You need to log out and back in for docker group membership to take effect"
fi

# Check if Cloudflared is installed
if command -v cloudflared &> /dev/null; then
    print_info "Cloudflared is already installed ($(cloudflared --version))"
else
    print_info "Installing Cloudflared..."
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb
    sudo dpkg -i /tmp/cloudflared.deb
    rm /tmp/cloudflared.deb
    print_info "Cloudflared installed successfully"
fi

# Install useful tools
print_info "Installing useful tools..."
sudo apt-get install -y curl wget git nano htop

# Configure Docker to start on boot
print_info "Enabling Docker service..."
sudo systemctl enable docker

# Optional: Install systemd service for WIMPG
if [ -f "wimpg.service" ]; then
    read -p "Do you want to install WIMPG as a systemd service (auto-start on boot)? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Installing WIMPG systemd service..."
        sudo cp wimpg.service /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable wimpg.service
        print_info "WIMPG service installed and enabled"
    fi
fi

# Check UFW firewall
if command -v ufw &> /dev/null; then
    print_info "UFW firewall detected"
    print_warn "Make sure to allow ports 80 and 443 if you're using UFW:"
    print_warn "  sudo ufw allow 80/tcp"
    print_warn "  sudo ufw allow 443/tcp"
fi

print_info ""
print_info "Setup complete!"
print_info ""
print_info "Next steps:"
print_info "1. Log out and back in (if added to docker group)"
print_info "2. Copy .env.example to .env and configure your API key"
print_info "3. Run ./deploy.sh to start the application"
print_info "4. Configure Cloudflare Tunnel (see DEPLOYMENT.md)"
print_info ""
print_info "Useful commands:"
print_info "  docker --version          # Verify Docker"
print_info "  docker compose version    # Verify Docker Compose"
print_info "  cloudflared --version     # Verify Cloudflared"
