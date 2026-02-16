# Docker Quick Reference

## Essential Commands

### First Time Setup
```bash
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
# Edit .env files with your credentials
docker compose up --build
```

### Daily Development
```bash
docker compose up          # Start services
docker compose down        # Stop services
docker compose restart     # Restart services
docker compose logs -f     # View logs
```

### Rebuilding
```bash
docker compose up --build                  # Rebuild and start
docker compose build backend               # Rebuild backend only
docker compose build frontend              # Rebuild frontend only
```

### Debugging
```bash
docker compose logs backend                # Backend logs
docker compose logs frontend               # Frontend logs
docker compose logs redis                  # Redis logs
docker compose exec backend bash           # Backend shell
docker compose exec frontend sh            # Frontend shell
docker compose ps                          # List running containers
```

### Cleanup
```bash
docker compose down -v                     # Stop and remove volumes
docker system prune -a                     # Clean everything
docker compose down && docker compose up   # Full restart
```

## Service Access

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React application |
| Backend | http://localhost:8000 | FastAPI server |
| API Docs | http://localhost:8000/docs | Swagger UI |
| Redis | localhost:6379 | Cache server |

## File Structure

```
InPactAI/
├── docker-compose.yml           # Development orchestration
├── docker-compose.prod.yml      # Production orchestration
├── Backend/
│   ├── Dockerfile              # Dev backend image
│   ├── Dockerfile.prod         # Prod backend image
│   ├── .dockerignore
│   ├── .env.example
│   └── .env                    # Your credentials
└── Frontend/
    ├── Dockerfile              # Dev frontend image
    ├── Dockerfile.prod         # Prod frontend image
    ├── .dockerignore
    ├── .env.example
    └── .env                    # Your credentials
```

## Environment Variables

### Backend (.env)
- Database: `user`, `password`, `host`, `port`, `dbname`
- APIs: `GROQ_API_KEY`, `GEMINI_API_KEY`, `YOUTUBE_API_KEY`
- Supabase: `SUPABASE_URL`, `SUPABASE_KEY`
- Redis: `REDIS_HOST=redis`, `REDIS_PORT=6379`

### Frontend (.env)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_YOUTUBE_API_KEY`
- `VITE_API_URL=http://localhost:8000`

## Troubleshooting

### Port conflicts
```bash
docker compose down
# Change ports in docker-compose.yml or stop conflicting services
```

### Permission errors (Linux/Mac)
```bash
sudo chown -R $USER:$USER .
```

### Container won't start
```bash
docker compose logs <service-name>
docker compose restart <service-name>
```

### Hot reload not working
```bash
# Verify volume mounts in docker-compose.yml
docker compose down -v
docker compose up --build
```

### Database connection failed
- Check Supabase credentials in `Backend/.env`
- Ensure host is accessible from Docker
- Verify network connectivity

## Production Deployment

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down
```

## Makefile Commands (if available)

```bash
make help          # Show all commands
make dev           # Start development
make prod          # Start production
make logs          # View logs
make clean         # Clean everything
```
