# 🚀 MySLT Monitoring Dashboard - Complete Setup Guide

## ✅ What Has Been Built

### Backend (Node.js + Express + MongoDB)
✅ Complete REST API with 12 endpoints  
✅ MongoDB Atlas integration with connection string  
✅ 126 API mappings (A01-A126) with full function names  
✅ Log file parser for filtered-log.txt import  
✅ Dashboard statistics and analytics  
✅ Server health monitoring system  
✅ CORS enabled for frontend communication  
✅ Auto-indexing for efficient queries  

### Frontend (React + TypeScript + Vite)
✅ Updated FilterSection with all 126 APIs  
✅ API service layer for backend communication  
✅ MetricCards fetching real-time data  
✅ SystemHealth page connected to backend  
✅ Auto-refresh every 30 seconds  
✅ Filter change event handling  
✅ Loading states and error handling  

### Documentation
✅ Main README with complete project overview  
✅ Backend README with detailed API docs  
✅ PowerShell setup script  
✅ Environment configuration files  

## 📋 Step-by-Step Setup Instructions

### STEP 1: Backend Setup (5 minutes)

1. **Open PowerShell in the project root**

2. **Navigate to Server folder:**
   ```powershell
   cd Server
   ```

3. **Install dependencies:**
   ```powershell
   npm install
   ```
   This installs: express, mongoose, cors, morgan, compression, dotenv

4. **Start the backend server:**
   ```powershell
   npm start
   ```
   
   You should see:
   ```
   🚀 MySLT Monitoring API Server
   📡 Environment: development
   🌐 Server running on: http://localhost:5000
   💚 Health check: http://localhost:5000/health
   MongoDB Connected: ac-pyyltjq-shard-00-00.dzsovn6.mongodb.net
   Database: myslt_monitoring
   ```

5. **Initialize server health data** (in a NEW PowerShell window):
   ```powershell
   Invoke-RestMethod -Uri http://localhost:5000/api/server-health/initialize -Method POST
   ```
   
   This creates data for the 3 servers:
   - 172.25.37.16
   - 172.25.37.21
   - 172.25.37.138

6. **OPTIONAL: Import log data** (takes several minutes due to large file):
   ```powershell
   npm run import-logs
   ```
   
   This parses `filtered-log.txt` (>50MB) and imports into MongoDB.
   You'll see progress updates every 10,000 lines.

   ⚠️ **Note**: You can skip this step for now and test with the initialized server health data. The dashboard will show "0" for some metrics until logs are imported.

### STEP 2: Frontend Setup (3 minutes)

1. **Open a NEW PowerShell window** (keep backend running)

2. **Navigate to client folder:**
   ```powershell
   cd client
   ```

3. **Install dependencies** (if not already installed):
   ```powershell
   npm install
   ```

4. **Start the frontend dev server:**
   ```powershell
   npm run dev
   ```
   
   You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

5. **Open your browser:**
   Navigate to: **http://localhost:5173**

### STEP 3: Verify Everything Works

1. **Check Backend Health:**
   Open: http://localhost:5000/health
   
   Should return:
   ```json
   {
     "success": true,
     "message": "MySLT Monitoring API is running",
     "timestamp": "2025-11-11T..."
   }
   ```

2. **Check API List:**
   Open: http://localhost:5000/api/dashboard/api-list
   
   Should return all 126 APIs (A01-A126)

3. **Check Server Health:**
   Open: http://localhost:5000/api/server-health
   
   Should return data for 3 servers

4. **Test Frontend:**
   - Open http://localhost:5173
   - Click "Show Filters" button
   - API Number dropdown should show A01, A02, A03... A126
   - API Name dropdown should show all function names
   - Navigate to "Servers" tab - should show 3 server cards
   - Navigate to "API Details" tab - should show API table

## 🎯 Quick Test Commands

### Test Backend APIs:

**Get Dashboard Stats:**
```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/dashboard/stats | ConvertTo-Json -Depth 5
```

**Get API List (first 5):**
```powershell
(Invoke-RestMethod -Uri http://localhost:5000/api/dashboard/api-list).data | Select-Object -First 5
```

**Get Server Health:**
```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/server-health | ConvertTo-Json -Depth 3
```

**Get Response Times:**
```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/dashboard/response-times | ConvertTo-Json -Depth 3
```

## 📊 What Each Page Shows

