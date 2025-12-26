# Cortensor Judge - Quick Reference

## Project Structure Overview

```
cortensor-judge-backend/
├── contracts/                  # Solidity Smart Contracts
│   ├── Justice.sol            # Core dispute resolution (700+ lines)
│   ├── ReputationRegistry.sol  # Agent reputation & ERC-8004 (500+ lines)
│   ├── interfaces/ICOR.sol    # COR token interface
│   └── script/Deploy.s.sol    # Foundry deployment script
│
├── sentinel/                   # Node.js Backend Service
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── server.ts          # Express REST API (500+ lines)
│   │   ├── config/env.ts      # Configuration loader
│   │   ├── cortensor/         # Cortensor integration
│   │   ├── evidence/          # Evidence bundle management
│   │   ├── similarity/        # Cosine similarity detection
│   │   ├── queue/             # BullMQ job queue
│   │   ├── services/          # Business logic services
│   │   ├── web3/              # Blockchain interaction
│   │   ├── monitoring/        # Metrics collection
│   │   └── types/             # TypeScript definitions
│   ├── package.json
│   └── tsconfig.json
│
├── judge-sdk/                  # SDK for External Developers
│   ├── src/
│   │   ├── index.ts           # SDK exports
│   │   ├── client.ts          # Main JudgeClient class
│   │   ├── submitEvidence.ts  # Evidence submission helper
│   │   └── challenge.ts       # Challenge helper
│   ├── package.json
│   └── tsconfig.json
│
├── docker/
│   ├── Dockerfile             # Multi-stage build
│   └── docker-compose.yml     # Full stack orchestration
│
├── Makefile                    # Convenient commands
├── package.json                # Monorepo root
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── README.md                   # Main documentation
├── DEPLOYMENT.md               # Production deployment guide
└── IMPLEMENTATION_SUMMARY.md   # This project summary
```

## Quick Commands

### Development
```bash
# Install dependencies
npm install --workspaces

# Start development server
npm run dev -w sentinel

# Build production bundles
npm run build --workspaces

# Run tests
npm test --workspaces

# Check types
npm run typecheck --workspaces

# Format code
npm run format --workspaces
```

### Smart Contracts
```bash
# Build contracts
cd contracts && forge build

# Deploy
forge script script/Deploy.s.sol:DeployJudge --rpc-url $RPC_URL --broadcast

# Verify
forge verify-contract $CONTRACT_ADDRESS Justice --constructor-args ...
```

### Docker
```bash
# Build image
docker build -f docker/Dockerfile -t cortensor-judge:latest .

# Start services
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f sentinel

# Stop services
docker-compose -f docker/docker-compose.yml down
```

### Using Make
```bash
make help         # See all available commands
make install      # Install dependencies
make dev          # Start development
make build        # Build production
make docker-up    # Start containers
make clean        # Clean artifacts
```

## Core Components

### Smart Contracts

**Justice.sol** - Main dispute resolution contract
- `initiateChallenge()` - Start a dispute
- `submitVerdict()` - Judge submits decision
- `settleDispute()` - Execute rewards/slashes
- Events: DisputeInitiated, VerdictSubmitted, DisputeSettled

**ReputationRegistry.sol** - Agent reputation system
- `registerAgent()` - Register miner/judge/challenger
- `recordVerdict()` - Track verdict outcomes
- Badge system for achievements
- Reputation score 0-10000

### Services

**ChallengeService** - Challenge initiation
- `initiateChallenge()` - Create dispute
- `monitorForSuspiciousOutputs()` - Detect deviations
- `autoChallengeIfSuspicious()` - Auto-flag bad outputs

**VerdictService** - Verdict generation & submission
- `generateVerdict()` - Create PoUW proof
- `submitVerdict()` - Send to contract
- `executeFullVerdictWorkflow()` - Complete flow
- `settleDispute()` - Finalize

**Web3/JusticeClient** - Blockchain interaction
- Contract method calls
- Event listening
- Token operations

### API Endpoints

**Challenges**
- `POST /challenge` - Initiate challenge
- `POST /monitor` - Check for suspicious outputs
- `POST /auto-challenge` - Auto-challenge if needed

**Verdicts**
- `POST /verdict/generate` - Generate verdict
- `POST /verdict/submit` - Submit verdict
- `POST /verdict/execute` - Full workflow
- `POST /dispute/settle` - Settle dispute

**Queries**
- `GET /dispute/:id` - Get dispute details
- `GET /miner/:address/trust-score` - Trust score
- `GET /queue/stats` - Queue statistics
- `GET /health` - Health check

## Configuration

### Key Environment Variables

