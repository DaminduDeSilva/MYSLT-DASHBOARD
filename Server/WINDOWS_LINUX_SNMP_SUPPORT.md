# ✅ Windows & Linux SNMP Support - Complete Implementation

## 🎯 What's Been Updated

Your monitoring dashboard now supports **both Windows and Linux servers** with automatic OS detection via SNMP!

---

## 📋 Changes Summary

### **1. Database Model** (`Server/src/models/ServerHealth.js`)
- ✅ Added `osType` field (enum: 'linux', 'windows')
- ✅ Defaults to 'linux' for backward compatibility

### **2. SNMP Service** (`Server/src/services/snmpService.js`)
- ✅ Added Windows-specific OIDs (HOST-RESOURCES-MIB)
- ✅ Added Linux-specific OIDs (UCD-SNMP-MIB)
- ✅ **Auto-detection**: Reads `sysDescr` OID to detect Windows/Linux
- ✅ Separate metric calculation logic for each OS
- ✅ Updated `getServerMetrics()` to accept `osType` parameter
- ✅ Returns detected OS type in response

### **3. Controller** (`Server/src/controllers/serverHealthController.js`)
- ✅ Updated `addServerWithSNMP()` to store detected OS type
- ✅ Enhanced logging to show detected OS
- ✅ Success message includes OS type

### **4. Background Monitor** (`Server/src/utils/snmpMonitor.js`)
- ✅ Uses stored `osType` when updating servers
- ✅ Updates OS type if it changes (in case of re-detection)
- ✅ Logs include OS type for each update

### **5. Documentation**
- ✅ Created `WINDOWS_SNMP_SETUP.md` - Complete Windows SNMP setup guide
- ✅ Created `test-snmp-universal.js` - Universal test script for both OS types
- ✅ Existing `SNMP_SETUP.md` covers Linux

---

## 🔍 How It Works

### **Auto-Detection Process**

1. **Connection Test**: Dashboard connects to server via SNMP
2. **OS Detection**: Queries `sysDescr` OID (1.3.6.1.2.1.1.1.0)
3. **String Analysis**: 
   - If contains "windows" → Uses Windows OIDs
   - Otherwise → Uses Linux OIDs
4. **Metric Collection**: Fetches CPU, RAM, Disk, Network using OS-specific OIDs
5. **Storage**: Saves metrics + OS type to MongoDB
6. **Background Updates**: Uses stored OS type for subsequent updates (30-second interval)

### **Windows OIDs (HOST-RESOURCES-MIB)**

```javascript
CPU:    1.3.6.1.2.1.25.3.3.1.2.1    (hrProcessorLoad)
Memory: 1.3.6.1.2.1.25.2.3.1.x      (hrStorage - RAM)
Disk:   1.3.6.1.2.1.25.2.3.1.x      (hrStorage - Fixed Disk)
```

### **Linux OIDs (UCD-SNMP-MIB)**

```javascript
CPU:    1.3.6.1.4.1.2021.11.11.0    (cpuIdle)
Memory: 1.3.6.1.4.1.2021.4.x.0      (memTotalReal, memAvailReal)
Disk:   1.3.6.1.4.1.2021.9.1.9.1    (dskPercent)
```

### **Network (Both OS - Standard IF-MIB)**

```javascript
In:     1.3.6.1.2.1.2.2.1.10.2      (ifInOctets)
Out:    1.3.6.1.2.1.2.2.1.16.2      (ifOutOctets)
```

---

## 🚀 Setup Instructions

### **For Your Proxmox Linux Server (124.43.216.136 / 192.168.100.113)**

**SSH into the server:**
```bash
ssh root@124.43.216.136
```

**Install and configure SNMP:**
```bash
# Quick setup (one command)
apt update && apt install snmpd snmp -y && \
cat > /etc/snmp/snmpd.conf << 'EOF'
agentAddress udp:161,udp6:[::1]:161
rocommunity public default -V systemonly
rocommunity public 0.0.0.0/0
syslocation "Proxmox Data Center"
syscontact admin@myslt.local
includeAllDisks 10%
load 12 10 5
EOF
systemctl restart snmpd && \
systemctl enable snmpd && \
ufw allow 161/udp && \
echo "✅ SNMP configured successfully!"
```

