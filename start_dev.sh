#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Starting Mantrix Development Environment${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    pkill -f "npm start"
    pkill -f "uvicorn src.main:app"
    docker-compose stop redis 2>/dev/null
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo -e "${RED}Virtual environment not found. Creating one...${NC}"
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
else
    echo -e "${GREEN}✓ Virtual environment found${NC}"
fi

# Start Core Docker Services (Redis, PostgreSQL, MongoDB, Weaviate)
echo -e "\n${YELLOW}Starting Core Docker Services...${NC}"
docker-compose up -d redis postgres mongodb weaviate 2>&1 | grep -v "variable is not set"
sleep 3

# Check Redis
if docker ps --format '{{.Names}}' | grep -q "mantrix.*redis"; then
    echo -e "${GREEN}✓ Redis started on localhost:6379${NC}"
else
    echo -e "${RED}✗ Failed to start Redis${NC}"
    exit 1
fi

# Check PostgreSQL
if docker ps --format '{{.Names}}' | grep -q "mantrix.*postgres"; then
    echo -e "${GREEN}✓ PostgreSQL started on localhost:5433${NC}"
else
    echo -e "${RED}✗ Failed to start PostgreSQL${NC}"
    exit 1
fi

# Check MongoDB
if docker ps --format '{{.Names}}' | grep -q "mantrix.*mongodb"; then
    echo -e "${GREEN}✓ MongoDB started on localhost:27017${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB failed to start (optional)${NC}"
fi

# Check Weaviate
if docker ps --format '{{.Names}}' | grep -q "mantrix.*weaviate"; then
    echo -e "${GREEN}✓ Weaviate started on localhost:8082${NC}"
else
    echo -e "${YELLOW}⚠ Weaviate failed to start (optional)${NC}"
fi

# Start Backend
echo -e "\n${YELLOW}Starting Backend (FastAPI)...${NC}"

# Kill any existing backend processes on port 8000
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}  Stopping existing backend processes...${NC}"
    lsof -Pi :8000 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    sleep 1
fi

cd "$(dirname "$0")/backend"
./venv/bin/python -m uvicorn src.main:app --reload > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3

if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend started on http://localhost:8000${NC}"
    echo -e "  PID: $BACKEND_PID"
    echo -e "  Logs: logs/backend.log"
else
    echo -e "${RED}✗ Failed to start backend${NC}"
    exit 1
fi

# Start Frontend
echo -e "\n${YELLOW}Starting Frontend (React + Vite)...${NC}"

# Kill any existing frontend processes on port 3001
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}  Stopping existing frontend processes...${NC}"
    lsof -Pi :3001 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    sleep 1
fi

cd frontend
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 3

if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Frontend started on http://localhost:3001${NC}"
    echo -e "  PID: $FRONTEND_PID"
    echo -e "  Logs: logs/frontend.log"
else
    echo -e "${RED}✗ Failed to start frontend${NC}"
    exit 1
fi

# Optional: Start Neo4j and Fuseki (less commonly used)
if [ "$1" == "--full" ]; then
    echo -e "\n${YELLOW}Starting additional services (Neo4j, Fuseki)...${NC}"
    docker-compose up -d neo4j fuseki 2>&1 | grep -v "variable is not set"
    sleep 3
    echo -e "${GREEN}✓ Additional services started${NC}"
    echo -e "  Neo4j: localhost:7474 (browser), localhost:7687 (bolt)"
    echo -e "  Fuseki: localhost:3030"
fi

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  All services running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Frontend:  ${NC} http://localhost:3001"
echo -e "${GREEN}Backend:   ${NC} http://localhost:8000"
echo -e "${GREEN}API Docs:  ${NC} http://localhost:8000/docs"
echo -e "\n${GREEN}Databases:${NC}"
echo -e "${GREEN}  PostgreSQL:${NC} localhost:5433"
echo -e "${GREEN}  MongoDB:   ${NC} localhost:27017"
echo -e "${GREEN}  Redis:     ${NC} localhost:6379"
echo -e "${GREEN}  Weaviate:  ${NC} localhost:8082"
echo -e "\n${YELLOW}Logs:${NC}"
echo -e "  Backend:  tail -f logs/backend.log"
echo -e "  Frontend: tail -f logs/frontend.log"
echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}"

# Keep script running and tail logs
tail -f logs/backend.log logs/frontend.log
