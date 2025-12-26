# Docker Quick Reference

## 🚀 Most Common Commands

### Start Development Environment
```bash
# Just MongoDB + Backend (recommended for local development)
docker-compose up -d mongodb sentinel

# Full stack with blockchain
docker-compose --profile blockchain up -d

# Everything including Redis
docker-compose --profile redis --profile blockchain up -d
```

### Check Status
```bash
docker-compose ps                    # See all services
docker-compose logs -f sentinel      # Watch backend logs
curl http://localhost:3001/health    # Test if backend is running
```

### Stop Everything
```bash
docker-compose down                  # Stop all containers
docker-compose down -v               # Stop + remove data (CAUTION!)
```

## 📊 Service Ports
| Service | Port | URL |
|---------|------|-----|
| Sentinel (Backend) | 3001 | http://localhost:3001 |
| MongoDB | 27017 | mongodb://admin:password123@localhost:27017 |
| Hardhat | 8545 | http://localhost:8545 |
| Redis | 6379 | redis://localhost:6379 |

## 🔍 Debugging

### View All Logs
```bash
docker-compose logs -f               # All services
docker-compose logs -f sentinel      # Just backend
docker-compose logs -f mongodb       # Just database
```

### Access MongoDB
```bash
docker-compose exec mongodb mongosh admin -u admin -p password123
```

### Restart Service
```bash
docker-compose restart sentinel      # Restart backend
docker-compose restart mongodb       # Restart database
```

## 🗑️ Cleanup

```bash
docker-compose down                  # Stop all
docker-compose down -v               # Stop + delete data
docker system prune -a --volumes     # Full cleanup
```

## ⚙️ Profiles Explained

- **No profile** = `mongodb` + `sentinel` (default, recommended)
- **blockchain** = Adds local Hardhat node on port 8545
- **redis** = Adds Redis for production queue management

## 🔧 Common Issues

**"Cannot connect to MongoDB"**
```bash
docker-compose restart mongodb
docker-compose logs mongodb
```

**"Port 3001 already in use"**
```bash
# Kill process using port 3001
netstat -ano | findstr :3001         # Windows
lsof -i :3001                        # Mac/Linux
```

**"Database data lost"**
- Volumes persist data even when containers stop
- Use `docker-compose down -v` only if you want to delete data

## 📝 Environment Setup

Before running Docker, ensure `.env` has:
```env
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
JUSTICE_CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
REPUTATION_REGISTRY_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
COR_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VALIDATOR_PRIVATE_KEY=0x...
VALIDATOR_ADDRESS=0x...
JWT_SECRET=...
```

All other variables loaded from `.env` automatically.

---

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for detailed documentation.
