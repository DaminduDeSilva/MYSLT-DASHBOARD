# MySLT Monitoring - Quick Setup Script
# Run this script to set up and test the backend

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 MySLT Monitoring Backend Setup" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
cd Server
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Check if server is already running
Write-Host "🔍 Step 2: Checking if server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET -ErrorAction SilentlyContinue
    Write-Host "✅ Server is already running!" -ForegroundColor Green
    $serverRunning = $true
} catch {
    Write-Host "⚠️  Server not running, will start it after setup" -ForegroundColor Yellow
    $serverRunning = $false
}
Write-Host ""

# Step 3: Initialize server health data
if ($serverRunning) {
    Write-Host "🏥 Step 3: Initializing server health data..." -ForegroundColor Yellow
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:5000/api/server-health/initialize" -Method POST
        Write-Host "✅ Server health data initialized" -ForegroundColor Green
        Write-Host "   Created $($result.data.Count) server records" -ForegroundColor Gray
    } catch {
        Write-Host "⚠️  Could not initialize server health (might already exist)" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Step 4: Instructions for importing logs
Write-Host "📊 Step 4: Log Data Import" -ForegroundColor Yellow
Write-Host "   To import the filtered-log.txt data into MongoDB:" -ForegroundColor Gray
Write-Host "   npm run import-logs" -ForegroundColor Cyan
Write-Host ""
Write-Host "   ⚠️  Note: The log file is very large (>50MB)" -ForegroundColor Yellow
Write-Host "   This may take several minutes to complete." -ForegroundColor Gray
Write-Host ""

# Step 5: Start server if not running
if (-not $serverRunning) {
    Write-Host "🚀 Step 5: Starting backend server..." -ForegroundColor Yellow
    Write-Host "   Server will start at: http://localhost:5000" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Press Ctrl+C to stop the server when done" -ForegroundColor Gray
    Write-Host ""
    npm start
} else {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "✨ Setup Complete!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📡 Backend API: http://localhost:5000" -ForegroundColor Cyan
    Write-Host "💚 Health Check: http://localhost:5000/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📚 Available API Endpoints:" -ForegroundColor Yellow
    Write-Host "   GET  /api/dashboard/stats" -ForegroundColor Gray
    Write-Host "   GET  /api/dashboard/api-list" -ForegroundColor Gray
    Write-Host "   GET  /api/dashboard/response-times" -ForegroundColor Gray
    Write-Host "   GET  /api/dashboard/success-rates" -ForegroundColor Gray
    Write-Host "   GET  /api/dashboard/live-traffic" -ForegroundColor Gray
    Write-Host "   GET  /api/dashboard/api-details" -ForegroundColor Gray
    Write-Host "   GET  /api/server-health" -ForegroundColor Gray
    Write-Host ""
}
