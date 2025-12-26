# 🚀 Quick Start: Local Blockchain Deployment

## Prerequisites
- Node.js 18+
- npm or yarn

## 3-Step Local Deployment

### Step 1: Start Local Blockchain (Terminal 1)
```bash
cd contracts
npm run hardhat:node
```

**Expected Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545
Accounts
========
Account #0: 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955 (balance: 10000 ETH)
...
```

### Step 2: Deploy Contracts (Terminal 2)
```bash
cd contracts
npm run hardhat:deploy
```

**Expected Output:**
```
✅ COR Token deployed at: 0x5FbDB2315678afccb333f8a9c6FCC1ea3EFAB49f
✅ Justice contract deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
✅ ReputationRegistry deployed at: 0x9fE46736679d2D9a65F0992F2272dE9f3c7FA6e0

📋 Add these to your .env file:
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
JUSTICE_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
REPUTATION_REGISTRY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7FA6e0
COR_TOKEN_ADDRESS=0x5FbDB2315678afccb333f8a9c6FCC1ea3EFAB49f
```

### Step 3: Update Backend .env (Terminal 3)
```bash
# Copy contract addresses to backend
cp contracts/deployments.json .
# Edit .env with JUSTICE_CONTRACT_ADDRESS, etc.
```

### Step 4: Start Backend (Terminal 4)
```bash
cd sentinel
npm run dev
```

**Expected Output:**
```
> cortensor-sentinel@1.0.0 dev
> tsx watch src/index.ts

✅ Sentinel service started on port 3001
Connected to blockchain at http://127.0.0.1:8545
Validator registered: 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
```

---

## ✅ Verify Everything Works

### Check Backend Health
```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": 1703000000000
}
```

### Test Challenge Flow
```bash
curl -X POST http://localhost:3001/test/generate-evidence \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is 2+2?"}'
```

---

## 🛠️ Useful Commands

```bash
# Compile contracts
npm run hardhat:compile

# Run tests
npm run hardhat:test

# View deployment info
cat deployments.json

# Access Hardhat console
npx hardhat console --network localhost

# Deploy to testnet
npm run hardhat:deploy:base-sepolia

# Deploy to mainnet (CAUTION!)
npm run hardhat:deploy:base
```

---

## 📚 Full Documentation

See `HARDHAT_LOCAL_DEPLOYMENT.md` for complete guide with:
- Detailed troubleshooting
- Testing workflows
- Advanced configuration
- Network setup

---

## Network Details

| Property | Value |
|----------|-------|
| RPC URL | http://127.0.0.1:8545 |
| Chain ID | 31337 |
| Available Accounts | 20 |
| Account Balance | 10,000 ETH each |
| Private Key | From mnemonic (deterministic) |

---

## What Gets Deployed

✅ **MockCORToken** - 1,000,000 COR tokens to deployer  
✅ **Justice** - Core dispute resolution contract  
✅ **ReputationRegistry** - Agent reputation tracking  
✅ **Validator** - Registered with 8000 initial reputation  
✅ **Bonds** - 1,000,000 COR approved for bonds  

---

## 🎯 Next Steps

1. Keep Hardhat node running (Terminal 1)
2. Keep Backend running (Terminal 4)
3. Test API endpoints (Terminal 5)
4. View `HARDHAT_LOCAL_DEPLOYMENT.md` for detailed workflows
5. Modify contracts and redeploy as needed

---

## 💡 Tips

- **Save Contract Addresses**: See `deployments.json` after deployment
- **Reset State**: Stop node and restart to reset blockchain
- **Test Accounts**: Use any of 20 test accounts from node output
- **Debug**: Enable `DEBUG=hardhat:*` for detailed output
- **Gas**: Monitor with `REPORT_GAS=true npm run hardhat:deploy`

---

**You're all set! Happy coding! 🚀**
