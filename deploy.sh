#!/bin/bash

# Deploy script for Girl-Pick project
set -e

echo "=========================================="
echo "Girl-Pick Docker Deployment Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}Please update .env file with your production values!${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo -e "${YELLOW}Step 1: Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down || true

echo -e "${YELLOW}Step 2: Building images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

echo -e "${YELLOW}Step 3: Starting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

echo -e "${YELLOW}Step 4: Waiting for services to be healthy...${NC}"
sleep 10

echo -e "${YELLOW}Step 5: Generating Prisma Client...${NC}"
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma generate

echo -e "${YELLOW}Step 6: Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy || echo "Migrations may have already been applied"

echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Services:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:3001"
echo "  - MySQL:    localhost:3306"
echo "  - Redis:    localhost:6379"
echo ""
echo "To view logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "To stop services:"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""

