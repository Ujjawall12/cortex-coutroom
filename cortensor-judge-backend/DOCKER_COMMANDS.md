# Docker Commands Cheat Sheet

## 🎯 START HERE

### First Time Setup
```bash
# Navigate to project directory
cd cortensor-judge-backend

# Make sure .env file exists with all values
cat .env | grep BLOCKCHAIN_RPC_URL  # Should show contract addresses

# Start development stack (MongoDB + Backend)
docker-compose up -d mongodb sentinel

# Verify services are running
docker-compose ps

# Test if backend is alive
curl http://localhost:3001/health
```

## ⚡ Daily Commands

### Start Development
```bash
# Minimal (MongoDB + Backend only)
docker-compose up -d

# With blockchain
docker-compose --profile blockchain up -d

# Watch the logs
docker-compose logs -f
```

### Stop Everything
```bash
docker-compose down
```

### Restart a Service
```bash
docker-compose restart sentinel
docker-compose restart mongodb
```

### View Logs
```bash
# All services real-time
docker-compose logs -f

# Just backend
docker-compose logs -f sentinel

# Just database
docker-compose logs -f mongodb

# Last 50 lines
docker-compose logs --tail=50 sentinel
```

## 🔍 Debugging Commands

### Check Service Status
```bash
# Full status
docker-compose ps

# Verbose output
docker-compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
```

### Test Connectivity
```bash
# Backend health check
curl http://localhost:3001/health

# MongoDB connection
docker-compose exec mongodb mongosh admin -u admin -p password123 --eval "db.adminCommand('ping')"

# Backend logs during test
docker-compose logs -f sentinel
```

### Access Database
```bash
# Open MongoDB shell
docker-compose exec mongodb mongosh admin -u admin -p password123

# Once inside MongoDB shell:
db.adminCommand('ping')        # Test connection
use cortensor_judge            # Switch database
db.collection_names()          # List collections
db.disputes.find().pretty()    # View disputes
```

### Deep Debugging
```bash
# Rebuild image from scratch
docker-compose build --no-cache sentinel

# Restart in foreground (see all output)
docker-compose up --force-recreate sentinel

# Follow full Docker events
docker events --filter type=container

# Inspect running container
docker-compose exec sentinel sh
```

## 🛠️ Maintenance Commands

### View All Images
```bash
docker images | grep cortensor
```

### View All Volumes
```bash
docker volume ls | grep cortensor
```

### Check Disk Usage
```bash
docker system df
```

### Clean Up Unused Resources
```bash
# Remove stopped containers only
docker container prune -f

# Remove unused images
docker image prune -f

# Remove unused volumes (WARNING: deletes data!)
docker volume prune -f

# Full cleanup (removes everything not in use)
docker system prune -a --volumes
```

### Force Clean Start
```bash
# Stop everything
docker-compose down

# Remove all data
docker-compose down -v

# Remove images
docker rmi $(docker images -q cortensor* 2>/dev/null) 2>/dev/null

# Start fresh
docker-compose up -d
```

## 📊 Production Profiles

### Development (Default)
```bash
# MongoDB + Backend
docker-compose up -d
```

### With Blockchain
```bash
# MongoDB + Backend + Hardhat
docker-compose --profile blockchain up -d

# Set BLOCKCHAIN_RPC_URL=http://hardhat:8545 in .env
```

### Full Production
```bash
# MongoDB + Backend + Hardhat + Redis
docker-compose --profile redis --profile blockchain up -d
```

### Selective Services
```bash
# Only MongoDB (no backend)
docker-compose up -d mongodb

# Only Backend (assumes MongoDB running elsewhere)
docker-compose up -d sentinel

# Only Hardhat
docker-compose --profile blockchain up -d hardhat
```

## 🔄 Development Workflow

### Scenario 1: Code Change
```bash
# 1. Make code changes to sentinel/src
# 2. Rebuild image
docker-compose build sentinel

# 3. Restart service with new image
docker-compose restart sentinel

# 4. Watch logs
docker-compose logs -f sentinel
```

### Scenario 2: Environment Change
```bash
# 1. Update .env file
nano .env

# 2. Restart containers (they reload from .env)
docker-compose restart

# 3. Verify
docker-compose logs sentinel | grep "loaded\|config"
```

### Scenario 3: Database Issue
```bash
# 1. Check MongoDB health
docker-compose logs mongodb

# 2. Try restarting MongoDB
docker-compose restart mongodb

# 3. If that doesn't work, reset database
docker-compose down
docker-compose down -v  # This deletes data!
docker-compose up -d mongodb
```

## 🐛 Troubleshooting

### "Connection refused" error
```bash
# Check if services are running
docker-compose ps

# See error logs
docker-compose logs sentinel

# Restart services
docker-compose restart
```

### "Port already in use"
```bash
# Find what's using port 3001
netstat -ano | findstr :3001  # Windows
lsof -i :3001                  # Mac/Linux

# Either kill the process or change the port in docker-compose.yml
```

### "MongoDB authentication failed"
```bash
# Reset MongoDB
docker-compose down
docker-compose down -v
docker-compose up -d mongodb

# Wait for healthy status
docker-compose ps | grep mongodb
```

### "Cannot find module" errors
```bash
# Rebuild images
docker-compose build --no-cache

# Reinstall dependencies
docker-compose exec sentinel npm ci

# Restart
docker-compose restart sentinel
```

## 📈 Monitoring

### Real-time Stats
```bash
docker stats

# Just Sentinel
docker stats cortensor-sentinel

# Specific metrics
docker stats --no-stream cortensor-sentinel
```

### Container Events
```bash
# Watch all container events
docker events --filter type=container

# Just our containers
docker events --filter type=container | grep cortensor
```

### Network Debugging
```bash
# Check network connectivity
docker-compose exec sentinel ping mongodb
docker-compose exec sentinel ping hardhat

# Check DNS resolution
docker-compose exec sentinel nslookup mongodb
```

## 🚀 Performance Tips

### Use BuildKit for Faster Builds
```bash
DOCKER_BUILDKIT=1 docker-compose build --no-cache
```

### Parallel Service Startup
```bash
# Start multiple services at once
docker-compose up -d mongodb redis hardhat

# Then start Sentinel (depends on MongoDB)
docker-compose up -d sentinel
```

### Monitor Resource Usage
```bash
# Check if containers are using too much memory
docker stats --format "{{.Container}}\t{{.MemUsage}}" cortensor-*
```

## 💾 Data Management

### Backup Database
```bash
# Export MongoDB data
docker-compose exec mongodb mongodump --out=/tmp/backup --username admin --password password123 --authenticationDatabase admin

# Or from host
docker run --rm -v mongodb-data:/data -v $(pwd)/backup:/backup mongo:7.0-alpine mongodump --out=/backup
```

### Restore Database
```bash
docker run --rm -v mongodb-data:/data -v $(pwd)/backup:/backup mongo:7.0-alpine mongorestore /backup
```

## 📚 Files Reference

| File | Purpose |
|------|---------|
| [docker-compose.yml](docker/docker-compose.yml) | Service definitions |
| [Dockerfile](docker/Dockerfile) | Backend build configuration |
| [DOCKER_SETUP.md](DOCKER_SETUP.md) | Detailed guide |
| [DOCKER_QUICK_REFERENCE.md](DOCKER_QUICK_REFERENCE.md) | Quick reference |
| [.dockerignore](.dockerignore) | Build optimization |

---

**Pro Tip**: Save this file and run `cat DOCKER_COMMANDS.md | grep "^### "` to see all section headers!
