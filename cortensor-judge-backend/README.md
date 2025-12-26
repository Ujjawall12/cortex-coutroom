# The Cortensor Judge - Backend

A production-ready decentralized dispute resolution and safety layer for AI agents on the Cortensor Network.

## Overview

The Cortensor Judge transforms Cortensor from a simple "Inference Engine" into a **Verifiable Justice System** where every AI output can be challenged, tried, and settled on the blockchain.

### Key Features

- **Evidence Bundle Generation**: Creates immutable records of AI inference with logic traces
- **Adversarial Detection**: Uses cosine similarity to detect deviating miner outputs
- **PoUW Validation**: Implements Proof of Useful Work with deterministic policy testing
- **Smart Contract Integration**: Manages bonds, slashing, and reward distribution
- **ERC-8004 Agent Identity**: On-chain reputation tracking for miners and judges
- **IPFS Storage**: Permanent, immutable legal records via Pinata
- **Real-time Queue Management**: BullMQ for handling challenge windows and verdicts

## Project Structure

```
cortensor-judge-backend/
├── contracts/                    # Solidity smart contracts
│   ├── Justice.sol              # Core dispute resolution contract
│   ├── ReputationRegistry.sol    # ERC-8004 agent identity & reputation
│   ├── interfaces/
│   │   └── ICOR.sol            # COR token interface
│   ├── script/
│   │   └── Deploy.s.sol        # Foundry deployment script
│   └── foundry.toml            # Foundry configuration
│
├── sentinel/                     # NodeJS backend service
│   ├── src/
│   │   ├── index.ts            # Main entry point
│   │   ├── server.ts           # Express REST API
│   │   ├── config/
│   │   │   └── env.ts          # Environment configuration
│   │   ├── cortensor/
│   │   │   ├── router.ts       # Cortensor API client
│   │   │   └── validate.ts     # PoUW validator
│   │   ├── evidence/
│   │   │   ├── bundle.ts       # Evidence bundle management
│   │   │   └── ipfs.ts         # IPFS/Pinata integration
│   │   ├── similarity/
│   │   │   └── cosine.ts       # Cosine similarity analysis
│   │   ├── queue/
│   │   │   └── dispute.queue.ts # BullMQ queue management
│   │   ├── services/
│   │   │   ├── challenge.service.ts  # Challenge initiation
│   │   │   └── verdict.service.ts    # Verdict generation & submission
│   │   ├── web3/
│   │   │   └── justice.client.ts     # Blockchain interaction
│   │   └── types/
│   │       └── evidence.ts     # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
│
├── judge-sdk/                    # SDK for external developers
│   ├── src/
│   │   ├── index.ts            # SDK exports
│   │   ├── client.ts           # JudgeClient class
│   │   ├── submitEvidence.ts   # Evidence submission helper
│   │   └── challenge.ts        # Challenge creation helper
│   ├── package.json
│   └── tsconfig.json
│
├── docker/
│   ├── Dockerfile              # Container image definition
│   └── docker-compose.yml      # Multi-container orchestration
│
├── .env.example                 # Environment variable template
└── README.md                    # This file
```

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose (optional, for containerized deployment)
- **Redis** (included in docker-compose)
- **Foundry** (for smart contract deployment)

### Installation

1. **Clone and setup**:
```bash
cd cortensor-judge-backend
cp .env.example .env
# Edit .env with your configuration
npm install --workspaces
```

2. **Build smart contracts**:
```bash
cd contracts
forge build
```

3. **Deploy contracts**:
```bash
cd contracts
forge script script/Deploy.s.sol:DeployJudge --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
# Update .env with deployed contract addresses
```

4. **Build and run sentinel**:
```bash
cd sentinel
npm run build
npm run dev  # Development with hot reload
# or
npm start    # Production mode
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker/docker-compose.yml up -d

# Check logs
docker-compose -f docker/docker-compose.yml logs -f sentinel

# Stop services
docker-compose -f docker/docker-compose.yml down
```

## Configuration

### Environment Variables

See `.env.example` for all available configuration options. Key variables:

