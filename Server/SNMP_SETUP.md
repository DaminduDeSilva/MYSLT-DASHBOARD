# SNMP Integration Setup Guide

## ✅ What's Been Built

### 1. **SNMP Service** (`src/services/snmpService.js`)
- Connects to Linux servers via SNMP (port 161)
- Queries standard Linux OIDs for:
  - **CPU**: User, System, Idle percentages
  - **RAM**: Total, Available, Buffer, Cache
  - **Disk**: Usage percentage
  - **Network**: Bytes In/Out
  - **Uptime**: System uptime in readable format
- Returns formatted metrics ready for dashboard

### 2. **Server Health Controller** (Updated)
- **`GET /api/server-health/snmp/:ip`** - Fetch real-time metrics from a server
- **`POST /api/server-health/snmp/test`** - Test SNMP connection
- **`POST /api/server-health/snmp/add`** - Add server with auto-detection

### 3. **Background Monitor** (`src/utils/snmpMonitor.js`)
- Auto-updates all servers every 30 seconds
- Runs in background on server startup
- Updates MongoDB with fresh metrics

### 4. **Updated Routes**
- All SNMP endpoints registered
- Ready to use from frontend

---

## 🔧 Linux Server SNMP Setup

### **On your Linux server (192.168.100.113):**

```bash
# 1. Install SNMP daemon
sudo apt update
sudo apt install snmpd snmp -y

# 2. Backup original config
sudo cp /etc/snmp/snmpd.conf /etc/snmp/snmpd.conf.backup

# 3. Edit SNMP configuration
sudo nano /etc/snmp/snmpd.conf
```

### **Configuration:**
Add/modify these lines in `/etc/snmp/snmpd.conf`:

```bash
# Listen on all interfaces
agentAddress udp:161,udp6:[::1]:161

# Allow access from your network
rocommunity public default
# For better security, restrict to your backend server IP:
# rocommunity public 192.168.100.x

# System information
syslocation "Data Center"
syscontact admin@example.com

# Enable UCD-SNMP-MIB for disk and CPU monitoring
disk / 10000
load 12 10 5
```

### **Start SNMP service:**
```bash
sudo systemctl restart snmpd
sudo systemctl enable snmpd
sudo systemctl status snmpd

# Test locally
snmpwalk -v2c -c public localhost system
```

### **Firewall (if enabled):**
```bash
sudo ufw allow 161/udp
sudo ufw reload
```

---

## 🧪 Testing

### **1. Test from your backend server:**

```bash
# Install snmp tools on Windows (if needed)
# Or test from another Linux machine:
snmpwalk -v2c -c public 192.168.100.113 system
```

### **2. Test via API:**

```bash
# Test SNMP connection
curl -X POST http://localhost:5000/api/server-health/snmp/test \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.100.113", "community": "public"}'

# Get real-time metrics
curl http://localhost:5000/api/server-health/snmp/192.168.100.113

# Add server to monitoring
curl -X POST http://localhost:5000/api/server-health/snmp/add \
  -H "Content-Type: application/json" \
  -d '{"serverIp": "192.168.100.113", "community": "public"}'
```

---

## 🚀 Starting the Server

```bash
cd Server
npm start
```

**Expected output:**
```
🚀 MySLT Monitoring API Server
🌐 Server running on: http://localhost:5000
🚀 Starting SNMP monitor...
⏱️  Refresh interval: 30 seconds
📊 Updating metrics for 1 servers...
✅ Updated 192.168.100.113
✨ Server metrics update completed
```

---

## 📊 How It Works

1. **Server starts** → SNMP monitor starts in background
2. **Every 30 seconds** → Query all servers in database
3. **For each server** → Fetch CPU, RAM, Disk, Network, Uptime via SNMP
4. **Update MongoDB** → Save latest metrics
5. **Dashboard refreshes** → Shows real-time data

---

## 🔐 Security Notes

1. **Community String**: Default is `public` (change in production)
2. **Network Access**: SNMP uses UDP port 161
3. **Firewall**: Ensure backend can reach server on port 161
4. **Best Practice**: Use SNMP v3 with authentication (optional upgrade)

---

## 🎯 Next Steps

### **From Admin Panel:**
1. Click "Add Server" button
2. Enter IP: `192.168.100.113`
3. Select OS: `Linux`
4. Click "Add" → Backend will:
   - Test SNMP connection
   - Fetch real metrics
   - Add to monitoring
   - Start auto-refresh

### **From API (Alternative):**
```javascript
// Frontend API call
const response = await fetch('http://localhost:5000/api/server-health/snmp/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    serverIp: '192.168.100.113',
    community: 'public'
  })
});
```

---

## 🐛 Troubleshooting

### **"SNMP connection failed"**
- Check if snmpd is running: `sudo systemctl status snmpd`
- Test locally on server: `snmpwalk -v2c -c public localhost system`
- Check firewall: `sudo ufw status`
- Verify network connectivity: `ping 192.168.100.113`

### **"No response from server"**
- Ensure backend can reach server IP
- Check SNMP community string matches
- Verify port 161 is not blocked

### **"Metrics are 0 or null"**
- Check OID support: `snmpwalk -v2c -c public 192.168.100.113 .1.3.6.1.4.1.2021`
- Install net-snmp-utils on Linux: `sudo apt install snmp-mibs-downloader`

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/server-health/snmp/:ip` | Get real-time metrics for a server |
| POST | `/api/server-health/snmp/test` | Test SNMP connection |
| POST | `/api/server-health/snmp/add` | Add server with auto-detection |
| GET | `/api/server-health/` | Get all monitored servers |

---

## ✨ Success!

Your SNMP integration is ready! The system will:
- ✅ Query your Linux server every 30 seconds
- ✅ Display real-time CPU, RAM, Disk, Network metrics
- ✅ Auto-update dashboard without manual refresh
- ✅ Support multiple servers simultaneously

Add your server `192.168.100.113` and watch live metrics flow! 🎉
