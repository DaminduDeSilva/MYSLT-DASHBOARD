# 🚀 MySLT Dashboard - Quick Reference Card

## ⚡ Quick Start (2 Commands)

### Start Backend:
```powershell
cd Server; npm start
```
**Runs at**: http://localhost:5000

### Start Frontend:
```powershell
cd client; npm run dev
```
**Runs at**: http://localhost:5173

---

## 📡 API Endpoints Quick Reference

| Endpoint | What It Does |
|----------|-------------|
| `GET /api/dashboard/stats` | Dashboard metrics & KPIs |
| `GET /api/dashboard/api-list` | All 126 APIs (A01-A126) |
| `GET /api/dashboard/response-times` | API response analytics |
| `GET /api/dashboard/success-rates` | Success rate statistics |
| `GET /api/dashboard/live-traffic` | Real-time traffic data |
| `GET /api/dashboard/api-details` | Paginated API table |
| `GET /api/server-health` | All 3 servers status |
| `GET /api/server-health/:ip` | Single server health |
| `POST /api/server-health/initialize` | Setup server data |
| `GET /health` | Backend health check |

---

## 🗂️ File Locations

| What | Where |
|------|-------|
| Backend Code | `Server/src/` |
| Frontend Code | `client/src/` |
| API Mappings | `Server/src/config/apiMapping.js` |
| Models | `Server/src/models/` |
| Controllers | `Server/src/controllers/` |
| Frontend API Service | `client/src/services/api.ts` |
| Log File | `Server/filtered-log.txt` |
| Backend .env | `Server/.env` |
| Frontend .env | `client/.env` |

---

## 🎯 Key Features

✅ **126 API Mappings** (A01-A126)  
✅ **3 Server Monitoring** (172.25.37.16/21/138)  
✅ **Real-time Updates** (30s auto-refresh)  
✅ **Advanced Filtering** (API, customer, date, server)  
✅ **MongoDB Atlas** (cloud database)  
✅ **Full TypeScript** frontend  
✅ **REST API** backend  

---

## 🔧 Essential Commands

### Backend:
```powershell
cd Server
npm install          # Install dependencies
npm start            # Start server
npm run dev          # Start with nodemon
npm run import-logs  # Import filtered-log.txt
```

### Frontend:
```powershell
cd client
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
```

### Test Backend:
```powershell
# Health check
curl http://localhost:5000/health

# Get API list
Invoke-RestMethod http://localhost:5000/api/dashboard/api-list

# Get stats
Invoke-RestMethod http://localhost:5000/api/dashboard/stats

# Initialize servers
Invoke-RestMethod -Uri http://localhost:5000/api/server-health/initialize -Method POST
```

---

## 📊 Dashboard Pages

1. **Dashboard** (`/dashboard`)
   - Metrics cards (6)
   - Charts (5)
   - Filters (7 fields)

2. **Servers** (`/servers`)
   - 3 server cards
   - CPU/RAM/Disk metrics
   - Network charts
   - Uptime display

3. **API Details** (`/api-details`)
   - API table
   - Pagination
   - Success rates
   - Response times

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 in use | Kill process: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force` |
| MongoDB error | Check internet, verify .env |
| Frontend can't connect | Start backend first |
| No data in dashboard | Initialize server health |
| Filters empty | Check backend is running |
| Charts not loading | Hard refresh (Ctrl+F5) |

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Backend API | http://localhost:5000 |
| Backend Health | http://localhost:5000/health |
| API List | http://localhost:5000/api/dashboard/api-list |
| Server Health | http://localhost:5000/api/server-health |
| Frontend | http://localhost:5173 |
| Dashboard | http://localhost:5173/dashboard |
| Servers | http://localhost:5173/servers |
| API Details | http://localhost:5173/api-details |

---

## 📦 Dependencies

### Backend:
- express (API framework)
- mongoose (MongoDB ODM)
- cors (cross-origin)
- dotenv (environment)
- morgan (logging)
- compression (response compression)

### Frontend:
- react (UI framework)
- typescript (type safety)
- vite (build tool)
- tailwindcss (styling)
- recharts (charts)
- lucide-react (icons)
- react-router-dom (routing)

---

## 🔐 Environment Variables

### Backend (Server/.env):
```env
MONGODB_URI=mongodb+srv://...
PORT=5000
NODE_ENV=development
LOG_FILE_PATH=./filtered-log.txt
```

### Frontend (client/.env):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📝 126 API Quick Reference

**Authentication**: A01-A10  
**Account Management**: A11-A17  
**Billing**: A14, A17, A21-A24, A28, A89-A90  
**Faults & Support**: A19-A20  
**Usage & Data**: A27, A39-A44, A51  
**Packages**: A45-A52, A62-A68, A71-A77  
**VAS Services**: A15, A53-A61, A78-A83  
**System**: A30-A31, A36-A38  
**Profile**: A11, A32, A69, A92  
**Advanced**: A49, A53-A54, A63, A85-A87  
**Broadband**: A71-A77, A88, A91, A93, A99, A104  
**Sales & Orders**: A26, A107-A126  

---

## ✅ Status Check

Backend: ✅ Running & Connected  
Frontend: ⏳ Run `npm run dev` in client/  
Database: ✅ MongoDB Atlas Connected  
APIs: ✅ All 11 endpoints working  
Filters: ✅ 126 APIs loaded  
Docs: ✅ Complete  

---

## 📚 Documentation Files

1. **README.md** - Main project overview
2. **Server/README.md** - Backend API docs
3. **SETUP_GUIDE.md** - Step-by-step setup
4. **PROJECT_SUMMARY.md** - Complete summary
5. **QUICK_REFERENCE.md** - This file

---

## 🎯 What to Do Now

1. ✅ Backend is running → Keep it running
2. 🚀 Start frontend → `cd client; npm run dev`
3. 🌐 Open browser → http://localhost:5173
4. 🎨 Test all features
5. 📊 (Optional) Import logs → `npm run import-logs`

---

**Everything is ready! Start the frontend and begin monitoring! 🎉**
