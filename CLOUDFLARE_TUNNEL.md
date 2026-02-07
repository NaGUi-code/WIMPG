# Cloudflare Tunnel Configuration for WIMPG

## Quick Setup

Your application runs on **localhost:4000** after deployment.

### Cloudflare Dashboard Configuration

When creating the tunnel route in Cloudflare Dashboard:

**Public Hostname Settings:**

- **Subdomain**: `wimpg`
- **Domain**: `git-claude.com`
- **Path**: Leave empty or `/`

**Service Settings:**

- **Type**: `HTTP`
- **URL**: `localhost:4000`

### DNS Record

The DNS record `wimpg.git-claude.com` will be automatically created by Cloudflare.

### Architecture

```
Internet
    ↓
wimpg.git-claude.com (Cloudflare Tunnel)
    ↓
localhost:4000 (Frontend nginx)
    ├─ Serves React app for /*
    └─ Proxies to backend:8000 for /api/*
```

### Deployment Steps

1. **Deploy the application:**

   ```bash
   ./deploy.sh
   ```

2. **Verify it's running locally:**

   ```bash
   curl http://localhost:4000/health        # Frontend health
   curl http://localhost:8000/api/health    # Backend health
   ```

3. **Configure Cloudflare Tunnel:**
   - Go to Cloudflare Dashboard → Zero Trust → Networks → Tunnels
   - Create or edit your tunnel
   - Add a public hostname:
     - Public hostname: `wimpg.git-claude.com`
     - Service: `HTTP` → `localhost:4000`
   - Save the configuration

4. **Test your deployment:**
   ```bash
   curl https://wimpg.git-claude.com/health
   ```

### Ports Summary

- **Port 4000**: Frontend (exposed to Cloudflare Tunnel)
  - React app serving
  - `/api/*` reverse proxy to backend
  - Health check endpoint at `/health`

- **Port 8000**: Backend (internal only, not exposed externally)
  - FastAPI application
  - Health check endpoint at `/api/health`

### Notes

- Only port 4000 needs to be accessible to the Cloudflare connector
- The backend on port 8000 is only accessible internally via Docker network
- All API requests to `/api/*` are automatically proxied from frontend to backend
- HTTPS is handled by Cloudflare, you don't need SSL certificates on your server
