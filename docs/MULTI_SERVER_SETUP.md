# 🌐 Multi-Server SNMP Monitoring Setup Guide

## 📋 Prerequisites for Target Servers

### **Linux Servers (Ubuntu/Debian/Rocky/CentOS/etc.)**

#### **Step 1: Install SNMP Daemon**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install snmpd snmp -y

# Rocky Linux/CentOS/RHEL
sudo dnf install net-snmp net-snmp-utils -y

# Verify installation
snmpd -v
```

#### **Step 2: Configure SNMP**
```bash
# Backup original config
sudo cp /etc/snmp/snmpd.conf /etc/snmp/snmpd.conf.backup

# Create monitoring configuration
sudo tee /etc/snmp/snmpd.conf > /dev/null << 'EOF'
# SNMP Configuration for MySLT Monitoring

# Listen on all interfaces
agentAddress udp:161,udp6:[::1]:161

# Allow access from monitoring network (adjust for your LAN)
rocommunity public default
# For better security, restrict to your monitoring server:
# rocommunity public 192.168.100.137/32

# System information
syslocation "Server Location - Data Center"
syscontact admin@yourcompany.com
sysservices 72

# Enable detailed monitoring
disk / 10%
disk /var 10%
disk /tmp 10%
disk /home 10%

# Load averages
load 12 10 5

# Process monitoring
proc sshd
proc httpd
proc nginx
proc apache2
proc mysqld
proc mongodb
proc docker

# Enable UCD-SNMP-MIB
includeAllDisks 10%

# Default access control
view systemonly included .1.3.6.1.2.1.1
view systemonly included .1.3.6.1.2.1.25.1
view systemonly included .1.3.6.1.4.1.2021
view all included .1 80

access notConfigGroup "" any noauth exact all none none
access readonly "" any noauth exact systemonly none none

# Enable AgentX
master agentx
EOF
```

#### **Step 3: Start & Enable Service**
```bash
# Start SNMP service
sudo systemctl start snmpd
sudo systemctl enable snmpd

# Verify status
sudo systemctl status snmpd
```

#### **Step 4: Configure Firewall**
```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 161/udp
sudo ufw reload

# Rocky Linux/CentOS (firewalld)
sudo firewall-cmd --permanent --add-port=161/udp
sudo firewall-cmd --reload

# Verify firewall
sudo firewall-cmd --list-ports  # Rocky/CentOS
sudo ufw status                 # Ubuntu/Debian
```

#### **Step 5: Test Local SNMP**
```bash
# Test SNMP locally
snmpwalk -v2c -c public localhost system

# Expected output: System information should be displayed
```

---

### **Windows Servers**

#### **Step 1: Enable SNMP Service**
```powershell
# Run as Administrator
# Install SNMP Feature
Enable-WindowsOptionalFeature -Online -FeatureName "SNMP" -All

# Or via Server Manager:
# Add Roles and Features > Features > SNMP Service
```

#### **Step 2: Configure SNMP Service**
```powershell
# Configure via Registry or Services.msc
# Services.msc > SNMP Service > Properties > Security tab

# Add Community: "public" with READ ONLY rights
# Add Host: 192.168.100.137 (your monitoring server)
```

#### **Step 3: Configure Windows Firewall**
```powershell
# Allow SNMP through Windows Firewall
New-NetFirewallRule -DisplayName "SNMP-In" -Direction Inbound -Protocol UDP -LocalPort 161 -Action Allow

# Verify rule
Get-NetFirewallRule -DisplayName "SNMP-In"
```

#### **Step 4: Start SNMP Service**
```powershell
# Start and enable SNMP service
Start-Service SNMP
Set-Service SNMP -StartupType Automatic

# Verify status
Get-Service SNMP
```

---

## 🔧 **Network Configuration**

### **pfSense Firewall Rules**

Since all servers are on the same LAN, you typically **don't need** special pfSense rules for inter-LAN communication, but verify:

```bash
# From your monitoring server (192.168.100.137), test connectivity:
ping 192.168.100.X     # Replace X with target server IP
telnet 192.168.100.X 161   # Test SNMP port
```

### **LAN Subnet Configuration**
- **Monitoring Server**: `192.168.100.137` (MySLT Dashboard)
- **Target Servers**: Any IP in `192.168.100.0/24` range
- **SNMP Port**: `161/UDP`
- **Community String**: `public` (change for security)

---

## 🎯 **Adding Servers to Dashboard**

### **Method 1: Via Web Dashboard**
1. Go to: `https://dpdlab1.slt.lk:9122/admin`
2. Click "Add Server"
3. Enter server IP (e.g., `192.168.100.50`)
4. Select OS type (Linux/Windows)
5. Click "Add"

