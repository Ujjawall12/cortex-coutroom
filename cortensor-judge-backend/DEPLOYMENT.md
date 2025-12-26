# Cortensor Judge - Deployment Guide

## Pre-Deployment Checklist

### 1. Smart Contracts

- [ ] Deploy Justice.sol to your blockchain (Base or Arbitrum)
- [ ] Deploy ReputationRegistry.sol
- [ ] Verify contracts on block explorer
- [ ] Save contract addresses for .env configuration
- [ ] Initialize Justice contract with COR token address
- [ ] Register initial validators

### 2. External Services

- [ ] Create Pinata account and generate API keys
- [ ] Create Pinecone account and vector database
- [ ] Get Cortensor API key
- [ ] Set up wallet with sufficient $COR tokens
- [ ] Generate validator private key

### 3. Infrastructure

- [ ] Ensure Node.js 18+ is installed
- [ ] Install and verify Docker/Docker Compose
- [ ] Set up Redis instance (or use Docker)
- [ ] Configure VPS/cloud infrastructure
- [ ] Set up monitoring/logging infrastructure

## Deployment Steps

### Step 1: Smart Contract Deployment

```bash
# Navigate to contracts directory
cd contracts

# Build contracts
forge build

# Set environment variables
export RPC_URL=https://mainnet.base.org
export PRIVATE_KEY=0x...
export ETHERSCAN_KEY=your_etherscan_api_key

# Deploy
forge script script/Deploy.s.sol:DeployJudge --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast --verify

# Save the output addresses
# JUSTICE_CONTRACT=0x...
# REPUTATION_REGISTRY=0x...
```

### Step 2: Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
# Minimum required:
BLOCKCHAIN_RPC_URL=https://mainnet.base.org
JUSTICE_CONTRACT_ADDRESS=0x...
REPUTATION_REGISTRY_ADDRESS=0x...
COR_TOKEN_ADDRESS=0x...
VALIDATOR_PRIVATE_KEY=0x...
VALIDATOR_ADDRESS=0x...

CORTENSOR_API_URL=https://api.cortensor.network
CORTENSOR_API_KEY=...

PINATA_API_KEY=...
PINATA_API_SECRET=...

PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=gcp-starter

# Production settings
CHALLENGE_WINDOW_DURATION=86400  # 24 hours
LOG_LEVEL=info
METRICS_ENABLED=true
```

### Step 3: Build Application

```bash
# Install dependencies
npm install --workspaces

# Build all packages
npm run build --workspaces

# Type check
npm run typecheck --workspaces
```

### Step 4: Docker Deployment

#### Option A: Docker Compose (Recommended)

```bash
# Navigate to docker directory
cd docker

# Update docker-compose.yml with your .env values
# or copy .env to this directory

# Build and start containers
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f sentinel

# View health
curl http://localhost:3001/health
```

#### Option B: Manual Docker

```bash
# Build image
docker build -f docker/Dockerfile -t cortensor-judge:1.0 .

# Run container
docker run -d \
  -p 3001:3001 \
  --name cortensor-sentinel \
  --env-file .env \
  -v $(pwd)/logs:/app/logs \
  cortensor-judge:1.0

# Check logs
docker logs -f cortensor-sentinel
```

### Step 5: Kubernetes Deployment (Optional)

```bash
# Create namespace
kubectl create namespace cortensor-judge

# Create ConfigMap for environment
kubectl create configmap sentinel-config --from-file=.env \
  -n cortensor-judge

# Create Secret for sensitive data
kubectl create secret generic sentinel-secrets \
  --from-literal=VALIDATOR_PRIVATE_KEY=$VALIDATOR_PRIVATE_KEY \
  --from-literal=PINATA_API_SECRET=$PINATA_API_SECRET \
  -n cortensor-judge

# Deploy
kubectl apply -f k8s/deployment.yaml -n cortensor-judge

# Verify
kubectl get pods -n cortensor-judge
```

### Step 6: Monitoring Setup

#### Prometheus & Grafana

```bash
# Create monitoring stack
docker-compose -f docker/monitoring.yml up -d

# Access Grafana
# http://localhost:3000
# Username: admin
# Password: admin
```

#### ELK Stack (Logs)

```bash
# Start ELK
docker-compose -f docker/elk.yml up -d

# Access Kibana
# http://localhost:5601
```

### Step 7: SSL/TLS Setup

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx configuration with certificates
# See nginx.conf.example

# Restart services
docker-compose restart sentinel
```

## Post-Deployment Verification

### 1. Health Checks

```bash
# Health endpoint
curl -X GET http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":1234567890}
```

### 2. Smart Contract Verification

```bash
# Check if contracts are registered
curl -X GET http://localhost:3001/health

# Verify validator is registered
cast call $JUSTICE_CONTRACT "isValidator(address)" $VALIDATOR_ADDRESS
```

### 3. Queue Status

```bash
# Check queue metrics
curl -X GET http://localhost:3001/queue/stats

# Expected response shows dispute, verdict, and challenge window queues
```

