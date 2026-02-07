# WIMPG Deployment Guide

This guide covers deploying the WIMPG (Where Is My Plane Going) flight tracker application on Debian 13 using Docker and Cloudflare Tunnel.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Cloudflare Tunnel Setup](#cloudflare-tunnel-setup)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- Debian 13 (Trixie)
- Minimum 2GB RAM
- 10GB free disk space
- Root or sudo access

### Required Software

1. **Docker** (v24.0 or later)
2. **Docker Compose** (v2.0 or later)
3. **Cloudflared** (for Cloudflare Tunnel)

## Installation

### 1. Install Docker

```bash
# Update package index
sudo apt update

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (logout/login required)
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

### 2. Install Cloudflared (Cloudflare Tunnel)

```bash
# Download and install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
rm cloudflared.deb

# Verify installation
cloudflared --version
```

## Configuration

### 1. Clone or Upload Project

Upload your project to the server, or clone from git:

```bash
cd /opt
sudo git clone <your-repo-url> wimpg
sudo chown -R $USER:$USER wimpg
cd wimpg
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the configuration
nano .env
```

Required configuration in `.env`:

```bash
# Get your API key from https://airlabs.co/
AIRLABS_API_KEY=your_actual_api_key_here

# Set to false for production
USE_FIXTURES=false
```

## Deployment

### Initial Deployment

```bash
# From the project root directory
./deploy.sh
```

The script will:

1. Check for Docker and Docker Compose
2. Verify `.env` file exists
3. Build Docker images
4. Start the containers
5. Wait for health checks
6. Display logs and service status

### Manual Deployment Steps

If you prefer manual control:

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## Cloudflare Tunnel Setup

### 1. Authenticate Cloudflared

```bash
cloudflared tunnel login
```

This opens a browser to authenticate with Cloudflare.

### 2. Create a Tunnel

```bash
# Create tunnel
cloudflared tunnel create wimpg

# This creates a credentials file at:
# ~/.cloudflared/<TUNNEL-ID>.json
```

### 3. Configure the Tunnel

Create tunnel configuration:

```bash
nano ~/.cloudflared/config.yml
```

Add the following configuration:

```yaml
tunnel: <TUNNEL-ID>
credentials-file: /root/.cloudflared/<TUNNEL-ID>.json

ingress:
  # Route your domain to the frontend
  - hostname: wimpg.yourdomain.com
    service: http://localhost:80

  # API subdomain (optional)
  - hostname: api.wimpg.yourdomain.com
    service: http://localhost:8000

  # Catch-all rule (required)
  - service: http_status:404
```

### 4. Route DNS

```bash
# Route your domain through the tunnel
cloudflared tunnel route dns wimpg wimpg.yourdomain.com

# If using API subdomain
cloudflared tunnel route dns wimpg api.wimpg.yourdomain.com
```

### 5. Run the Tunnel

```bash
# Test the tunnel
cloudflared tunnel run wimpg

# If it works, set it up as a service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### 6. Verify Tunnel Status

```bash
# Check service status
sudo systemctl status cloudflared

# View tunnel info
cloudflared tunnel info wimpg
```

## Maintenance

### Helper Scripts

The project includes helper scripts for common operations:

```bash
# View logs
./logs.sh

# Restart services
./restart.sh

# Stop services
./stop.sh

# Redeploy (rebuild and restart)
./deploy.sh
```

### Docker Commands

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f [backend|frontend]

# Restart a specific service
docker compose restart [backend|frontend]

# Stop all services
docker compose down

# Remove everything including volumes
docker compose down -v

# Rebuild without cache
docker compose build --no-cache

# Update and restart
docker compose up -d --build
```

### Updating the Application

```bash
# Pull latest changes (if using git)
git pull

# Rebuild and restart
./deploy.sh

# Or manually
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Monitoring

```bash
# View container resource usage
docker stats

# Check container health
docker inspect --format='{{.State.Health.Status}}' wimpg-backend
docker inspect --format='{{.State.Health.Status}}' wimpg-frontend

# View detailed logs
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs for errors
docker compose logs

# Check if ports are already in use
sudo netstat -tulpn | grep -E ':(80|8000)\s'

# Verify Docker is running
sudo systemctl status docker

# Check for permission issues
ls -la ~/.cloudflared/
```

### Frontend Can't Reach Backend

1. Check that both containers are on the same network:

```bash
docker network inspect wimpg_wimpg-network
```

2. Test backend from frontend container:

```bash
docker exec -it wimpg-frontend wget -O- http://backend:8000/api/health
```

3. Check nginx configuration:

```bash
docker exec -it wimpg-frontend cat /etc/nginx/conf.d/default.conf
```

### Cloudflare Tunnel Issues

```bash
# Check tunnel status
sudo systemctl status cloudflared

# View tunnel logs
sudo journalctl -u cloudflared -f

# Verify tunnel configuration
cat ~/.cloudflared/config.yml

# Test tunnel manually
cloudflared tunnel run wimpg

# List all tunnels
cloudflared tunnel list
```

### Health Check Failures

```bash
# Check backend health endpoint directly
curl http://localhost:8000/api/health

# Check frontend health endpoint
curl http://localhost:80/health

# View container health logs
docker inspect wimpg-backend | grep -A 10 Health
docker inspect wimpg-frontend | grep -A 10 Health
```

### Application Errors

```bash
# Check environment variables
docker compose config

# Verify .env file
cat .env

# Test API key (if using real API)
curl "https://airlabs.co/api/v9/flights?flight_icao=UAL900&api_key=YOUR_KEY"

# Check application logs
docker compose logs backend | grep -i error
docker compose logs frontend | grep -i error
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check disk space
df -h

# Check memory
free -h

# View Docker disk usage
docker system df
```

### Clean Up

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Clean everything (careful!)
docker system prune -a --volumes
```

## Production Best Practices

1. **Security**
   - Use strong API keys
   - Keep Docker and system packages updated
   - Configure firewall rules (UFW):
     ```bash
     sudo ufw allow 80/tcp
     sudo ufw allow 443/tcp
     sudo ufw enable
     ```
   - Regularly rotate credentials

2. **Monitoring**
   - Set up log rotation
   - Monitor disk space
   - Track container health
   - Use Cloudflare Analytics

3. **Backups**
   - Backup `.env` file securely
   - Backup Cloudflare tunnel credentials
   - Document configuration changes

4. **Updates**
   - Regularly update Docker images
   - Keep Cloudflared updated
   - Monitor for security patches

## Service Architecture

```
Internet
    ↓
Cloudflare Tunnel (cloudflared)
    ↓
Frontend Container (nginx:80)
    ↓ (proxies /api/* to backend)
Backend Container (uvicorn:8000)
    ↓
AirLabs API
```

## Ports

- **Frontend**: 80 (HTTP)
- **Backend**: 8000 (HTTP)
- **Cloudflare Tunnel**: Outbound connections only (no open ports)

## Support

For issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs: `./logs.sh`
3. Check service health: `docker compose ps`
4. Verify Cloudflare tunnel: `cloudflared tunnel info wimpg`

## License

[Your License Here]