### **Method 2: Via API**
```bash
# Add Linux server
curl -X POST https://dpdlab1.slt.lk:9122/api/server-health/snmp/add \
  -H "Content-Type: application/json" \
  -d '{"serverIp": "192.168.100.50", "community": "public"}'

# Add Windows server
curl -X POST https://dpdlab1.slt.lk:9122/api/server-health/snmp/add \
  -H "Content-Type: application/json" \
  -d '{"serverIp": "192.168.100.60", "community": "public"}'
```

---

## 🧪 **Testing Multi-Server Setup**

### **Test SNMP Connectivity**
```bash
# From monitoring server, test each target
snmpwalk -v2c -c public 192.168.100.50 system    # Linux server
snmpwalk -v2c -c public 192.168.100.60 system    # Windows server

# Test via dashboard API
curl -X POST https://dpdlab1.slt.lk:9122/api/server-health/snmp/test \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.100.50", "community": "public"}'
```

### **Verify Dashboard Data**
```bash
# Check all monitored servers
curl https://dpdlab1.slt.lk:9122/api/server-health/ | jq .

# Get specific server metrics
curl https://dpdlab1.slt.lk:9122/api/server-health/snmp/192.168.100.50 | jq .
```

---

## 📊 **Example Multi-Server Setup**

| Server IP | Purpose | OS | SNMP Status |
|-----------|---------|----|-----------| 
| `192.168.100.137` | Dashboard/Web Server | Rocky Linux | ✅ Configured |
| `192.168.100.50` | Database Server | Ubuntu 22.04 | ❌ Need to configure |
| `192.168.100.60` | File Server | Windows Server | ❌ Need to configure |
| `192.168.100.70` | Application Server | Rocky Linux | ❌ Need to configure |
| `192.168.100.80` | Backup Server | Debian 12 | ❌ Need to configure |

---

## 🔐 **Security Best Practices**

### **1. Change Default Community**
```bash
# Instead of "public", use a custom community string
rocommunity myslt_monitor_2024 192.168.100.137/32
```

### **2. Restrict Access by IP**
```bash
# Only allow monitoring server
rocommunity public 192.168.100.137/32
```

### **3. Use SNMPv3 (Advanced)**
```bash
# Create SNMPv3 user with authentication
createUser mysltuser SHA "mypassword123" AES "myencryption456"
rouser mysltuser
```

### **4. Monitor SNMP Logs**
```bash
# Check for unauthorized access
tail -f /var/log/snmpd.log
journalctl -u snmpd -f
```

---

## ⚡ **Quick Setup Script**

Save this script for rapid deployment on new Linux servers:

```bash
#!/bin/bash
# MySLT SNMP Quick Setup Script

echo "🔧 Installing SNMP..."
if command -v apt &> /dev/null; then
    sudo apt update && sudo apt install snmpd snmp -y
elif command -v dnf &> /dev/null; then
    sudo dnf install net-snmp net-snmp-utils -y
fi

echo "📝 Configuring SNMP..."
sudo cp /etc/snmp/snmpd.conf /etc/snmp/snmpd.conf.backup

sudo tee /etc/snmp/snmpd.conf > /dev/null << 'EOF'
agentAddress udp:161,udp6:[::1]:161
rocommunity public default
syslocation "Auto-configured Server"
syscontact admin@yourcompany.com
sysservices 72
disk / 10%
load 12 10 5
includeAllDisks 10%
view systemonly included .1.3.6.1.2.1.1
view systemonly included .1.3.6.1.2.1.25.1
view systemonly included .1.3.6.1.4.1.2021
access notConfigGroup "" any noauth exact all none none
access readonly "" any noauth exact systemonly none none
master agentx
EOF

echo "🚀 Starting SNMP service..."
sudo systemctl start snmpd
sudo systemctl enable snmpd

echo "🔥 Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 161/udp
elif command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-port=161/udp
    sudo firewall-cmd --reload
fi

echo "✅ Testing SNMP..."
if snmpwalk -v2c -c public localhost system | head -1; then
    echo "🎉 SNMP setup successful!"
    echo "Server ready for monitoring by MySLT Dashboard"
    echo "Add this server IP to your dashboard: $(hostname -I | awk '{print $1}')"
else
    echo "❌ SNMP test failed - check configuration"
fi
```

---

## 🎯 **Summary**

✅ **Your dashboard CAN monitor multiple servers**  
✅ **Same LAN setup is IDEAL for SNMP monitoring**  
✅ **pfSense won't block inter-LAN SNMP traffic**  
✅ **Each server needs SNMP daemon installed & configured**  
✅ **Dashboard auto-detects OS and fetches appropriate metrics**  

**Next Steps:**
1. Pick a target server to test with
2. Install SNMP using the guide above
3. Add it via your dashboard admin panel
4. Watch live metrics appear!

Would you like me to help you configure SNMP on a specific server?