```bash
# Blockchain
BLOCKCHAIN_RPC_URL=https://mainnet.base.org
JUSTICE_CONTRACT_ADDRESS=0x...
VALIDATOR_PRIVATE_KEY=0x...
VALIDATOR_ADDRESS=0x...

# External Services
CORTENSOR_API_URL=https://api.cortensor.network
PINATA_API_KEY=...
PINECONE_API_KEY=...

# Judge Parameters
CHALLENGE_WINDOW_DURATION=300  # seconds
MIN_SIMILARITY_THRESHOLD=95    # 0-100
MIN_BOND_AMOUNT=100000000000000000  # wei
```

## API Documentation

### REST Endpoints

#### Challenge Management

**POST /challenge**
Initiate a challenge against suspicious output
```json
{
  "evidence": { /* EvidenceBundle */ },
  "bondAmount": "100000000000000000"
}
```

**POST /monitor**
Monitor for suspicious outputs
```json
{
  "prompt": "What is 2+2?",
  "threshold": 95
}
```

**POST /auto-challenge**
Automatically challenge if suspicious
```json
{
  "evidence": { /* EvidenceBundle */ },
  "minBond": "100000000000000000",
  "maxBond": "10000000000000000000"
}
```

#### Verdict Management

**POST /verdict/generate**
Generate verdict using PoUW validation
```json
{
  "disputeId": "1",
  "evidence": { /* EvidenceBundle */ },
  "minerOutput": "The answer is..."
}
```

**POST /verdict/submit**
Submit verdict to Justice contract
```json
{
  "disputeId": "1",
  "evidence": { /* EvidenceBundle */ },
  "verdict": "MINER_WRONG",
  "reasoning": "Qm..."
}
```

**POST /verdict/execute**
Execute full verdict workflow
```json
{
  "disputeId": "1",
  "evidence": { /* EvidenceBundle */ }
}
```

**POST /dispute/settle**
Settle dispute and execute rewards/slashes
```json
{
  "disputeId": "1"
}
```

#### Queries

**GET /dispute/:disputeId**
Get dispute details

**GET /miner/:minerAddress/trust-score**
Get miner trust score

**GET /queue/stats**
Get queue statistics

**GET /health**
Health check

### SDK Usage

```typescript
import { JudgeClient, EvidenceBundle } from 'cortensor-judge-sdk';

const client = new JudgeClient('http://localhost:3001');

// Submit evidence
const result = await client.submitEvidence(evidence, bondAmount);
console.log('Dispute ID:', result.disputeId);

// Monitor output
const monitoring = await client.monitorOutput(prompt, 0.95);
if (monitoring.isSuspicious) {
  // Auto-challenge
  const challenge = await client.autoChallenge(evidence, minBond, maxBond);
}

// Generate and submit verdict
const verdict = await client.generateVerdict(disputeId, evidence, output);
const submission = await client.submitVerdict(
  disputeId,
  evidence,
  verdict.verdict,
  verdict.reasoning
);

// Settle dispute
await client.settleDispute(disputeId);
```

## Smart Contracts

### Justice.sol

The core smart contract managing disputes, verdicts, and settlements.

**Key Functions**:
- `initiateChallenge(EvidenceBundle, uint256)` - Start a dispute
- `submitVerdict(uint256, VerdictType, string)` - Submit verdict as validator
- `settleDispute(uint256)` - Execute rewards/slashes
- `registerValidator(address, uint256)` - Register a validator node
- `registerAgentIdentity(string)` - Register ERC-8004 agent identity

**Events**:
- `DisputeInitiated` - New dispute created
- `VerdictSubmitted` - Verdict issued
- `DisputeSettled` - Dispute finalized with rewards/slashes
- `MinerSlashed` - Miner penalized
- `AgentIdentityRegistered` - Agent identity created

### ReputationRegistry.sol

Manages agent reputation and ERC-8004 agent identities.

**Features**:
- Track verdict history for miners and judges
- Calculate reputation scores (0-10000)
- Award badges (Trusted Miner, Elite Judge, Bounty Hunter, etc.)
- Update trust scores based on outcomes

## Architecture

### System Flow

1. **Evidence Bundle Generation**
   - Miner provides inference result + logic trace
   - PoI (Proof of Inference) signature included
   - Bundle pinned to IPFS via Pinata

2. **Challenge Initiation**
   - Sentinel monitors for deviations using cosine similarity
   - Challenger locks $COR bond in Justice contract
   - Dispute enters "Challenge Window" phase

