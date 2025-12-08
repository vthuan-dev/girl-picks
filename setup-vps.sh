#!/bin/bash

echo "=========================================="
echo "VPS Setup Script for Girl-Pick Project"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
apt-get update -y
apt-get upgrade -y

# Install Node.js 20.x
echo -e "${YELLOW}Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}Node.js installed: $(node -v)${NC}"
else
    echo -e "${GREEN}Node.js already installed: $(node -v)${NC}"
fi

# Install PM2
echo -e "${YELLOW}Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}PM2 installed${NC}"
else
    echo -e "${GREEN}PM2 already installed${NC}"
fi

# Install Nginx
echo -e "${YELLOW}Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl enable nginx
    systemctl start nginx
    echo -e "${GREEN}Nginx installed and started${NC}"
else
    echo -e "${GREEN}Nginx already installed${NC}"
fi

# Install Git
echo -e "${YELLOW}Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    apt-get install -y git
    echo -e "${GREEN}Git installed${NC}"
else
    echo -e "${GREEN}Git already installed: $(git --version)${NC}"
fi

# Install build tools
echo -e "${YELLOW}Installing build tools...${NC}"
apt-get install -y build-essential

# Install PostgreSQL (if needed)
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL not installed. Install? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        apt-get install -y postgresql postgresql-contrib
        systemctl enable postgresql
        systemctl start postgresql
        echo -e "${GREEN}PostgreSQL installed${NC}"
    fi
else
    echo -e "${GREEN}PostgreSQL already installed${NC}"
fi

# Install Redis (if needed)
echo -e "${YELLOW}Checking Redis...${NC}"
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}Redis not installed. Install? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        apt-get install -y redis-server
        systemctl enable redis-server
        systemctl start redis-server
        echo -e "${GREEN}Redis installed${NC}"
    fi
else
    echo -e "${GREEN}Redis already installed${NC}"
fi

# Setup firewall
echo -e "${YELLOW}Setting up firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    echo -e "${GREEN}Firewall configured${NC}"
fi

# Create app directory
echo -e "${YELLOW}Creating app directory...${NC}"
mkdir -p /var/www/girl-pick
echo -e "${GREEN}Directory created: /var/www/girl-pick${NC}"

# Display system info
echo ""
echo -e "${GREEN}=========================================="
echo "Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "System Information:"
echo "  OS: $(uname -a)"
echo "  Node.js: $(node -v)"
echo "  NPM: $(npm -v)"
echo "  PM2: $(pm2 -v)"
echo "  Nginx: $(nginx -v 2>&1)"
echo "  Git: $(git --version)"
echo ""
echo "Next steps:"
echo "  1. Clone your repository to /var/www/girl-pick"
echo "  2. Install dependencies: cd /var/www/girl-pick/backend && npm install"
echo "  3. Setup environment variables"
echo "  4. Run database migrations"
echo "  5. Start with PM2: pm2 start ecosystem.config.js"
echo ""