**Test locally:**
```bash
snmpwalk -v2c -c public localhost system
```

---

### **For Windows Servers**

See detailed guide in **`Server/WINDOWS_SNMP_SETUP.md`**

**Quick PowerShell Setup (Run as Administrator):**
```powershell
# Install SNMP
Install-WindowsFeature -Name SNMP-Service,SNMP-WMI-Provider

# Configure
$snmpParameters = "HKLM:\SYSTEM\CurrentControlSet\Services\SNMP\Parameters"
$validCommunities = "$snmpParameters\ValidCommunities"
$permittedManagers = "$snmpParameters\PermittedManagers"

New-Item -Path $validCommunities -Force | Out-Null
New-Item -Path $permittedManagers -Force | Out-Null

New-ItemProperty -Path $validCommunities -Name "public" -Value 4 -PropertyType DWord -Force
New-ItemProperty -Path $permittedManagers -Name "1" -Value "0.0.0.0" -PropertyType String -Force

Restart-Service SNMP

# Firewall
New-NetFirewallRule -DisplayName "SNMP-In" -Direction Inbound -Protocol UDP -LocalPort 161 -Action Allow

Write-Host "✅ SNMP configured!" -ForegroundColor Green
```

---

## 🧪 Testing

### **Test Your Setup**

```bash
cd Server
node test-snmp-universal.js
```

**Expected Output:**
```
🔍 Universal SNMP Connection Test
============================================================

📡 Testing: Proxmox Linux Server (Your Server)
   IP: 124.43.216.136
   Expected OS: linux
------------------------------------------------------------

1️⃣ Testing SNMP Connection...
✅ Connection Successful!
   System: Linux proxmox 5.15.0-91-generic #101-Ubuntu...

2️⃣ Fetching Server Metrics (Auto-detecting OS)...
🔍 Auto-detected OS: linux for 124.43.216.136
✅ Metrics Retrieved Successfully!

📊 Server Details:
   Detected OS: LINUX
   Status: HEALTHY

📈 Performance Metrics:
   CPU Usage: 56%
   RAM Usage: 54.32%
   Disk Usage: 75%
   Network Traffic: 1234.56 MB
   Uptime: 15d 7h 23m

✅ OS Detection Correct!
```

---

## 📱 Using in Admin Panel

### **Add Server**

1. **Login**: Go to `http://localhost:5173`, login with `admin/123456`
2. **Admin Panel**: Click user menu → Admin Panel
3. **Add Server**:
   - **IP**: `124.43.216.136` (or `192.168.100.113` if same LAN)
   - **Community**: `public`
   - Click **Add Server**

4. **Auto-Magic**:
   - Dashboard tests connection ✅
   - Detects OS automatically 🔍
   - Fetches real metrics 📊
   - Shows success message: "Server added successfully (OS: linux)" 🎉

5. **View Metrics**: Go to **System Health** page
   - Real-time metrics displayed
   - Auto-refreshes every 30 seconds
   - Status indicators (Healthy/Warning/Critical)

---

## 🎛️ Network Configuration

### **Scenario 1: Same Local Network**
- Use internal IP: `192.168.100.113`
- No port forwarding needed
- Firewall must allow UDP 161

### **Scenario 2: Different Networks (Your Current Setup)**
- Use WAN IP: `124.43.216.136`
- Port forwarding required on router:
  - External: UDP 161 → Internal: 192.168.100.113:161
- Server firewall must allow UDP 161

### **Port Forwarding Example (Router)**
```
Service Name: SNMP
External Port: 161 (UDP)
Internal IP: 192.168.100.113
Internal Port: 161 (UDP)
```

### **Firewall Rules**

**On Proxmox server:**
```bash
ufw allow 161/udp
ufw status
```

**On Windows server:**
```powershell
New-NetFirewallRule -DisplayName "SNMP-In" -Direction Inbound -Protocol UDP -LocalPort 161 -Action Allow
```

---

## 🆚 Comparison: Windows vs Linux