3. **Validation (PoUW)**
   - High-reputation validators run deterministic policy tests
   - Outputs validated against safety/accuracy/consistency rules
   - Verdict generated based on validation score

4. **Settlement**
   - If miner wrong: Slashed and challenger rewarded
   - If miner correct: Challenger loses bond
   - Reputation scores updated
   - Transaction recorded on-chain

### Key Technologies

- **Blockchain**: Solidity, Foundry, ethers.js
- **Backend**: Node.js, Express, TypeScript
- **Queue Management**: BullMQ, Redis
- **Storage**: IPFS (Pinata), Vector DB (Pinecone)
- **AI Integration**: Cortensor Router API, LangChain
- **Containerization**: Docker, Docker Compose

## Testing

```bash
# Unit tests
npm run test

# Coverage report
npm run test:coverage

# Integration tests
npm run test:integration

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

## Monitoring

The Sentinel service includes:

- **Queue Metrics**: View dispute/verdict queue statistics
- **Health Checks**: Periodic health monitoring
- **Event Logging**: Detailed logs for all operations
- **Performance Monitoring**: Response times and throughput

Access metrics via:
```bash
GET /queue/stats
GET /health
```

## Deployment

### Production Checklist

- [ ] Set all required environment variables
- [ ] Deploy and verify smart contracts
- [ ] Configure Cortensor API credentials
- [ ] Set up Pinata IPFS account
- [ ] Configure Pinecone vector database
- [ ] Set appropriate challenge window duration (24 hours)
- [ ] Enable metrics and monitoring
- [ ] Set up logging aggregation
- [ ] Configure backup/recovery procedures
- [ ] Load test for expected throughput

### Scaling Considerations

- **Horizontal Scaling**: Run multiple Sentinel instances behind load balancer
- **Queue Optimization**: Adjust BullMQ concurrency based on resource availability
- **Caching**: Implement Redis caching for reputation queries
- **Database**: Consider using PostgreSQL for historical data instead of logs

## Security Considerations

1. **Private Keys**: Never commit private keys; use environment variables
2. **Bond Validation**: Always verify bond amounts before processing
3. **Signature Verification**: Validate all cryptographic proofs
4. **Rate Limiting**: Enable API rate limiting in production
5. **CORS**: Restrict CORS origins to trusted domains
6. **Access Control**: Implement role-based access for contract functions

## Troubleshooting

### Common Issues

**Redis Connection Failed**
```bash
# Ensure Redis is running
docker-compose -f docker/docker-compose.yml up redis
# Or verify Redis URL in .env
```

**Cortensor API Timeout**
```bash
# Check API endpoint and network connectivity
# Verify CORTENSOR_API_KEY is set
curl https://api.cortensor.network/health
```

**Smart Contract Calls Failing**
```bash
# Verify contract addresses in .env
# Check validator has sufficient $COR tokens
# Verify RPC endpoint is accessible
```

**IPFS Pinning Failed**
```bash
# Verify Pinata credentials
# Check Pinata account has available storage
# Verify internet connectivity
```

## Contributing

This is a core component of the Cortensor Judge system. For contributions:

1. Follow TypeScript strict mode guidelines
2. Add tests for new features
3. Update documentation
4. Submit PR with detailed description

## License

MIT

## Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Discord**: Join Cortensor community Discord

## Roadmap

### Phase 1 (Current)
- [x] Core Justice contract
- [x] Evidence bundling and IPFS storage
- [x] Cosine similarity detection
- [x] PoUW validation
- [x] Sentinel bot service

### Phase 2
- [ ] Advanced ML-based anomaly detection
- [ ] Multi-chain support (Arbitrum, Polygon)
- [ ] Governance token (DAO)
- [ ] Appeal mechanism
- [ ] Insurance pool for slashing

### Phase 3
- [ ] Quantum-resistant cryptography
- [ ] Zero-knowledge proof validation
- [ ] Cross-chain arbitration
- [ ] Real-time monitoring dashboard

## References

- [ERC-8004: Agent Identity](https://eips.ethereum.org/EIPS/eip-8004)
- [Cortensor Documentation](https://docs.cortensor.network)
- [Foundry Book](https://book.getfoundry.sh)
- [ethers.js Documentation](https://docs.ethers.org)
