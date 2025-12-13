# Docker Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Docker Host Machine                          │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Docker Network: inpactai-network          │   │
│  │                                                               │   │
│  │  ┌──────────────────┐    ┌──────────────────┐    ┌────────┐│   │
│  │  │   Frontend       │    │   Backend        │    │ Redis  ││   │
│  │  │   Container      │    │   Container      │    │ Container   │
│  │  │                  │    │                  │    │        ││   │
│  │  │  Node 18-alpine  │    │ Python 3.10-slim │    │ Redis 7││   │
│  │  │  Vite Dev Server │◄───┤  FastAPI + uvicorn   │ Alpine ││   │
│  │  │  Port: 5173      │    │  Port: 8000      │◄───┤ Port:  ││   │
│  │  │                  │    │                  │    │ 6379   ││   │
│  │  └──────────────────┘    └──────────────────┘    └────────┘│   │
│  │         │                        │                     │    │   │
│  │         │ Volume Mount           │ Volume Mount        │    │   │
│  │         │ (Hot Reload)           │ (Hot Reload)        │    │   │
│  │         ▼                        ▼                     ▼    │   │
│  │  ┌──────────────┐        ┌─────────────┐      ┌──────────┐│   │
│  │  │ ./Frontend   │        │ ./Backend   │      │redis_data││   │
│  │  │ /app         │        │ /app        │      │  Volume  ││   │
│  │  └──────────────┘        └─────────────┘      └──────────┘│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  Port Mappings:                                                      │
│  ┌─────────────┬──────────────┬────────────────────────────────┐   │
│  │ Host:5173   │ ──────────►  │ frontend:5173 (React + Vite)   │   │
│  │ Host:8000   │ ──────────►  │ backend:8000  (FastAPI)        │   │
│  │ Host:6379   │ ──────────►  │ redis:6379    (Cache)          │   │
│  └─────────────┴──────────────┴────────────────────────────────┘   │
│                                                                       │
│  Environment Files:                                                  │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Backend/.env  → Backend Container                          │    │
│  │  Frontend/.env → Frontend Container                         │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

User Browser
     │
     ▼
http://localhost:5173 ──► Frontend Container ──► React UI
                                   │
                                   │ API Calls
                                   ▼
                          http://backend:8000 ──► Backend Container ──► FastAPI
                                                          │
                                                          │ Cache/PubSub
                                                          ▼
                                                   redis:6379 ──► Redis Container


Communication Flow:
──────────────────────

1. User accesses http://localhost:5173
   └─► Docker routes to Frontend Container

2. Frontend makes API call to /api/*
   └─► Vite proxy forwards to http://backend:8000
       └─► Docker network resolves 'backend' to Backend Container

3. Backend connects to Redis
   └─► Uses REDIS_HOST=redis environment variable
       └─► Docker network resolves 'redis' to Redis Container

4. Backend connects to Supabase
   └─► Uses credentials from Backend/.env
       └─► External connection via internet


Service Dependencies:
─────────────────────

redis (no dependencies)
   │
   └─► backend (depends on redis)
          │
          └─► frontend (depends on backend)


Health Checks:
──────────────

Redis:     redis-cli ping
Backend:   curl http://localhost:8000/
Frontend:  No health check (depends on backend health)


Volume Mounts:
──────────────

Development:
  ./Backend:/app              (Hot reload for Python)
  ./Frontend:/app             (Hot reload for Vite)
  /app/__pycache__            (Excluded)
  /app/node_modules           (Excluded)

Production:
  redis_data:/data            (Persistent Redis storage only)


Build Process:
──────────────

Development:
  1. Copy package files
  2. Install dependencies
  3. Copy source code
  4. Start dev server with hot reload

Production:
  Stage 1: Build
    1. Copy package files
    2. Install dependencies
    3. Copy source code
    4. Build optimized bundle
  
  Stage 2: Serve
    1. Copy built artifacts
    2. Use minimal runtime (nginx for frontend)
    3. Serve optimized files


Network Isolation:
──────────────────

Internal Network (inpactai-network):
  - frontend ←→ backend (HTTP)
  - backend ←→ redis (TCP)
  
External Access:
  - Host machine → All containers (via port mapping)
  - Backend → Supabase (via internet)
  - Backend → External APIs (via internet)


Security Model:
───────────────

Development:
  - Root user in containers (for hot reload)
  - Source code mounted as volumes
  - Debug logging enabled

Production:
  - Non-root user in containers
  - No volume mounts (except data)
  - Production logging
  - Resource limits enforced
  - Optimized images
```

## Quick Command Reference

```bash
Start:     docker compose up --build
Stop:      docker compose down
Logs:      docker compose logs -f
Rebuild:   docker compose up --build
Clean:     docker compose down -v
```

## Service URLs

| Service | Internal | External |
|---------|----------|----------|
| Frontend | frontend:5173 | http://localhost:5173 |
| Backend | backend:8000 | http://localhost:8000 |
| Redis | redis:6379 | localhost:6379 |