### 4. Test Challenge

```bash
# Generate test evidence
curl -X POST http://localhost:3001/test/generate-evidence \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is 2+2?"}'

# Initiate test challenge
curl -X POST http://localhost:3001/challenge \
  -H "Content-Type: application/json" \
  -d '{
    "evidence": {...},
    "bondAmount": "100000000000000000"
  }'
```

## Scaling & Performance

### Horizontal Scaling

```yaml
# docker-compose scale configuration
services:
  sentinel:
    deploy:
      replicas: 3  # Run 3 instances
    depends_on:
      - redis
      - nginx
      
  redis:
    # Shared Redis for all Sentinel instances
    
  nginx:
    # Load balance between Sentinel instances
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### Performance Tuning

```bash
# Increase Node.js event loop
export NODE_OPTIONS="--max-old-space-size=4096"

# Adjust BullMQ concurrency (in env)
# Sentinel/src will use QUEUE_CONCURRENCY setting

# Redis optimization
# Adjust maxmemory and eviction policy in Redis config
```

## Maintenance

### Regular Backups

```bash
# Backup Redis data
docker exec cortensor-redis redis-cli BGSAVE

# Copy backup
docker cp cortensor-redis:/data/dump.rdb ./backups/

# Backup logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/
```

### Log Rotation

```bash
# logrotate configuration
cat > /etc/logrotate.d/cortensor-judge << 'EOF'
/var/log/cortensor-judge/*.log {
  daily
  rotate 7
  compress
  delaycompress
  notifempty
  create 0640 www-data adm
  sharedscripts
}
EOF
```

### Health Monitoring

```bash
# Set up monitoring script
cat > scripts/health-check.sh << 'EOF'
#!/bin/bash
RESPONSE=$(curl -s http://localhost:3001/health)
if echo $RESPONSE | grep -q "ok"; then
  echo "✅ Sentinel is healthy"
  exit 0
else
  echo "❌ Sentinel health check failed"
  exit 1
fi
EOF

# Add to crontab
# */5 * * * * /path/to/health-check.sh
```

## Troubleshooting

### Sentinel Won't Start

```bash
# Check logs
docker logs cortensor-sentinel

# Verify environment variables
docker exec cortensor-sentinel env | grep BLOCKCHAIN

# Test RPC connection
curl -X POST $BLOCKCHAIN_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

### High Memory Usage

```bash
# Check process memory
docker stats cortensor-sentinel

# Reduce Redis memory
redis-cli CONFIG SET maxmemory 2gb

# Adjust Node.js GC
export NODE_OPTIONS="--trace-gc"
```

### Queue Bottleneck

```bash
# Monitor queue
curl http://localhost:3001/queue/stats

# If queue is backing up:
# 1. Increase QUEUE_CONCURRENCY
# 2. Scale to multiple instances
# 3. Check validator response times
# 4. Increase Redis resources
```

### Database Connection Issues

```bash
# Test Redis connection
docker exec cortensor-redis redis-cli ping

# Check connection pool
docker logs cortensor-sentinel | grep "Connection"

# Restart Redis
docker-compose restart redis
```

## Security Hardening

### 1. Network Security

```bash
# Only expose 3001 internally
docker network create cortensor-internal
docker-compose -f docker/docker-compose.yml up -d

# Use nginx reverse proxy with auth
# See nginx.conf.example
```

### 2. Secrets Management

```bash
# Use HashiCorp Vault
vault secrets enable -path=cortensor kv

# Or AWS Secrets Manager
aws secretsmanager create-secret --name cortensor-judge

# Update to read from secret backend
# Update config/env.ts to read from Vault/Secrets Manager
```

### 3. Private Key Protection

```bash
# Never expose private key in logs
# Use HSM or hardware wallet signer
# Consider using AWS KMS for key storage
```

## Rollback Procedure

```bash
# Keep previous Docker images tagged
docker tag cortensor-judge:1.0.1 cortensor-judge:1.0.1-backup

# Rollback to previous version
docker-compose down
docker image use cortensor-judge:1.0.0
docker-compose up -d

# Verify rollback
curl http://localhost:3001/health
```

## Production Checklist

- [ ] All environment variables configured
- [ ] Smart contracts deployed and verified
- [ ] SSL/TLS certificates installed
- [ ] Monitoring and alerting configured
- [ ] Backup procedures in place
- [ ] Disaster recovery plan documented
- [ ] Log aggregation working
- [ ] Performance baseline established
- [ ] Security audit completed
- [ ] Load testing passed
- [ ] SLA defined
- [ ] On-call procedures established
- [ ] Documentation complete
- [ ] Team training completed

## Support & Escalation

- **Critical Issues**: Immediate escalation to team lead
- **Performance Issues**: Check metrics and scale up if needed
- **Security Issues**: Isolate affected components immediately
- **Data Issues**: Use backup recovery procedures

For detailed logs and debugging, enable DEBUG level logging:
```bash
LOG_LEVEL=debug
```

For 24/7 monitoring, integrate with PagerDuty or similar incident management system.
