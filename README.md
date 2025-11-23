# MySLT Monitoring Dashboard

Full-stack monitoring platform for MySLT application logs and server health metrics.

![Dashboard](https://img.shields.io/badge/Status-Ready-green)
![Backend](https://img.shields.io/badge/Backend-Node.js-brightgreen)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Database](https://img.shields.io/badge/Database-MongoDB-success)

## 🎯 Overview

An integrated monitoring platform that provides:
- **Application Log Analytics** - Track 126 different API endpoints with real-time monitoring
- **Server Health Monitoring** - Monitor CPU, RAM, disk, and network for 3 production servers
- **Real-time Dashboards** - Live traffic, success rates, and response time analytics
- **Advanced Filtering** - Filter by API, customer, date range, and server

## 📊 Features

### Dashboard
- Live traffic monitoring with auto-refresh
- Total active customers count
- Request distribution by server (172.25.37.16, 172.25.37.21, 172.25.37.138)
- Access method distribution (Mobile, Web, Chatbot)
- Response type analysis (Information, Warning, Error)
- API response time analytics
- API success rate tracking

### Server Health
- Real-time CPU, RAM, and disk utilization
- Network traffic monitoring
- System uptime tracking
- Health status indicators (Healthy, Warning, Critical)

### API Details
- Complete list of 126 APIs (A01-A126)
- API-wise success rates
- Average response times
- Request count analytics

## 🏗️ Tech Stack

**Frontend** (`client/`): React 18 + TypeScript + Vite + Tailwind CSS + Recharts  
**Backend** (`Server/`): Node.js + Express + MongoDB Atlas + Mongoose

## 🚀 Quick Start

### Backend Setup

```powershell
cd Server
npm install
npm start
```

Server runs at: **http://localhost:5000**

To initialize server health data:
```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/server-health/initialize -Method POST
```

To import log data (optional, large file):
```powershell
npm run import-logs
```

### Frontend Setup

```powershell
cd client
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

## 📁 Project Structure

```
MYSLT-DASHBOARD/
├── client/              # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/  # UI components (FilterSection, MetricCards, etc.)
│   │   ├── pages/       # Dashboard, SystemHealth, ApiDetailsTable
│   │   ├── services/    # API service layer (api.ts)
│   │   └── App.tsx
│   └── package.json
├── Server/              # Node.js backend
│   ├── src/
│   │   ├── config/      # apiMapping.js (126 APIs), database.js
│   │   ├── controllers/ # dashboardController, serverHealthController
│   │   ├── models/      # ApiLog, ServerHealth schemas
│   │   ├── routes/      # API routes
│   │   ├── utils/       # importLogs.js (log parser)
│   │   └── server.js
│   ├── filtered-log.txt # Application logs (>50MB)
│   ├── .env            # MongoDB URI included
│   └── package.json
└── README.md           # This file
```

## 🔌 API Endpoints

**Dashboard APIs**
- `GET /api/dashboard/stats` - Dashboard KPIs and metrics
- `GET /api/dashboard/api-list` - All 126 API mappings
- `GET /api/dashboard/response-times` - Response time analytics
- `GET /api/dashboard/success-rates` - Success rate statistics
- `GET /api/dashboard/live-traffic` - Real-time traffic data
- `GET /api/dashboard/api-details` - Paginated API details

**Server Health APIs**
- `GET /api/server-health` - All servers status
- `GET /api/server-health/:ip` - Specific server health
- `POST /api/server-health/update` - Update server metrics
- `POST /api/server-health/initialize` - Initialize data

## 📊 126 API Mappings

The system tracks APIs from A01 to A126:
- A01: Register
- A02: Login
- A04: OTP Verification
- A41: BonusData
- A126: GetMovieList
- ... and 122 more

See `Server/src/config/apiMapping.js` for complete list.

## 📝 Log File Format

```
63895996993756,MOBILE,user@email.com,Information,A41,,63895996993991,234,16
```

Fields: StartTimestamp, AccessMethod, CustomerEmail, Status, ApiNumber, Empty, EndTimestamp, ResponseTime(ms), ServerId

## 🗄️ Database

**MongoDB Collections:**
- `apilogs` - Parsed application logs with indexes
- `serverhealths` - Server metrics (CPU, RAM, Disk, Network, Uptime)

## 🔧 Configuration

**Backend** (`.env` in Server/):
```env
MONGODB_URI=mongodb+srv://ominduviva840:VxS0ABaRAy6NOFwu@cluster0.dzsovn6.mongodb.net/myslt_monitoring
PORT=5000
NODE_ENV=development
```

**Frontend** (`.env` in client/):
```env
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

- **Backend won't start**: Check port 5000 availability, verify MongoDB connection
- **Frontend can't connect**: Ensure backend runs on port 5000, check CORS settings
- **Charts not loading**: Verify backend returns data, initialize server health
- **Log import slow**: Large file (>50MB), may take several minutes

## 📖 Documentation

- [Backend README](Server/README.md) - Detailed backend documentation with all endpoints
- [Setup Script](Server/setup.ps1) - Automated setup for Windows

## 🚀 Production Build

**Frontend:**
```powershell
cd client
npm run build
# Outputs to client/dist/
```

**Backend:**
Set `NODE_ENV=production`, use PM2 for process management

## 🎯 Status

✅ Backend API Complete | ✅ Frontend Connected | ✅ 126 APIs Mapped | ✅ MongoDB Integrated | ✅ Real-time Updates

---

Built with ❤️ for MySLT monitoring requirements
