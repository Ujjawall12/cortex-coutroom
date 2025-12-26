# 🔗 Frontend Connection Setup Guide

## ✅ What Was Configured

1. **Blockchain Connection** - Added localhost network (Hardhat) to Wagmi config
2. **Backend API Client** - Created API service to connect to backend at `http://localhost:3001`
3. **Dependencies** - Installed axios for HTTP requests

## 📋 Quick Setup Commands

### 1. Install Dependencies (if not already done)
```powershell
cd cortex-court-case
npm install axios --legacy-peer-deps
```

### 2. Verify Backend is Running
```powershell
# Check if backend is accessible
curl http://localhost:3001/health
```

### 3. Verify Blockchain is Running
```powershell
# Check if Hardhat node is running
curl http://127.0.0.1:8545
```

### 4. Start Frontend
```powershell
cd cortex-court-case
npm run dev
```

## 🔧 Configuration Files Created

### 1. `src/config/wagmi.ts`
- ✅ Added localhost network (chainId: 31337)
- ✅ Configured to connect to `http://127.0.0.1:8545`

### 2. `src/config/api.ts`
- ✅ Backend API base URL: `http://localhost:3001`
- ✅ All API endpoints defined

### 3. `src/services/api.ts`
- ✅ Complete API client with all backend endpoints
- ✅ Error handling and logging

## 🌐 Connection Status

| Component | URL | Status |
|-----------|-----|--------|
| **Frontend** | http://localhost:8080 | ✅ Running |
| **Backend** | http://localhost:3001 | ✅ Should be running |
| **Blockchain** | http://127.0.0.1:8545 | ✅ Should be running |

## 🧪 Test Connections

### Test Backend Connection
```powershell
# In browser console or terminal
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

### Test Blockchain Connection
1. Open frontend: http://localhost:8080
2. Click "Connect Wallet" in navbar
3. Select "Localhost" network
4. Connect with MetaMask or another wallet

### Test API from Frontend
Open browser console and run:
```javascript
import { apiClient } from './services/api';
apiClient.healthCheck().then(console.log);
```

## 📝 Environment Variables (Optional)

Create `.env` file in `cortex-court-case/`:
```env
VITE_API_URL=http://localhost:3001
```

## 🚀 Next Steps

1. **Update Pages to Use Real API**
   - Replace `mockDisputes` with `apiClient.getDispute()`
   - Update `Cases.tsx` to fetch from backend
   - Update `Courtroom.tsx` to use real data

2. **Add Contract Addresses**
   - Get deployed contract addresses from backend
   - Add to frontend config for direct blockchain calls

3. **Test Full Flow**
   - Connect wallet to localhost network
   - Initiate a challenge
   - View dispute in frontend

## 🐛 Troubleshooting

### Backend not accessible?
- Check backend is running: `curl http://localhost:3001/health`
- Check CORS settings in backend
- Verify backend port is 3001

### Blockchain not connecting?
- Verify Hardhat node is running on port 8545
- Check MetaMask network settings
- Add localhost network manually in MetaMask:
  - Network Name: Localhost 8545
  - RPC URL: http://127.0.0.1:8545
  - Chain ID: 31337
  - Currency Symbol: ETH

### API calls failing?
- Check browser console for errors
- Verify backend is running
- Check network tab in browser dev tools

## ✅ Verification Checklist

- [ ] Backend running on port 3001
- [ ] Blockchain (Hardhat) running on port 8545
- [ ] Frontend running on port 8080
- [ ] axios installed
- [ ] Can connect wallet to localhost network
- [ ] Backend health check works
- [ ] API client can make requests

---

**All connections are now configured! 🎉**

