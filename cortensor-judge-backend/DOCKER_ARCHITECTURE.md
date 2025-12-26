# 📊 Docker Architecture & Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR COMPUTER                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Docker Desktop (orchestrator)                │ │
│  │                                                        │ │
│  │  ┌───────────────────────────────────────────────┐   │ │
│  │  │     cortensor-network (bridge network)        │   │ │
│  │  │                                               │   │ │
│  │  │  ┌──────────────┐  ┌──────────────────────┐  │   │ │
│  │  │  │  Sentinel    │  │   MongoDB            │  │   │ │
│  │  │  │  (Backend)   │→→│   (Data Store)       │  │   │ │
│  │  │  │              │  │                      │  │   │ │
│  │  │  │ Port 3001    │  │ Port 27017           │  │   │ │
│  │  │  │ Node.js App  │  │ Persistent Data      │  │   │ │
│  │  │  └──────────────┘  └──────────────────────┘  │   │ │
│  │  │           ↓                                    │   │ │
│  │  │  ┌──────────────────────────────────────┐    │   │ │
│  │  │  │   (Optional) Hardhat Blockchain      │    │   │ │
│  │  │  │   Port 8545                          │    │   │ │
│  │  │  │   Local Ethereum Node                │    │   │ │
│  │  │  └──────────────────────────────────────┘    │   │ │
│  │  │           ↓                                    │   │ │
│  │  │  ┌──────────────────────────────────────┐    │   │ │
│  │  │  │   (Optional) Redis Queue             │    │   │ │
│  │  │  │   Port 6379                          │    │   │ │
│  │  │  │   Job Processing                     │    │   │ │
│  │  │  └──────────────────────────────────────┘    │   │ │
│  │  │                                               │   │ │
│  │  └───────────────────────────────────────────────┘   │ │
│  │                                                        │ │
│  │  Volumes (Persistent Storage):                        │ │
│  │  • mongodb-data      (MongoDB database)               │ │
│  │  • redis-data        (Redis data)                     │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Service Communication

```
External Client (Your Browser/API)
        ↓ (port 3001)
┌──────────────────────┐
│  Sentinel Backend    │
│  (Node.js Express)   │
└──────────────────────┘
    ↓         ↓         ↓
    │         │         │
    ↓         ↓         ↓
 MongoDB   Hardhat    Redis
 (Port)    (8545)    (6379)
 27017              (Optional)
```

## Startup Sequence

```
Step 1: Start Docker Compose
        │
        ↓
┌──────────────────────┐
│ docker-compose up -d │
└──────────────────────┘
        │
        ├─────────────────────────────────────┐
        │                                     │
        ↓                                     ↓
   MongoDB Started              Sentinel Started
   (Initializing DB)       (Waits for MongoDB)
        │                         │
        ├─ Health Check ✓         ├─ Load .env ✓
        │                         ├─ Connect MongoDB ✓
        │                         ├─ Initialize Queue ✓
        │                         └─ Listen on :3001 ✓
        ↓
   Ready for Connections
```

## Data Flow: Dispute Processing

```
Frontend Request
        │
        ↓
┌─────────────────────┐
│  Sentinel Backend   │
│  /submit-dispute    │
└─────────────────────┘
        │
        ├─ Validate Request
        ├─ Store in MongoDB
        ├─ Add to Queue
        │
        ↓
┌─────────────────────┐
│   Queue Service     │
│   (In-Memory Mock)  │
└─────────────────────┘
        │
        ├─ Store in Map
        ├─ Monitor Challenge Window
        ├─ Process Challenges
        │
        ↓
┌─────────────────────┐
│   Blockchain Calls  │
│  (Hardhat/Network)  │
└─────────────────────┘
        │
        ↓
   Return Status
```

## Configuration Options

```
Default Configuration (Minimal)
┌─────────────────┬────────────────────┐
│   Service       │   Status           │
├─────────────────┼────────────────────┤
│   MongoDB       │   ✅ Running       │
│   Sentinel      │   ✅ Running       │
│   Hardhat       │   ❌ Not Started   │
│   Redis         │   ❌ Not Started   │
└─────────────────┴────────────────────┘

With --profile blockchain
┌─────────────────┬────────────────────┐
│   Service       │   Status           │
├─────────────────┼────────────────────┤
│   MongoDB       │   ✅ Running       │
│   Sentinel      │   ✅ Running       │
│   Hardhat       │   ✅ Running       │
│   Redis         │   ❌ Not Started   │
└─────────────────┴────────────────────┘

With --profile redis --profile blockchain
┌─────────────────┬────────────────────┐
│   Service       │   Status           │
├─────────────────┼────────────────────┤
│   MongoDB       │   ✅ Running       │
│   Sentinel      │   ✅ Running       │
│   Hardhat       │   ✅ Running       │
│   Redis         │   ✅ Running       │
└─────────────────┴────────────────────┘
```