| Feature | Linux (UCD-SNMP) | Windows (HOST-RESOURCES) |
|---------|------------------|--------------------------|
| **Setup** | `apt install snmpd` | Server Manager → Features |
| **Config File** | `/etc/snmp/snmpd.conf` | Registry + Services.msc |
| **CPU Metric** | Idle % (calculate 100-idle) | Load % (direct) |
| **Memory Metric** | KB values with buffers/cache | Allocation units |
| **Disk Metric** | Percentage (direct) | Total/Used units (calculate %) |
| **Auto-Detect** | ✅ via sysDescr | ✅ via sysDescr |
| **Background Updates** | ✅ Every 30 sec | ✅ Every 30 sec |

---

## 🔧 Troubleshooting

### **Connection Refused**
```bash
# Linux: Check SNMP is running
systemctl status snmpd

# Windows: Check SNMP service
Get-Service SNMP
```

### **Port Not Open**
```bash
# Linux: Check port
netstat -tulnp | grep 161

# Windows: Check port
netstat -an | findstr :161
```

### **Firewall Blocking**
```bash
# Linux: Check UFW
ufw status verbose

# Windows: Check firewall rule
Get-NetFirewallRule -DisplayName "SNMP-In"
```

### **Wrong Metrics**
- Verify correct OS detected in database
- Check backend logs for OID query results
- Test with `snmpwalk` to verify OIDs exist

---

## 📊 Database Schema

```javascript
{
  serverIp: "124.43.216.136",
  osType: "linux",              // NEW: 'linux' or 'windows'
  cpuUtilization: 56.0,
  ramUsage: 54.32,
  diskSpace: 75.0,
  networkTraffic: 1234.56,
  uptime: "15d 7h 23m",
  status: "healthy",
  snmpCommunity: "public",
  lastUpdated: "2025-12-12T10:30:00.000Z",
  createdAt: "2025-12-12T09:00:00.000Z",
  updatedAt: "2025-12-12T10:30:00.000Z"
}
```

---

## ✅ What Works Now

- ✅ **Auto OS Detection**: Automatically identifies Windows/Linux
- ✅ **Windows Support**: Full metrics for Windows Server
- ✅ **Linux Support**: Full metrics for Linux servers (existing)
- ✅ **Mixed Environment**: Monitor both OS types simultaneously
- ✅ **Remote Servers**: Works over WAN with proper port forwarding
- ✅ **Background Updates**: 30-second auto-refresh for all servers
- ✅ **Real-time Dashboard**: Live metrics in SystemHealth page
- ✅ **Admin Management**: Add/delete servers via Admin Panel

---

## 🔐 Security Best Practices

1. **Change Community String**: Use something other than "public"
2. **Restrict IPs**: Replace `0.0.0.0` with your monitoring server IP
3. **Use SNMPv3**: Upgrade to v3 for encryption (requires code changes)
4. **Firewall Rules**: Only allow SNMP from trusted IPs
5. **Monitor Access**: Review SNMP access logs regularly

---

## 📚 Documentation Files

- **`SNMP_SETUP.md`**: Linux SNMP setup (existing)
- **`WINDOWS_SNMP_SETUP.md`**: Windows SNMP setup (new)
- **`test-snmp-universal.js`**: Test script for both OS (new)
- **`test-snmp.js`**: Original Linux test script (existing)

---

## 🎉 Summary

Your dashboard now supports **both Windows and Linux servers** with:

1. **Automatic OS detection** - No manual configuration needed
2. **OS-specific OID queries** - Uses correct SNMP MIBs for each platform
3. **Unified interface** - Same UI for both OS types
4. **Background monitoring** - Continuous 30-second updates
5. **Remote server support** - Works over WAN with your Proxmox setup

**Next Step**: Run the SNMP setup on your Proxmox server (124.43.216.136), then add it via Admin Panel!

---

## 📞 Need Help?

- Check troubleshooting sections in setup guides
- Test with `test-snmp-universal.js`
- Review backend logs: `cd Server && npm start`
- Verify SNMP with `snmpwalk -v2c -c public <IP> system`
