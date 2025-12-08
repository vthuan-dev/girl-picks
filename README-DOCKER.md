# Docker Deployment Guide

Hướng dẫn deploy dự án Girl-Pick bằng Docker.

## Yêu cầu

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM trở lên
- 20GB disk space

## Cấu trúc

```
girl-pick/
├── backend/
│   ├── Dockerfile
│   └── ...
├── frontend/
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml          # Development
├── docker-compose.prod.yml     # Production
├── .env.example
└── deploy.sh
```

## Quick Start

### 1. Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env với các giá trị production
nano .env
```

### 2. Deploy

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Hoặc manual:

```bash
# Build và start services
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## Services

### Frontend (Next.js)
- Port: 3000
- URL: http://localhost:3000

### Backend (NestJS)
- Port: 3001
- URL: http://localhost:3001

### MySQL Database
- Port: 3306 (internal only in production)
- Database: `girlpick`
- User: `girlpick`

### Redis Cache
- Port: 6379 (internal only in production)
- Password: từ `.env`

## Commands

### View logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Stop services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Restart service
```bash
docker-compose -f docker-compose.prod.yml restart backend
```

### Execute commands in container
```bash
# Backend shell
docker-compose -f docker-compose.prod.yml exec backend sh

# Run Prisma commands
docker-compose -f docker-compose.prod.yml exec backend npx prisma studio
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate dev
```

### Update and redeploy
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations if needed
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## Production Setup

### 1. Update .env với production values

```env
MYSQL_ROOT_PASSWORD=strong-password-here
MYSQL_PASSWORD=strong-password-here
REDIS_PASSWORD=strong-password-here
JWT_SECRET=very-secure-secret-key-here
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 2. Setup Nginx Reverse Proxy (optional)

Tạo file `/etc/nginx/sites-available/girl-pick`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Setup SSL với Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

## Backup

### Database backup
```bash
docker-compose -f docker-compose.prod.yml exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} girlpick > backup-$(date +%Y%m%d).sql
```

### Restore database
```bash
docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} girlpick < backup-20231207.sql
```

## Troubleshooting

### Check service status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Check service health
```bash
docker-compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

### View resource usage
```bash
docker stats
```

### Clean up
```bash
# Remove containers and volumes
docker-compose -f docker-compose.prod.yml down -v

# Remove images
docker-compose -f docker-compose.prod.yml down --rmi all
```

## Development

Sử dụng `docker-compose.yml` cho development:

```bash
docker-compose up -d
```

Services sẽ expose ports và có hot-reload.

