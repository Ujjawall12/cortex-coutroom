# Docker Setup Guide

## Prerequisites
- Docker Desktop installed ✅
- Docker Compose (included with Docker Desktop)
- All environment variables set in `.env`

## Quick Start

### 1. Local Development (No Redis, No Blockchain)
```bash
# Start only MongoDB + Sentinel Backend
docker-compose up -d mongodb sentinel

# View logs
docker-compose logs -f sentinel

# Stop services
docker-compose down
```

### 2. With Local Blockchain (Hardhat)
```bash
# Start with blockchain service
docker-compose --profile blockchain up -d

# This will start:
# - MongoDB (required)
# - Hardhat Node (blockchain)
# - Sentinel (backend service)
```

### 3. Full Stack (with Redis for production)
```bash
# Start all services including Redis
docker-compose --profile redis --profile blockchain up -d

# This will start:
# - Redis
# - MongoDB
# - Hardhat Node
# - Sentinel
```

## Service Details

| Service | Port | Purpose | Required | Profile |
|---------|------|---------|----------|---------|
| MongoDB | 27017 | Data persistence | ✅ Yes | - |
| Sentinel | 3001 | Backend API | ✅ Yes | - |
| Hardhat | 8545 | Local blockchain | Optional | `blockchain` |
| Redis | 6379 | Queue system | Optional | `redis` |

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f sentinel
docker-compose logs -f mongodb
docker-compose logs -f hardhat
```

### Manage Services
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart sentinel

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

### Access Services
```bash
# MongoDB shell
docker-compose exec mongodb mongosh admin -u admin -p password123

# Sentinel logs in real-time
docker-compose logs -f sentinel

# Check service status
docker-compose ps
```

## Environment Variables

The docker-compose.yml uses variables from your `.env` file:

```env
# Blockchain
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
JUSTICE_CONTRACT_ADDRESS=0x...
REPUTATION_REGISTRY_ADDRESS=0x...
COR_TOKEN_ADDRESS=0x...
VALIDATOR_PRIVATE_KEY=0x...
VALIDATOR_ADDRESS=0x...

# Database
MONGODB_URL=mongodb://admin:password123@mongodb:27017/cortensor_judge?authSource=admin

# APIs
CORTENSOR_API_URL=...
CORTENSOR_API_KEY=...
PINECONE_API_KEY=...
PINATA_API_KEY=...
JWT_SECRET=...
```

## Data Persistence

Docker volumes are used to persist data:

- `mongodb-data`: MongoDB database files
- `redis-data`: Redis data (only with redis profile)

To see volume sizes:
```bash
docker volume ls
docker volume inspect cortensor-judge-backend_mongodb-data
```

## Troubleshooting

### MongoDB Connection Issues
```bash
# Verify MongoDB is running
docker-compose logs mongodb

# Check connection from host
docker run --rm mongo:7.0-alpine mongosh mongodb://admin:password123@host.docker.internal:27017 --quiet

# Reset MongoDB
docker-compose down -v
docker-compose up -d mongodb
```

### Hardhat Node Issues
```bash
# Verify hardhat is running
docker-compose logs hardhat

# Check if port 8545 is in use
netstat -ano | findstr :8545  # Windows
lsof -i :8545                   # Mac/Linux
```

### Sentinel Connection Issues
```bash
# Check sentinel logs
docker-compose logs -f sentinel

# Verify all dependencies are up
docker-compose ps

# Restart sentinel
docker-compose restart sentinel
```

## Development Workflow

### Option 1: Local with Docker Services Only
```bash
# Start MongoDB in Docker
docker-compose up -d mongodb

# Run Sentinel locally
npm run dev:sentinel

# Run Hardhat locally
npm run hardhat:node
```

### Option 2: Full Docker Stack
```bash
# Start everything
docker-compose up -d

# Sentinel is running in container on port 3001
curl http://localhost:3001/health
```

### Option 3: Mixed Development
```bash
# Run services you want to debug locally, rest in Docker
docker-compose up -d mongodb redis

# Run Sentinel in VS Code debugger (connects to MongoDB in Docker)
npm run dev:sentinel
```

## Building Custom Images

### Update Dockerfile
The default Dockerfile is in `docker/Dockerfile`. To rebuild after changes:

```bash
docker-compose build sentinel --no-cache
docker-compose up -d sentinel
```

### Push to Registry
```bash
# Build with registry tag
docker build -t your-registry/cortensor-sentinel:latest -f docker/Dockerfile .

# Push to registry
docker push your-registry/cortensor-sentinel:latest
```

## Performance Tips

1. **Use named volumes** for database persistence (already configured)
2. **Set resource limits** in docker-compose.yml if needed:
   ```yaml
   services:
     sentinel:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```
3. **Use Docker BuildKit** for faster builds:
   ```bash
   DOCKER_BUILDKIT=1 docker-compose build
   ```

## Cleanup

```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -f

# Remove unused volumes
docker volume prune -f

# Full cleanup (WARNING: removes everything)
docker system prune -a --volumes
```

## Next Steps

1. Copy `.env` to root directory
2. Update `BLOCKCHAIN_RPC_URL` to `http://hardhat:8545` if using Hardhat in Docker
3. Run `docker-compose up -d` with appropriate profiles
4. Test with `curl http://localhost:3001/health`
