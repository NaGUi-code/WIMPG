# WIMPG - Where Is My Plane Going

A beautiful, real-time flight tracking application built with React and FastAPI. Track any commercial flight worldwide with live position updates, animated routes, and an elegant landing page.

![WIMPG Screenshot](https://wimpg.git-claude.com/og-banner.png)

## ✨ Features

- **Real-time Flight Tracking**: Track flights with live position updates
- **Interactive Map**: Leaflet-powered map with animated flight routes
- **Scheduled Flight Support**: View planned routes for future flights
- **Beautiful Landing Page**: Animated map background with rotating airport codes
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Route Visualization**:
  - Traveled route (solid blue line)
  - Remaining route (dashed gray line)
  - Scheduled routes (dashed blue line)
- **Flight Information Panel**:
  - Real-time telemetry (altitude, speed, heading)
  - Flight status with live indicator
  - Departure/arrival times and airports
  - Progress indicator
- **Docker Deployment**: Easy deployment with Docker Compose
- **Cloudflare Tunnel Ready**: Simple setup for public access

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- AirLabs API key (get one at [airlabs.co](https://airlabs.co/))
- (Optional) Cloudflare account for public deployment

### Local Development

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd WIMPG

# 2. Configure environment
cp .env.example .env
nano .env  # Add your AIRLABS_API_KEY

# 3. Start the application
./deploy.sh

# 4. Open your browser
# Frontend: http://localhost:4000
# Backend API: http://localhost:8000
```

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

For Cloudflare Tunnel setup, see [CLOUDFLARE_TUNNEL.md](./CLOUDFLARE_TUNNEL.md).

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Cloudflare Tunnel                 │
│         wimpg.git-claude.com                │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
                   ▼
          ┌────────────────┐
          │   Frontend     │
          │   (Nginx)      │
          │   Port 4000    │
          └────────┬───────┘
                   │
        ┌──────────┼──────────┐
        │                     │
        ▼                     ▼
   React App            /api/* Proxy
   (SPA)                     │
                             ▼
                    ┌────────────────┐
                    │   Backend      │
                    │   (FastAPI)    │
                    │   Port 8000    │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  AirLabs API   │
                    └────────────────┘
```

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Query** - Data fetching
- **Leaflet** - Interactive maps
- **React Leaflet** - React bindings for Leaflet

### Backend

- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **httpx** - HTTP client
- **python-dotenv** - Environment management

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving
- **Cloudflare Tunnel** - Secure public access

## 📁 Project Structure

```
WIMPG/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── FlightInfoPanel.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── nginx.conf           # Nginx configuration
│   ├── Dockerfile           # Frontend container config
│   └── package.json         # Node dependencies
│
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── routers/        # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   └── main.py         # FastAPI app entry
│   ├── Dockerfile          # Backend container config
│   └── requirements.txt    # Python dependencies
│
├── docker-compose.yml      # Multi-container orchestration
├── deploy.sh               # Deployment script
├── setup.sh                # Server setup script
├── logs.sh                 # View logs helper
├── restart.sh              # Restart services helper
├── stop.sh                 # Stop services helper
│
├── .env.example            # Environment template
├── README.md               # This file
├── QUICKSTART.md           # Quick start guide
├── DEPLOYMENT.md           # Detailed deployment guide
└── CLOUDFLARE_TUNNEL.md    # Cloudflare setup guide
```

## 🎨 Features in Detail

### Landing Page

- Animated world map background (Carto Voyager tiles)
- Three animated flight route arcs:
  - CDG → LAX (Paris to Los Angeles)
  - JNB → SIN (Johannesburg to Singapore)
  - JFK → LHR (New York to London)
- Rotating airport code text animation
- Hero-sized search input
- Floating decorative elements

### Flight Tracking

- **Live Position**: Real-time aircraft position on map
- **Route Visualization**: See the entire flight path
- **Progress Bar**: Visual progress indicator in header
- **Telemetry**: Live altitude, speed, heading, and ETA
- **Airport Markers**: Departure and arrival airports with labels
- **Auto-refresh**: Updates every 10 seconds for active flights

### Flight Status Support

- **En-route**: Active flights with live tracking
- **Scheduled**: Future flights showing planned route
- **Landed**: Completed flights with full route
- **Cancelled**: Display cancellation status

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# AirLabs API Configuration
# Get your API key from https://airlabs.co/
AIRLABS_API_KEY=your_api_key_here

# Use fixture data instead of real API (for development/testing)
USE_FIXTURES=false
```

### Ports

- **4000**: Frontend (exposed to Cloudflare Tunnel)
- **8000**: Backend API (internal only)

## 📝 API Endpoints

### Backend API

- `GET /api/health` - Health check endpoint
- `GET /api/flights/:flightId` - Get flight information

### Frontend Routes

- `/` - Landing page (when no flight is searched)
- `/` - Flight tracking view (with flight search)

All frontend routes serve the same SPA entry point.

## 🐳 Docker Commands

```bash
# Deploy/redeploy
./deploy.sh

# View logs
./logs.sh
docker compose logs -f

# Restart services
./restart.sh
docker compose restart

# Stop services
./stop.sh
docker compose down

# View status
docker compose ps

# Rebuild without cache
docker compose build --no-cache
```

## 🌐 Cloudflare Tunnel Setup

Point your Cloudflare Tunnel to `localhost:4000`:

**In Cloudflare Dashboard:**

- **Public Hostname**: `wimpg.git-claude.com`
- **Service Type**: `HTTP`
- **URL**: `localhost:4000`

See [CLOUDFLARE_TUNNEL.md](./CLOUDFLARE_TUNNEL.md) for complete setup instructions.

## 🧪 Testing

```bash
# Test frontend health
curl http://localhost:4000/health

# Test backend health
curl http://localhost:8000/api/health

# Test flight data (replace with actual flight)
curl http://localhost:8000/api/flights/UA900

# Test through Cloudflare Tunnel
curl https://wimpg.git-claude.com/health
```

## 🔍 Troubleshooting

### Services won't start

```bash
docker compose logs
sudo netstat -tulpn | grep -E ':(4000|8000)'
```

### Frontend can't reach backend

```bash
docker exec -it wimpg-frontend wget -O- http://backend:8000/api/health
docker network inspect wimpg_wimpg-network
```

### Health checks failing

```bash
docker inspect wimpg-backend | grep -A 10 Health
docker inspect wimpg-frontend | grep -A 10 Health
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for more troubleshooting tips.

## 📖 Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment instructions
- [CLOUDFLARE_TUNNEL.md](./CLOUDFLARE_TUNNEL.md) - Cloudflare Tunnel setup

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [AirLabs](https://airlabs.co/) - Flight data API
- [Leaflet](https://leafletjs.com/) - Interactive maps
- [CARTO](https://carto.com/) - Map tiles
- [Cloudflare](https://cloudflare.com/) - Tunnel and CDN services

## 📧 Support

For issues and questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
3. Open an issue on GitHub

---

Built with ❤️ using React, FastAPI, and Docker
