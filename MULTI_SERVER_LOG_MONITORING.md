# Multi-Server Log Monitoring - Complete Implementation Guide

This document provides a comprehensive overview of the multi-server log monitoring system implementation, including all steps taken, issues encountered, and solutions applied.

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Implementation Steps](#implementation-steps)
4. [Issues & Solutions](#issues--solutions)
5. [Setup Guide](#setup-guide)
6. [Verification](#verification)

---

## 🎯 System Overview

**Goal**: Monitor logs from multiple servers (Rocky Linux, Ubuntu, Windows) in real-time on a central dashboard.

**Key Requirements**:
- Resource-efficient (lightweight agents)
- Cross-platform compatibility
- Real-time monitoring with minimal delay
- Per-server filtering on the dashboard
- Robust handling of network interruptions

**Solution**: Agent-based architecture with batched log forwarding over HTTP.

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Remote Server  │
│  (.113, etc.)   │
│                 │
│  ┌───────────┐  │
│  │ Log Agent │──┼──┐
│  └───────────┘  │  │
│  ┌───────────┐  │  │
│  │ Simulator │  │  │  HTTP POST (batched)
│  │ (optional)│  │  │  /api/logs/ingest
│  └───────────┘  │  │
└─────────────────┘  │
                     │
                     ▼
         ┌─────────────────────┐
         │  Dashboard Server   │
         │  (192.168.100.137)  │
         │                     │
         │  ┌──────────────┐   │
         │  │ Backend API  │   │
         │  │ (Port 5001)  │   │
         │  └──────┬───────┘   │
         │         │           │
         │  ┌──────▼───────┐   │
         │  │   MongoDB    │   │
         │  └──────────────┘   │
         │                     │
         │  ┌──────────────┐   │
         │  │   Frontend   │   │
         │  │ (Port 9122)  │   │
         │  └──────────────┘   │
         └─────────────────────┘
```

---

## 📝 Implementation Steps

### Phase 1: Backend Development

#### 1.1 Log Ingestion API
**Files Created**:
- `Server/src/controllers/logController.js` - Handles batch log processing
- `Server/src/routes/logIngestion.js` - Defines `/api/logs/ingest` endpoint
- Updated `Server/src/server.js` - Registered the new route

**Key Features**:
- Accepts batched logs via POST request
- Parses CSV-formatted log lines
- Uses `ApiLog.insertMany()` for bulk insertion (high performance)
- Supports `serverIdentifier` for multi-server tracking

#### 1.2 Dashboard Controller Updates
**File Modified**: `Server/src/controllers/dashboardController.js`

**Changes**:
- Added `serverIdentifier` filter to all dashboard queries:
  - `getApiResponseTimes()`
  - `getApiSuccessRates()`
  - `getLiveTraffic()`
  - `getApiDetails()`

### Phase 2: Cross-Platform Agents

#### 2.1 Linux Agent
**File**: `Scripts/log-agent.sh`

**Features**:
- Uses `tail -F` for real-time log watching
- Batches logs (default: 50 lines)
- Sends via `curl` with JSON payload
- Configurable via environment variables
- Runs as systemd service

**Configuration**:
```bash
DASHBOARD_URL - API endpoint
SERVER_ID - Server identifier (use IP address)
LOG_FILE_PATH - Path to log file
BATCH_SIZE - Number of lines per batch
```

#### 2.2 Windows Agent
**File**: `Scripts/log-agent.ps1`

**Features**:
- Uses .NET `StreamReader` for efficient file watching
- Batches logs before sending
- Uses `Invoke-RestMethod` for HTTP requests
- Can run as Windows Scheduled Task

#### 2.3 Log Simulator
**File**: `Scripts/simulate-logs.sh`

**Purpose**: Generate mock logs for testing

**Resource Usage**:
- Generates 1 log every 10 seconds
- ~432 KB per day
- Negligible CPU/RAM impact

### Phase 3: Frontend Updates

#### 3.1 API Service Layer
**File**: `client/src/services/api.ts`

**Changes**:
- Added `serverIdentifier` parameter to all dashboard API calls
- Updated query string construction to include server filter

#### 3.2 Filter Section UI
**File**: `client/src/components/FilterSection.tsx`

**Changes**:
- Added "Dashboard Server" dropdown
- Fetches available servers from `serverRequests` data
- Passes selected server to all API calls
- Added `serverIdentifier` to filter state

### Phase 4: Deployment & CI/CD

#### 4.1 GitHub Actions Workflow
**File**: `.github/workflows/deploy.yml`

**Updates**:
- Fixed deployment IP from `124.43.216.136` to `124.43.216.137`
- Updated verification URLs to use IP instead of DNS (temporary)
- Maintained existing PM2 and Nginx configurations

---

## 🐛 Issues & Solutions

### Issue 1: Pipeline Deployment Failure
**Problem**: SSH connection timeout during deployment
```
dial tcp 124.43.216.136:9120: i/o timeout
```

**Root Cause**: Public IP changed from `.136` to `.137`, DNS not updated

**Solution**: 
- Updated `deploy.yml` to use new IP `124.43.216.137`
- Changed verification to use IP directly instead of DNS
- Commented out old DNS-based config for future restoration

**Files Changed**: `.github/workflows/deploy.yml`

---

### Issue 2: Agent Connection Failures
**Problem**: Agent showing `❌ Failed to send logs`

**Root Cause 1**: Wrong URL - using `https://124.43.216.137:9122` instead of `http://192.168.100.137:5001`

**Solution**:
- Updated `install-agent.sh` default URL to `http://124.43.216.137:5001`
- Later changed to internal IP `http://192.168.100.137:5001` for better reliability

**Root Cause 2**: NAT hairpinning not supported (public IP doesn't route back to internal network)

**Solution**: Use internal IP addresses for server-to-server communication

**Root Cause 3**: Firewall blocking port 5001

**Solution**:
```bash
sudo firewall-cmd --permanent --add-port=5001/tcp
sudo firewall-cmd --reload
```

---

### Issue 3: Backend Not Loading New Code
**Problem**: `/api/logs/ingest` returning 404 even after code was pushed

**Root Cause**: PM2 was running old code; new code in GitHub but not pulled to server

**Solution**:
```bash
git pull origin main
pm2 restart myslt-backend
```

**Prevention**: Ensure CI/CD pipeline completes successfully to auto-deploy

---

### Issue 4: Data in Database But Not on Dashboard
**Problem**: Agent successfully sending logs, but dashboard shows no data

**Root Cause**: Server identifier mismatch
- Agent was using hostname: `"localhost.localdomain"`
- Dashboard expected IP: `"192.168.100.113"`

**Solution**: Update agent service to use IP address as SERVER_ID
```bash
sudo nano /etc/systemd/system/log-agent.service
# Change: Environment="SERVER_ID=192.168.100.113"
sudo systemctl daemon-reload
sudo systemctl restart log-agent
```

**Verification**:
```bash
sudo systemctl cat log-agent | grep SERVER_ID
# Should show: Environment="SERVER_ID=192.168.100.113"
```

---

### Issue 5: Batch Size Not Updating
**Problem**: Changed `BATCH_SIZE` in script but agent still showed old value

**Root Cause**: Agent reads `BATCH_SIZE` from environment variable set in systemd service, not from script file

**Solution**: The `BATCH_SIZE` in the script is just a default. The actual value comes from the environment variable in the service file. To change it:
```bash
# Edit the service file
sudo nano /etc/systemd/system/log-agent.service
# Or use environment override
sudo systemctl edit log-agent
```

### Issue 6: Windows PowerShell Syntax/Encoding Errors
**Problem**: `install-agent.ps1` failing with `TerminatorExpectedAtEndOfString` or missing quote errors.

**Root Cause**: PowerShell parser issues caused by non-ASCII characters (emojis) or complex nested quoting in certain Windows environments/encodings.

**Solution**: 
- Replaced all emojis and decorative lines with plain ASCII text.
- Simplified string formatting to avoid complex interpolation.
- Ensured all scripts use standard UTF-8 without BOM or plain ASCII.

---

### Issue 7: Windows File Locking ("Process cannot access the file")
**Problem**: Simulator fails to write to the log file because the Agent is reading it.

**Root Cause**: Standard PowerShell `Add-Content` creates a write lock that conflicts with the Agent's read access.

**Solution**:
- Updated `simulate-logs.ps1` to use .NET `FileStream` with explicit `[System.IO.FileShare]::ReadWrite` permissions.
- This allows multiple processes to read and write to the same log file simultaneously without conflict.

---

## 🚀 Setup Guide

### Prerequisites
- Dashboard server running (192.168.100.137)
- Remote server with log file to monitor
- Network connectivity between servers
- Port 5001 open on dashboard server firewall

### Step 1: Transfer Scripts to Remote Server

**Option A - SCP** (from dashboard server):
```bash
scp -P 3501 -r /var/www/MYSLT-DASHBOARD/Scripts dpd@192.168.100.113:/home/dpd/
```

**Option B - Git** (on remote server):
```bash
git clone https://github.com/Omindu1015/MYSLT-DASHBOARD.git
cd MYSLT-DASHBOARD/Scripts
```

### Step 2: Install Agent on Remote Server

```bash
cd /home/dpd/Scripts
chmod +x install-agent.sh

# Install with simulator (for testing)
sudo ./install-agent.sh --with-simulator

# OR install for real log file
sudo ./install-agent.sh --path "/var/log/myapp.log"
```

### Step 3: Configure Server Identifier

**CRITICAL**: Use IP address, not hostname

```bash
sudo nano /etc/systemd/system/log-agent.service
```

Find and update:
```ini
Environment="SERVER_ID=192.168.100.113"
```

Reload and restart:
```bash
sudo systemctl daemon-reload
sudo systemctl restart log-agent
```

### Step 4: Verify Agent is Running

```bash
# Check status
sudo systemctl status log-agent

# Watch logs in real-time
sudo journalctl -u log-agent -f
```

You should see:
```
✅ Sent X lines.
```

### Step 5: Check Dashboard

1. Open browser: `https://124.43.216.137:9122`
2. Click on **Filter Section** (top dropdown)
3. Select **"Dashboard Server"** dropdown
4. Choose your server (e.g., `192.168.100.113`)
5. Charts should populate with data

---

## ✅ Verification Checklist

### On Remote Server:
- [ ] Agent service is running: `sudo systemctl status log-agent`
- [ ] No errors in logs: `sudo journalctl -u log-agent -n 50`
- [ ] Seeing success messages: `✅ Sent X lines`
- [ ] SERVER_ID is set to IP address (not hostname)
- [ ] Log file exists and is being updated

### On Dashboard Server:
- [ ] Backend is running: `pm2 status myslt-backend`
- [ ] Port 5001 is open: `sudo firewall-cmd --list-ports | grep 5001`
- [ ] Can curl the endpoint: `curl http://localhost:5001/health`
- [ ] Logs in database: Check MongoDB `apilogs` collection

### On Frontend:
- [ ] Server appears in "Dashboard Server" dropdown
- [ ] Charts show data when server is selected
- [ ] Live traffic updates in real-time
- [ ] Response times and success rates display correctly

---

## 📊 Performance & Resource Usage

### Agent Resource Usage:
- **CPU**: <1% (mostly idle, only active when new logs appear)
- **Memory**: ~2-5 MB
- **Network**: Minimal (batched requests every ~100 seconds with default settings)

### Simulator Resource Usage:
- **Disk**: ~432 KB per day
- **CPU**: Negligible (sleeps 99.9% of the time)
- **Network**: Same as agent (data is batched)

### Dashboard Impact:
- **Database**: Bulk inserts are highly efficient
- **API**: Handles batched requests well
- **Frontend**: No performance impact (standard API calls)

---

## 🔧 Maintenance

### Adjusting Batch Size
To change how many logs are sent per batch:

```bash
sudo nano /etc/systemd/system/log-agent.service
```

Add or modify:
```ini
Environment="BATCH_SIZE=10"
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl restart log-agent
```

### Stopping the Simulator
```bash
sudo systemctl stop log-simulator
sudo systemctl disable log-simulator
```

### Viewing Agent Logs
```bash
# Last 50 lines
sudo journalctl -u log-agent -n 50

# Follow in real-time
sudo journalctl -u log-agent -f

# Since specific time
sudo journalctl -u log-agent --since "1 hour ago"
```

### Checking Database
```bash
# Connect to MongoDB and count logs
mongo "mongodb+srv://..." --eval "db.apilogs.countDocuments({serverIdentifier: '192.168.100.113'})"
```

---

## 📚 File Reference

### Core Files
| File | Purpose |
|------|---------|
| `Scripts/install-agent.sh` | Universal installer for Linux |
| `Scripts/log-agent.sh` | Linux log forwarding agent |
| `Scripts/log-agent.ps1` | Windows log forwarding agent |
| `Scripts/simulate-logs.sh` | Mock log generator |
| `Server/src/controllers/logController.js` | Log ingestion logic |
| `Server/src/routes/logIngestion.js` | API route definition |
| `client/src/components/FilterSection.tsx` | Server selection UI |

### Configuration Files
| File | Purpose |
|------|---------|
| `/etc/systemd/system/log-agent.service` | Agent service definition |
| `/etc/systemd/system/log-simulator.service` | Simulator service definition |
| `.github/workflows/deploy.yml` | CI/CD pipeline |

---

## 🎓 Lessons Learned

1. **Use Internal IPs**: For internal server communication, always use private IPs to avoid NAT hairpinning issues
2. **Consistent Identifiers**: Ensure server identifiers match between agent and dashboard expectations (use IPs, not hostnames)
3. **Firewall First**: Always check firewall rules before troubleshooting application issues
4. **Test Locally**: Verify endpoints work locally (`curl localhost:5001`) before testing remotely
5. **Batch Wisely**: Balance between real-time updates and network efficiency (50 lines = ~8 min delay with 10s simulator)
6. **Monitor Logs**: Use `journalctl -f` to watch services in real-time during troubleshooting

---

## 🆘 Quick Troubleshooting

### Agent not sending logs?
```bash
# Check if agent is running
sudo systemctl status log-agent

# Check for errors
sudo journalctl -u log-agent -n 50

# Test connectivity
curl -X POST http://192.168.100.137:5001/api/logs/ingest \
  -H "Content-Type: application/json" \
  -d '{"serverIdentifier":"TEST","logs":["test"]}'
```

### Dashboard not showing data?
1. Check SERVER_ID matches IP format: `sudo systemctl cat log-agent | grep SERVER_ID`
2. Verify data in database: Check MongoDB `apilogs` collection
3. Check API response: `curl "http://localhost:5001/api/dashboard/stats"`
4. Hard refresh browser: Ctrl+Shift+R

### Pipeline failing?
1. Check GitHub Actions tab for error details
2. Verify IP address in `deploy.yml` is correct
3. Ensure SSH key is properly configured in GitHub Secrets
4. Check server is accessible: `ssh -p 9120 dpd@124.43.216.137`

---

## 📞 Support

For issues or questions:
1. Check this README first
2. Review `Scripts/README.md` for agent-specific details
3. Check `walkthrough.md` for implementation details
4. Review GitHub Actions logs for deployment issues

---

**Last Updated**: 2025-12-30  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
<- Resolves 192.168.100.114 showing as 'Linux' when Last verification: Thu Jan  1 09:43:16 PM +0530 2026 -->
