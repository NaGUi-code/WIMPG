# WIMPG - Quick Start Guide

## Prerequisites

- Debian 13 server
- Docker & Docker Compose installed
- Cloudflare account (for tunnel)

## Quick Deploy

### 1. Initial Setup

```bash
# Install Docker & Docker Compose (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and back in

# Clone/upload project
cd /opt
sudo mkdir wimpg && sudo chown $USER:$USER wimpg
cd wimpg
# (upload your files here)

# Configure environment
cp .env.example .env
nano .env  # Add your AIRLABS_API_KEY
```

### 2. Deploy Application

```bash
./deploy.sh
```

### 3. Setup Cloudflare Tunnel

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Login and create tunnel
cloudflared tunnel login
cloudflared tunnel create wimpg

# Configure tunnel
nano ~/.cloudflared/config.yml
```

Add to `config.yml`:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /root/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: yourdomain.com
    service: http://localhost:80
  - service: http_status:404
```

```bash
# Route DNS and start
cloudflared tunnel route dns wimpg yourdomain.com
sudo cloudflared service install
sudo systemctl start cloudflared
```

### 4. Verify

```bash
# Check services
docker compose ps

# Check logs
./logs.sh

# Test locally
curl http://localhost:80/health
curl http://localhost:8000/api/health
```

## Common Commands

```bash
./deploy.sh   # Deploy/redeploy application
./logs.sh     # View logs
./restart.sh  # Restart services
./stop.sh     # Stop services

docker compose ps          # Service status
docker compose logs -f     # Follow logs
docker compose restart     # Restart all
docker compose down        # Stop all
```

## File Structure

```
WIMPG/
├── backend/
│   ├── Dockerfile         # Backend container config
│   ├── .dockerignore      # Files to exclude from build
│   ├── requirements.txt   # Python dependencies
│   └── app/              # Application code
├── frontend/
│   ├── Dockerfile        # Frontend container config
│   ├── .dockerignore     # Files to exclude from build
│   ├── nginx.conf        # Nginx configuration
│   └── src/             # React application
├── docker-compose.yml    # Multi-container orchestration
├── .env                  # Environment variables (create from .env.example)
├── .env.example         # Environment template
├── deploy.sh            # Main deployment script
├── logs.sh              # View logs
├── restart.sh           # Restart services
├── stop.sh              # Stop services
├── DEPLOYMENT.md        # Detailed deployment guide
└── QUICKSTART.md        # This file
```

## Troubleshooting

**Services won't start:**

```bash
docker compose logs
sudo netstat -tulpn | grep -E ':(80|8000)'
```

**Can't access from internet:**

```bash
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -f
```

**Health checks failing:**

```bash
curl http://localhost:8000/api/health
curl http://localhost:80/health
docker inspect wimpg-backend | grep -A 10 Health
```

## Support

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed documentation.

## Ports

- Frontend: `http://localhost:80`
- Backend API: `http://localhost:8000`
- Cloudflare Tunnel: Proxies to localhost (no open ports)