```bash
# Blockchain
BLOCKCHAIN_RPC_URL=https://mainnet.base.org
JUSTICE_CONTRACT_ADDRESS=0x...
COR_TOKEN_ADDRESS=0x...
VALIDATOR_PRIVATE_KEY=0x...

# External Services
CORTENSOR_API_URL=https://api.cortensor.network
PINATA_API_KEY=...
PINECONE_API_KEY=...

# Judge Parameters
CHALLENGE_WINDOW_DURATION=300  # seconds
MIN_SIMILARITY_THRESHOLD=95    # 0-100
MIN_BOND_AMOUNT=100000000000000000  # wei
```

See `.env.example` for all 30+ variables.

## SDK Usage

```typescript
import { JudgeClient } from 'cortensor-judge-sdk';

const client = new JudgeClient('http://localhost:3001');

// Submit evidence
const result = await client.submitEvidence(evidence, bondAmount);

// Monitor for suspicious outputs
const monitoring = await client.monitorOutput(prompt);

// Generate verdict
const verdict = await client.generateVerdict(disputeId, evidence, output);

// Submit verdict
await client.submitVerdict(disputeId, evidence, verdict.verdict, reasoning);

// Settle dispute
await client.settleDispute(disputeId);
```

## System Flow

1. **Evidence Submission** → Miner provides output + logic trace
2. **Challenge Period** → 5 min (dev) or 24 hours (prod)
3. **Validator Review** → PoUW validation runs
4. **Verdict** → Contract decides winner
5. **Settlement** → Rewards/slashes executed

## Testing

```bash
# All tests
npm test --workspaces

# With coverage
npm run test:coverage --workspaces

# Specific package
npm test -w sentinel

# Watch mode
npm test -- --watch
```

## Monitoring

```bash
# Queue stats
curl http://localhost:3001/queue/stats

# Health check
curl http://localhost:3001/health

# Dispute details
curl http://localhost:3001/dispute/1

# Miner trust score
curl http://localhost:3001/miner/0x.../trust-score
```

## Troubleshooting

**Service won't start**
```bash
# Check environment variables
env | grep BLOCKCHAIN

# Check port availability
lsof -i :3001

# Check logs
docker-compose logs sentinel
```

**Database/Queue issues**
```bash
# Redis health
redis-cli ping

# Check queue depth
curl http://localhost:3001/queue/stats

# Restart Redis
docker-compose restart redis
```

**Smart contract issues**
```bash
# Verify connection
cast call $JUSTICE_ADDRESS "owner()"

# Check balance
cast balance $VALIDATOR_ADDRESS

# Get gas price
cast gas-price
```

## Performance Tips

- Increase Node.js heap: `NODE_OPTIONS="--max-old-space-size=4096"`
- Scale horizontally: Run multiple Sentinel instances
- Tune Redis: Adjust maxmemory and eviction policy
- Monitor metrics: Watch queue stats and error rates

## Security Checklist

- [ ] Private key stored in environment only
- [ ] CORS properly restricted
- [ ] Rate limiting enabled
- [ ] Bond amounts validated
- [ ] Signatures verified
- [ ] HTTPS enforced in production
- [ ] Logs don't expose secrets
- [ ] Validator node secured
- [ ] Backup procedures in place

## Key Files to Know

| File | Purpose |
|------|---------|
| `Justice.sol` | Main dispute contract (700 LOC) |
| `ReputationRegistry.sol` | Agent reputation (500 LOC) |
| `server.ts` | Express REST API (500 LOC) |
| `challenge.service.ts` | Challenge logic |
| `verdict.service.ts` | Verdict generation |
| `cosine.ts` | Similarity detection |
| `dispute.queue.ts` | BullMQ queue management |
| `.env.example` | All config variables |
| `docker-compose.yml` | Full stack setup |

## Important Numbers

- **Min Bond**: 0.1 $COR
- **Max Bond**: 10 $COR
- **Challenge Window**: 300 sec (dev) / 86400 sec (prod)
- **Similarity Threshold**: 95% (0-100)
- **Slash Percentage**: 20%
- **Challenger Reward**: 50% of slash
- **Default Trust Score**: 5000 (0-10000)

## Getting Help

1. Check README.md for detailed docs
2. See DEPLOYMENT.md for deployment issues
3. Review inline code comments
4. Check test files for examples
5. Enable DEBUG logging: `LOG_LEVEL=debug`

## Next Steps

1. **Deploy contracts** - Set up blockchain contracts
2. **Configure environment** - Edit .env with your values
3. **Start Sentinel** - `npm run dev` or `docker-compose up`
4. **Test workflow** - Use `/test/*` endpoints
5. **Monitor system** - Watch `/queue/stats` and `/health`

## Resources

- **Smart Contracts**: `contracts/Justice.sol` (700+ LOC)
- **Backend Service**: `sentinel/src/` (2800+ LOC)
- **SDK**: `judge-sdk/src/` (complete client)
- **Documentation**: README.md and DEPLOYMENT.md
- **Configuration**: `.env.example` with 30+ variables

---

For full details, see `README.md` and `DEPLOYMENT.md`
For implementation details, see `IMPLEMENTATION_SUMMARY.md`
