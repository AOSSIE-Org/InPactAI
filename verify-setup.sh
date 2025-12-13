#!/bin/bash

echo "=========================================="
echo "InPactAI Docker Setup Verification"
echo "=========================================="
echo ""

check_command() {
    if command -v $1 &> /dev/null; then
        echo "✓ $1 is installed"
        return 0
    else
        echo "✗ $1 is not installed"
        return 1
    fi
}

check_service() {
    if curl -s -o /dev/null -w "%{http_code}" $1 | grep -q $2; then
        echo "✓ $3 is running"
        return 0
    else
        echo "✗ $3 is not responding"
        return 1
    fi
}

echo "Checking prerequisites..."
echo ""

check_command docker
DOCKER=$?

check_command docker-compose || check_command "docker compose"
COMPOSE=$?

echo ""

if [ $DOCKER -ne 0 ] || [ $COMPOSE -ne 0 ]; then
    echo "Please install Docker and Docker Compose first."
    exit 1
fi

echo "Checking environment files..."
echo ""

if [ -f "Backend/.env" ]; then
    echo "✓ Backend/.env exists"
else
    echo "✗ Backend/.env missing - copy from Backend/.env.example"
fi

if [ -f "Frontend/.env" ]; then
    echo "✓ Frontend/.env exists"
else
    echo "✗ Frontend/.env missing - copy from Frontend/.env.example"
fi

echo ""
echo "Checking Docker services..."
echo ""

check_service "http://localhost:8000/" "200" "Backend API"
BACKEND=$?

check_service "http://localhost:5173/" "200" "Frontend"
FRONTEND=$?

check_service "http://localhost:6379/" "" "Redis"
REDIS=$?

echo ""

if [ $BACKEND -eq 0 ] && [ $FRONTEND -eq 0 ]; then
    echo "=========================================="
    echo "✓ All services are running successfully!"
    echo "=========================================="
    echo ""
    echo "Access the application:"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend:  http://localhost:8000"
    echo "  API Docs: http://localhost:8000/docs"
    echo ""
else
    echo "=========================================="
    echo "Some services are not running."
    echo "=========================================="
    echo ""
    echo "Start services with:"
    echo "  docker compose up --build"
    echo ""
fi
