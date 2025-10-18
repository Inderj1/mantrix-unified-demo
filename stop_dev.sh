#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping all development services...${NC}"

# Stop Frontend
echo -e "\n${YELLOW}Stopping Frontend...${NC}"
pkill -f "npm start" && echo -e "${GREEN}✓ Frontend stopped${NC}" || echo -e "${RED}✗ Frontend not running${NC}"

# Stop Backend
echo -e "\n${YELLOW}Stopping Backend...${NC}"
pkill -f "uvicorn src.main:app" && echo -e "${GREEN}✓ Backend stopped${NC}" || echo -e "${RED}✗ Backend not running${NC}"

# Stop Redis
echo -e "\n${YELLOW}Stopping Redis...${NC}"
redis-cli shutdown 2>/dev/null && echo -e "${GREEN}✓ Redis stopped${NC}" || echo -e "${RED}✗ Redis not running${NC}"

# Stop Docker services
echo -e "\n${YELLOW}Stopping Docker services...${NC}"
docker-compose down && echo -e "${GREEN}✓ Docker services stopped${NC}" || echo -e "${YELLOW}! No Docker services running${NC}"

echo -e "\n${GREEN}All services stopped!${NC}"
