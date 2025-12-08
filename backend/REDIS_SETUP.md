# Redis Cache Setup Guide

## Cài đặt Redis

### Windows
1. Download Redis for Windows từ: https://github.com/microsoftarchive/redis/releases
   Hoặc sử dụng WSL2 với Redis
   
2. Hoặc sử dụng Docker:
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

### Linux/Mac
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# Mac
brew install redis

# Start Redis
redis-server
```

## Cấu hình Environment Variables

Thêm vào file `.env` của backend:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional, leave empty if no password
```

## Kiểm tra Redis hoạt động

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

## Cache Strategy

### Cached Endpoints:
- `GET /girls` - List of girls (cached 5-10 minutes)
- `GET /girls/:id` - Girl details (cached 10 minutes)

### Cache Invalidation:
- Cache tự động invalidate khi:
  - Create new girl
  - Update girl
  - Delete girl
  - Update images

### Cache Keys:
- `girls:list:{page}:{limit}:{filters...}` - List cache
- `girls:detail:{idOrSlug}` - Detail cache

## Performance Benefits

- **First request**: Fetches from database (~200-500ms)
- **Cached requests**: Returns from Redis (~1-5ms)
- **Improvement**: 50-100x faster response time

## Monitoring

Để xem cache statistics, bạn có thể sử dụng Redis CLI:

```bash
redis-cli
> INFO stats
> KEYS girls:*
```

## Troubleshooting

Nếu Redis không kết nối được:
1. Kiểm tra Redis đang chạy: `redis-cli ping`
2. Kiểm tra host/port trong `.env`
3. Kiểm tra firewall settings
4. Backend sẽ fallback về database nếu Redis không available (nhưng sẽ chậm hơn)

