# External APIs & Integrations Required

## Quick Setup Guide

To run the Cortensor Judge Backend successfully, you'll need to set up the following external services:

---

## 1. 🔗 Blockchain RPC Endpoint (REQUIRED)

**Purpose**: Connect to blockchain networks to deploy and interact with smart contracts

### Options:

#### Option A: Public RPC (Free, for development)
- **Base Sepolia** (Testnet): https://sepolia.base.org
- **Base Mainnet**: https://mainnet.base.org
- **Arbitrum Sepolia** (Testnet): https://sepolia-rollup.arbitrum.io
- **Arbitrum Mainnet**: https://arb1.arbitrum.io/rpc

#### Option B: Private RPC (Better performance)
- **Infura** (https://infura.io) - Free tier available
- **Alchemy** (https://www.alchemy.com) - Free tier available
- **Thirdweb** (https://thirdweb.com) - Free tier available

### Setup:
```env
BLOCKCHAIN_RPC_URL=https://mainnet.base.org
# or for local development:
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
```

---

## 2. 📦 IPFS Storage - Pinata (OPTIONAL but RECOMMENDED)

**Purpose**: Store evidence bundles permanently on IPFS

### Website: https://www.pinata.cloud

### Setup Steps:
1. Sign up at https://www.pinata.cloud
2. Go to "API Keys" section
3. Create a new API key
4. Copy your **API Key** and **API Secret**

### Configuration:
```env
PINATA_API_KEY=your_api_key_here
PINATA_API_SECRET=your_api_secret_here
PINATA_GATEWAY_URL=https://gateway.pinata.cloud
USE_MOCK_IPFS=true  # Set to true if you want to use mock IPFS for testing
```

### For Development:
```env
USE_MOCK_IPFS=true  # Skip Pinata, use in-memory mock instead
```

---

## 3. 🎯 Vector Database - Pinecone (OPTIONAL)

**Purpose**: Store and query vector embeddings for similarity detection

### Website: https://www.pinecone.io

### Setup Steps:
1. Sign up at https://www.pinecone.io
2. Create a new index (e.g., "cortensor-judge")
3. Go to API Keys section
4. Copy your **API Key**

### Configuration:
```env
PINECONE_API_KEY=your_api_key_here
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=cortensor-judge
```

### For Development:
```env
PINECONE_API_KEY=test-key  # Will use mock embeddings
```

---

## 4. 🤖 Cortensor Network API (OPTIONAL)

**Purpose**: Validate AI outputs using Cortensor network's inference endpoints

### Website: https://cortensor.network (if available)

### Configuration:
```env
CORTENSOR_API_URL=https://api.cortensor.network
CORTENSOR_API_KEY=your_api_key_here
```

### For Development:
```env
CORTENSOR_API_URL=http://localhost:3000  # Local mock server
CORTENSOR_API_KEY=test-key
```

---

## 5. 🗄️ Redis (REQUIRED for Queue System)

**Purpose**: Job queue management for dispute processing

### Local Installation Options:

#### Option A: Docker (Recommended)
```bash
docker run -d -p 6379:6379 --name cortensor-redis redis:7-alpine
```

#### Option B: Direct Installation
- **Windows**: Download from https://github.com/microsoftarchive/redis/releases
- **Mac**: `brew install redis`
- **Linux**: `sudo apt install redis-server`

#### Option C: Cloud Redis
- **Redis Cloud** (https://redis.com/try-free/) - Free tier available
- **Upstash** (https://upstash.com) - Serverless Redis

### Configuration:
```env
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Verify Redis is running:
```bash
redis-cli ping  # Should return "PONG"
```

---

## ⚙️ Environment Setup Template

Create `.env` file in `cortensor-judge-backend/` directory:

```env
# ==================== Server Configuration ====================
PORT=3001
NODE_ENV=development

# ==================== Blockchain (REQUIRED) ====================
BLOCKCHAIN_RPC_URL=https://mainnet.base.org
JUSTICE_CONTRACT_ADDRESS=0x... # Set after deploying contracts
REPUTATION_REGISTRY_ADDRESS=0x... # Set after deploying contracts
COR_TOKEN_ADDRESS=0x... # COR token address on your chain
VALIDATOR_PRIVATE_KEY=0x... # Your validator wallet private key
VALIDATOR_ADDRESS=0x... # Your validator wallet address
NETWORK=base

# ==================== Cortensor API (Optional) ====================
CORTENSOR_API_URL=https://api.cortensor.network
CORTENSOR_API_KEY=your_key_or_test_key

# ==================== Vector DB - Pinecone (Optional) ====================
PINECONE_API_KEY=your_key_or_test_key
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=cortensor-judge

# ==================== IPFS - Pinata (Optional) ====================
PINATA_API_KEY=your_key_or_test_key
PINATA_API_SECRET=your_secret_or_test_secret
PINATA_GATEWAY_URL=https://gateway.pinata.cloud
USE_MOCK_IPFS=true  # Set to false after setting up Pinata

# ==================== Redis (REQUIRED) ====================
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# ==================== Judge Parameters ====================
MIN_SIMILARITY_THRESHOLD=0.75
MIN_BOND_AMOUNT=1000
MAX_BOND_AMOUNT=1000000
CHALLENGE_WINDOW_DURATION=3600
VALIDATOR_REGISTRATION_BOND=50000

# ==================== Monitoring ====================
LOG_LEVEL=info
METRICS_ENABLED=true
```

---

## 🚀 Minimal Setup (Development)

**Fastest way to run locally:**

### Required:
1. ✅ Redis (local or Docker)
2. ✅ Blockchain RPC (use public endpoint)

### Optional (with mocks):
- IPFS: `USE_MOCK_IPFS=true`
- Pinecone: Use test key
- Cortensor: Use mock endpoint

### Quick Start:
```bash
# 1. Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# 2. Create .env with minimal config
cp .env.example .env
# Edit .env and set:
# - BLOCKCHAIN_RPC_URL (required)
# - REDIS_URL (required)
# - Others can use defaults/mocks

# 3. Run backend
npm run dev -w sentinel
```

---

## 🏗️ Full Production Setup

For production deployment, set up:

1. ✅ **Blockchain RPC**: Dedicated Infura/Alchemy endpoint
2. ✅ **Redis**: Upstash or Redis Cloud
3. ✅ **Pinata**: Full setup for evidence storage
4. ✅ **Pinecone**: Production index
5. ✅ **Cortensor API**: Production endpoint
6. ✅ **Smart Contracts**: Deployed on mainnet
7. ✅ **Monitoring**: Prometheus/Grafana

---

## 📋 Checklist

### To Run Backend:
- [ ] Blockchain RPC URL obtained
- [ ] Redis instance running
- [ ] `.env` file created with required variables
- [ ] Dependencies installed: `npm install --workspaces`
- [ ] Backend started: `npm run dev -w sentinel`

### To Deploy Smart Contracts:
- [ ] Deployed Justice.sol
- [ ] Deployed ReputationRegistry.sol
- [ ] Contract addresses added to `.env`
- [ ] Validator registered on Justice contract

### For Full Functionality:
- [ ] Pinata IPFS API key (optional, use mock for dev)
- [ ] Pinecone API key (optional, use mock for dev)
- [ ] Cortensor API endpoint (optional, use mock for dev)

---

## 🔐 Security Notes

**IMPORTANT:**
- ❌ NEVER commit `.env` file to version control
- ❌ NEVER share your private keys publicly
- ❌ Use testnet keys for development, mainnet keys only for production
- ❌ Rotate API keys if exposed
- ✅ Store secrets in secure vault (AWS Secrets Manager, HashiCorp Vault)
- ✅ Use environment-specific configurations

---

## 🆘 Troubleshooting

### "Missing required environment variable: BLOCKCHAIN_RPC_URL"
**Solution**: Add `BLOCKCHAIN_RPC_URL` to `.env` file

### "Cannot connect to Redis"
**Solution**: 
1. Verify Redis is running: `redis-cli ping`
2. Check `REDIS_URL` in `.env`
3. Start Redis: `docker run -d -p 6379:6379 redis:7-alpine`

### "Pinata API key invalid"
**Solution**: 
1. Verify key format in Pinata dashboard
2. Or use `USE_MOCK_IPFS=true` for development

### "RPC endpoint rate limited"
**Solution**: 
1. Use dedicated RPC from Infura/Alchemy
2. Or use local test network

---

## 📞 Support

Need help setting up?
- Check `.env.example` for all available options
- See `README.md` for detailed documentation
- Check `DEPLOYMENT.md` for production setup

---

## Next Steps

1. **Setup Redis** (local or cloud)
2. **Get blockchain RPC** endpoint
3. **Create `.env`** file with configuration
4. **Start backend**: `npm run dev -w sentinel`
5. **Deploy contracts** (see DEPLOYMENT.md)
6. **Test endpoints**: `curl http://localhost:3001/health`