### Dashboard Page (http://localhost:5173/dashboard)
- **Metric Cards**: 
  - Total Active Customers
  - Total Traffic Count
  - Live Traffic (real-time)
  - Requests per server (3 cards)
- **Charts**:
  - Response Type Distribution
  - Access Method Distribution
  - API Average Response Time
  - Live Traffic Monitor
  - API-wise Success Rate

### Servers Page (http://localhost:5173/servers)
- **3 Server Cards** showing:
  - IP Address
  - CPU Utilization (%)
  - RAM Usage (%)
  - Disk Space (%)
  - Network Traffic chart
  - System Uptime

### API Details Page (http://localhost:5173/api-details)
- **Table** with columns:
  - API ID (A01-A126)
  - Method
  - Path (function name)
  - Success Rate
  - Avg Response Time
  - Request Count

## 🔍 Filter Usage

1. Click "Show Filters" on Dashboard page
2. Select from dropdowns:
   - **API Number**: A01, A02, ... A126
   - **API Name**: Register, Login, BonusData, etc.
   - **Customer Number**: Enter email/customer ID
   - **Date**: Pick a date
   - **Time**: Pick a time
   - **Auto Refresh**: 30s, 1m, 5m, or Off
3. Click "Apply Filters"
4. Dashboard updates with filtered data

## 🎨 Features Implemented

### Backend Features:
✅ Complete CRUD API for logs and server health  
✅ Advanced filtering by API, customer, date, server  
✅ Aggregation pipelines for analytics  
✅ Batch import of large log files  
✅ Automatic indexing for performance  
✅ Error handling and logging  
✅ CORS support for frontend  

### Frontend Features:
✅ Real-time data fetching from backend  
✅ Auto-refresh every 30 seconds  
✅ Dynamic API filter with 126 options  
✅ Loading states  
✅ Responsive design  
✅ Interactive charts  
✅ Three-page navigation  

## 🛠️ Troubleshooting

### Backend Issues:

**Problem**: "Port 5000 already in use"
**Solution**: 
```powershell
# Find process using port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess
# Kill it
Stop-Process -Id <ProcessId> -Force
```

**Problem**: "MongoDB connection failed"
**Solution**: 
- Check internet connection
- Verify .env file has correct MONGODB_URI
- MongoDB Atlas IP whitelist should allow your IP

**Problem**: "filtered-log.txt not found"
**Solution**: 
- Verify file exists in Server/ folder
- Check file path in .env (LOG_FILE_PATH=./filtered-log.txt)

### Frontend Issues:

**Problem**: "Cannot connect to API"
**Solution**: 
- Verify backend is running on port 5000
- Check http://localhost:5000/health in browser
- Verify client/.env has VITE_API_URL=http://localhost:5000/api

**Problem**: "Filters show no APIs"
**Solution**: 
- Check browser console for errors
- Verify backend /api/dashboard/api-list returns data
- Hard refresh browser (Ctrl+F5)

**Problem**: "Metrics show 0"
**Solution**: 
- This is normal if logs haven't been imported yet
- Run `npm run import-logs` in Server folder
- Wait for import to complete (shows progress)

## 📈 Next Steps

1. ✅ Backend and frontend are connected
2. ⏳ Import log data (optional, but recommended for full features)
3. 🎨 Customize dashboard styling if needed
4. 🚀 Deploy to production when ready

## 🎯 Production Deployment

### Backend:
1. Set `NODE_ENV=production` in .env
2. Use PM2: `pm2 start src/server.js --name myslt-api`
3. Set up Nginx reverse proxy
4. Configure SSL certificates
5. Set up MongoDB backup schedule

### Frontend:
1. Build: `npm run build` (creates dist/ folder)
2. Serve with Nginx or similar
3. Update API_BASE_URL to production backend URL

## 📞 Support

If you encounter issues:
1. Check console logs (both backend terminal and browser console)
2. Verify all dependencies are installed
3. Ensure both servers are running
4. Test API endpoints individually
5. Check MongoDB connection

## 🎉 Completion Status

✅ **Backend API**: 100% Complete  
✅ **Frontend Integration**: 100% Complete  
✅ **API Mappings**: 126/126 (100%)  
✅ **Database Models**: Complete  
✅ **Documentation**: Complete  
✅ **Testing**: Server running and responding  

**You're all set! 🚀**

The MySLT Monitoring Dashboard is ready to use. Start both servers and begin monitoring!
