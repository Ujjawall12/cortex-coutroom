# 🧪 Quick Test Commands

## Backend Health Check

### PowerShell (Recommended)
```powershell
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Browser
Simply open: **http://localhost:3001/health**

### Browser Console (F12)
```javascript
fetch('http://localhost:3001/health')
  .then(res => res.json())
  .then(data => console.log(data))
```

## Blockchain Health Check

### PowerShell
```powershell
$body = @{
    jsonrpc = "2.0"
    method = "eth_blockNumber"
    params = @()
    id = 1
} | ConvertTo-Json

Invoke-WebRequest -Uri http://127.0.0.1:8545 -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Browser Console
```javascript
fetch('http://127.0.0.1:8545', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_blockNumber',
    params: [],
    id: 1
  })
})
.then(res => res.json())
.then(data => console.log('Blockchain:', data))
```

## Frontend Test Page

Visit: **http://localhost:8080/test**

This page has buttons to test both backend and blockchain connections.

## All Endpoints Test

### Backend API Endpoints
```powershell
# Health
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing

# Queue Stats
Invoke-WebRequest -Uri http://localhost:3001/queue/stats -UseBasicParsing

# Get Dispute (replace DISPUTE_ID)
Invoke-WebRequest -Uri http://localhost:3001/dispute/DISPUTE_ID -UseBasicParsing
```

## Quick Status Check

```powershell
# Test all three services
Write-Host "Testing Backend..." -ForegroundColor Yellow
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing | Select-Object StatusCode, @{Name='Response';Expression={$_.Content}}

Write-Host "`nTesting Blockchain..." -ForegroundColor Yellow
$body = '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
Invoke-WebRequest -Uri http://127.0.0.1:8545 -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Select-Object StatusCode, @{Name='Response';Expression={$_.Content}}

Write-Host "`nFrontend should be at: http://localhost:8080" -ForegroundColor Green
```

