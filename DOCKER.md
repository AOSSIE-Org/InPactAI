# Docker Setup Guide

This guide explains how to run InPactAI using Docker and Docker Compose.

## Architecture

The application consists of three services:

- **Backend**: FastAPI application (Python 3.10)
- **Frontend**: React + Vite application (Node 18)
- **Redis**: Cache and pub/sub messaging

All services run in isolated containers connected via a private network.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2+
- 4GB RAM minimum
- 10GB free disk space

## Quick Start

### 1. Clone and Configure

```bash
git clone https://github.com/AOSSIE-Org/InPact.git
cd InPact
```

### 2. Setup Environment Files

**Backend:**
```bash
cp Backend/.env.example Backend/.env
```

Edit `Backend/.env` with your credentials:
```env
user=postgres
password=your_password
host=your_supabase_host
port=5432
dbname=postgres
GROQ_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
GEMINI_API_KEY=your_key
YOUTUBE_API_KEY=your_key
REDIS_HOST=redis
REDIS_PORT=6379
```

**Frontend:**
```bash
cp Frontend/.env.example Frontend/.env
```

Edit `Frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_YOUTUBE_API_KEY=your_api_key
VITE_API_URL=http://localhost:8000
```

### 3. Start Services

```bash
docker compose up --build
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 4. Stop Services

```bash
docker compose down
```

Remove volumes:
```bash
docker compose down -v
```

## Development Workflow

### Hot Reload

Both frontend and backend support hot reloading. Changes to source files are automatically detected and applied without restarting containers.

### Logs

View all logs:
```bash
docker compose logs -f
```

View specific service:
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f redis
```

### Rebuild After Changes

If you modify `requirements.txt` or `package.json`:
```bash
docker compose up --build
```

### Execute Commands in Containers

Backend shell:
```bash
docker compose exec backend bash
```

Frontend shell:
```bash
docker compose exec frontend sh
```

Install new Python package:
```bash
docker compose exec backend pip install package-name
```

Install new npm package:
```bash
docker compose exec frontend npm install package-name
```

## Troubleshooting

### Port Already in Use

If ports 5173, 8000, or 6379 are in use:

```bash
docker compose down
```

Or modify ports in `docker-compose.yml`.

### Permission Errors (Linux/Mac)

```bash
sudo chown -R $USER:$USER .
```

### Container Fails to Start

Check logs:
```bash
docker compose logs backend
docker compose logs frontend
```

### Database Connection Issues

Ensure your Supabase credentials in `Backend/.env` are correct and the host is accessible from Docker containers.

### Clear Everything and Restart

```bash
docker compose down -v
docker system prune -a
docker compose up --build
```

## Production Considerations

For production deployment:

1. Use production-ready images (remove `--reload` flag)
2. Set up environment-specific `.env` files
3. Configure reverse proxy (nginx/traefik)
4. Enable HTTPS
5. Use secrets management
6. Set resource limits in `docker-compose.yml`

## Network Configuration

All services communicate via the `inpactai-network` bridge network:
- Backend connects to Redis via hostname `redis`
- Frontend connects to Backend via `http://backend:8000` internally
- External access via mapped ports

## Volume Mounts

- `./Backend:/app` - Backend source code (hot reload)
- `./Frontend:/app` - Frontend source code (hot reload)
- `redis_data:/data` - Redis persistent storage
- `/app/__pycache__` - Excluded Python cache
- `/app/node_modules` - Excluded node modules

## Cross-Platform Support

The Docker setup works on:
- Windows 10/11 (WSL2 recommended)
- macOS (Intel & Apple Silicon)
- Linux (all distributions)

Multi-stage builds ensure optimal image sizes across all platforms.