## Port Mapping

```
Local Host          Docker Container
─────────────────────────────────────

localhost:3001  ←→  Sentinel:3001
  (Your API)        (Express Server)

localhost:27017 ←→  MongoDB:27017
  (Database)        (Mongo Service)

localhost:8545  ←→  Hardhat:8545
  (Blockchain)      (Ethereum Node)

localhost:6379  ←→  Redis:6379
  (Queue)           (Redis Server)
```

## Environment Variable Flow

```
┌──────────┐
│  .env    │
│  File    │
└──────────┘
     │
     ├─ BLOCKCHAIN_RPC_URL
     ├─ JUSTICE_CONTRACT_ADDRESS
     ├─ REPUTATION_REGISTRY_ADDRESS
     ├─ COR_TOKEN_ADDRESS
     ├─ VALIDATOR_PRIVATE_KEY
     ├─ MONGODB_URL
     ├─ PINECONE_API_KEY
     ├─ PINATA_API_KEY
     └─ JWT_SECRET
     │
     ↓
┌─────────────────────────────────┐
│  docker-compose.yml             │
│  (Inject into containers)       │
└─────────────────────────────────┘
     │
     ├─────────────────────────┬─────────────────────┐
     │                         │                     │
     ↓                         ↓                     ↓
  Sentinel              Hardhat              Redis
  Container            Container           Container
```

## Health Check Flow

```
Docker Daemon
     │
     ├─ Every 30 seconds
     │
     ├─ Check Sentinel
     │  GET /health
     │  ↓ Responds with {"status":"ok"}
     │  ✓ Healthy
     │
     ├─ Check MongoDB
     │  mongosh ping
     │  ↓ Responds with "ok"
     │  ✓ Healthy
     │
     └─ Check Hardhat
        curl http://localhost:8545
        ↓ Responds with 200
        ✓ Healthy
```

## Dependency Chain

```
Sentinel
   ↓
   depends_on
   ↓
MongoDB
   ↓
   must be healthy before
   ↓
Sentinel starts

(Hardhat is independent)
(Redis is independent)
```

## File Structure in Docker

```
Sentinel Container
├── /app/
│   ├── dist/
│   │   └── index.js (compiled backend)
│   ├── package.json
│   ├── node_modules/
│   └── ...
└── /sbin/dumb-init (signal handler)

MongoDB Container
├── /data/
│   └── db/
│       └── (database files - from volume)
└── ...

Hardhat Container
├── /app/
│   ├── contracts/
│   ├── artifacts/
│   ├── node_modules/
│   └── package.json
└── ...
```

## Volume Persistence

```
docker-compose down (stop containers)
     │
     └─ Volumes remain on disk
        │
        └─ mongodb-data/ (persistent)
        └─ redis-data/ (persistent)

docker-compose up -d (restart)
     │
     └─ Volumes remounted
        │
        └─ Data restored ✓

docker-compose down -v (stop + delete)
     │
     └─ Volumes deleted ❌
        │
        └─ Data lost (clean slate)
```

## Networking

```
┌──────────────────────────────┐
│  cortensor-network (bridge)  │
│                              │
│  172.20.0.1    (gateway)     │
│                              │
│  172.20.0.2    mongodb       │
│  172.20.0.3    sentinel      │
│  172.20.0.4    hardhat       │
│  172.20.0.5    redis         │
│                              │
│  Services can reach each     │
│  other by name (DNS):        │
│  - mongodb:27017             │
│  - sentinel:3001             │
│  - hardhat:8545              │
│  - redis:6379                │
│                              │
└──────────────────────────────┘
     │
     └─ Host can reach at localhost:PORT
```

## Build Process

```
docker-compose build
     │
     ├─ Read docker/Dockerfile
     │
     ├─ FROM node:20-alpine (builder stage)
     │  ├─ Copy package files
     │  ├─ npm ci (install)
     │  └─ npm run build (compile TS)
     │
     ├─ FROM node:20-alpine (production stage)
     │  ├─ Copy built artifacts
     │  ├─ Install dumb-init
     │  ├─ Create non-root user
     │  └─ Set healthcheck
     │
     └─ Result: Docker image ready to run
```

## Log Flow

```
Container Output
     │
     ├─ stdout  →→→  docker logs
     ├─ stderr  →→→  docker logs
     │
     ↓
docker-compose logs -f
     │
     └─ Real-time view of all services
```

## Command Execution Flow

```
docker-compose up -d
     │
     ├─ Parse docker-compose.yml
     ├─ Check Docker images (pull if needed)
     ├─ Create networks
     ├─ Create volumes
     ├─ Start containers
     ├─ Run health checks
     │
     ↓
Services Running ✓
```

---

This visual guide helps you understand how everything fits together!
