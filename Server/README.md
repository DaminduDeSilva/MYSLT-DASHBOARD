# MySLT Monitoring Backend

Node.js + Express + MongoDB backend API for the MySLT Monitoring Dashboard.

## Features

- **API Log Analytics**: Parse and analyze application logs from filtered-log.txt
- **Real-time Monitoring**: Live traffic tracking and statistics
- **Server Health Monitoring**: Track CPU, RAM, disk, and network metrics
- **Filtering & Search**: Advanced filtering by API, customer, date, and server
- **126 API Endpoints**: Complete mapping of all MySLT API functions

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Middleware**: CORS, Morgan, Compression

## Setup Instructions

### 1. Install Dependencies

```powershell
cd Server
npm install
```

### 2. Environment Configuration

The `.env` file is already configured with MongoDB connection:

```env
MONGODB_URI=mongodb+srv://ominduviva840:VxS0ABaRAy6NOFwu@cluster0.dzsovn6.mongodb.net/myslt_monitoring?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
NODE_ENV=development
LOG_FILE_PATH=./filtered-log.txt
```

### 3. Import Log Data

Import the `filtered-log.txt` data into MongoDB:

```powershell
npm run import-logs
```

This will:
- Parse the log file (format: `startTimestamp,accessMethod,email,status,apiNumber,,endTimestamp,responseTime,serverId`)
- Import all records into MongoDB
- Create necessary indexes
- Display import statistics

### 4. Initialize Server Health Data

After importing logs, initialize server health data:

```powershell
# Start the server first
npm start

# Then in another terminal, call the initialization endpoint
curl -X POST http://localhost:5000/api/server-health/initialize
```

Or use PowerShell:
```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/server-health/initialize -Method POST
```

### 5. Start the Server

```powershell
npm start
```

For development with auto-reload:
```powershell
npm run dev
```

Server will start at: **http://localhost:5000**

## API Endpoints

### Dashboard Endpoints

- `GET /api/dashboard/stats` - Get dashboard KPIs and statistics
  - Query params: `apiNumber`, `customerEmail`, `dateFrom`, `dateTo`, `serverIdentifier`
  
- `GET /api/dashboard/response-times` - Get API response time analytics
  
- `GET /api/dashboard/success-rates` - Get API success rate statistics
  
- `GET /api/dashboard/live-traffic?minutes=30` - Get live traffic data (time series)
  
- `GET /api/dashboard/api-details` - Get paginated API details table
  - Query params: `page`, `limit`, `apiNumber`, `dateFrom`, `dateTo`
  
- `GET /api/dashboard/api-list` - Get all 126 API numbers and names

### Server Health Endpoints

- `GET /api/server-health` - Get all servers health status
  
- `GET /api/server-health/:ip` - Get specific server health by IP
  
- `POST /api/server-health/update` - Update server health metrics
  
- `POST /api/server-health/initialize` - Initialize server health data

### Health Check

- `GET /health` - API health check endpoint

## Database Schema

### ApiLog Collection
```javascript
{
  startTimestamp: String (indexed),
  accessMethod: String (MOBILE/WEB/CHATBOT, indexed),
  customerEmail: String (indexed),
  status: String (Information/Warning/Error, indexed),
  apiNumber: String (indexed),
  endTimestamp: String,
  responseTime: Number,
  serverIdentifier: String (indexed),
  date: Date (indexed)
}
```

### ServerHealth Collection
```javascript
{
  serverIp: String (unique),
  cpuUtilization: Number (0-100),
  ramUsage: Number (0-100),
  diskSpace: Number (0-100),
  networkTraffic: Number,
  uptime: String,
  status: String (healthy/warning/critical),
  lastUpdated: Date
}
```

## Log File Format

The `filtered-log.txt` file should contain comma-separated values:

```
63895996993756,MOBILE,xxxxxx@gmail.com,Information,A41,,63895996993991,234,16
```

Fields:
1. Start Timestamp (milliseconds)
2. Access Method (MOBILE/WEB/CHATBOT)
3. Customer Email
4. Status (Information/Warning/Error)
5. API Number (A01-A126)
6. Empty field
7. End Timestamp
8. Response Time (ms)
9. Server Identifier (16/21/138)

## API Mapping

The backend includes complete mapping of all 126 APIs from A01 to A126:
- A01: Register
- A02: Login
- A03: Terminate User
- ... (see `src/config/apiMapping.js` for complete list)

## Project Structure

```
Server/
├── src/
│   ├── config/
│   │   ├── apiMapping.js      # 126 API number to name mappings
│   │   └── database.js         # MongoDB connection
│   ├── controllers/
│   │   ├── dashboardController.js    # Dashboard API logic
│   │   └── serverHealthController.js # Server health logic
│   ├── models/
│   │   ├── ApiLog.js           # API log schema
│   │   └── ServerHealth.js     # Server health schema
│   ├── routes/
│   │   ├── dashboard.js        # Dashboard routes
│   │   └── serverHealth.js     # Server health routes
│   ├── utils/
│   │   └── importLogs.js       # Log file parser and importer
│   └── server.js               # Main application entry
├── .env                        # Environment variables
├── filtered-log.txt            # Application log file
└── package.json
```

## Troubleshooting

### MongoDB Connection Issues
- Verify the MongoDB URI in `.env`
- Check network connectivity
- Ensure IP is whitelisted in MongoDB Atlas

### Import Fails
- Verify `filtered-log.txt` exists in Server folder
- Check file format matches expected structure
- Ensure sufficient disk space

### CORS Issues
- Backend includes CORS middleware for all origins
- Frontend should connect to `http://localhost:5000/api`

## Development Notes

- Uses ES Modules (`"type": "module"` in package.json)
- Indexes created automatically on first import
- Batch processing for efficient log import
- Auto-refresh recommended: 30 seconds

## Production Considerations

- Set `NODE_ENV=production`
- Use PM2 or similar for process management
- Set up log rotation for application logs
- Configure proper MongoDB backup strategy
- Add authentication middleware for sensitive endpoints
- Rate limiting for public endpoints
