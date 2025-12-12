# Windows Server SNMP Setup Guide

## 📋 Overview
This guide shows how to enable SNMP on Windows Server so your monitoring dashboard can fetch real-time metrics (CPU, RAM, Disk, Network).

---

## 🪟 Windows Server Configuration

### **Method 1: GUI Setup (Recommended for Beginners)**

#### **Step 1: Install SNMP Service**

1. Open **Server Manager**
2. Click **Manage** → **Add Roles and Features**
3. Click **Next** until you reach **Features**
4. Scroll down and check:
   - ✅ **SNMP Service**
   - ✅ **SNMP WMI Provider** (optional but recommended)
5. Click **Next** → **Install**
6. Wait for installation to complete
7. Click **Close**

#### **Step 2: Configure SNMP Service**

1. Press `Win + R`, type `services.msc`, press Enter
2. Find **SNMP Service** in the list
3. Right-click → **Properties**

**Security Tab:**
1. Click **Add** under "Accepted community names"
2. Enter:
   - Community rights: **READ ONLY**
   - Community name: **public**
3. Click **Add**
4. Under "Accept SNMP packets from these hosts":
   - Click **Add**
   - Enter: **0.0.0.0** (or your monitoring server IP for better security)
   - Click **Add**

**Agent Tab:**
1. Check all services:
   - ✅ Physical
   - ✅ Applications
   - ✅ Datalink / Subnetwork
   - ✅ Internet
   - ✅ End-to-End
2. Fill in contact info (optional)

5. Click **OK**
6. Right-click **SNMP Service** → **Restart**

---

### **Method 2: PowerShell Setup (Fast & Automated)**

**Run as Administrator:**

```powershell
# Install SNMP Feature
Install-WindowsFeature -Name SNMP-Service,SNMP-WMI-Provider

# Configure SNMP Community String
$snmpParameters = "HKLM:\SYSTEM\CurrentControlSet\Services\SNMP\Parameters"
$validCommunities = "$snmpParameters\ValidCommunities"
$permittedManagers = "$snmpParameters\PermittedManagers"

# Create registry keys if they don't exist
New-Item -Path $validCommunities -Force | Out-Null
New-Item -Path $permittedManagers -Force | Out-Null

# Add 'public' community with READ-ONLY access (value 4)
New-ItemProperty -Path $validCommunities -Name "public" -Value 4 -PropertyType DWord -Force

# Allow SNMP from any host (or specify your monitoring server IP)
New-ItemProperty -Path $permittedManagers -Name "1" -Value "0.0.0.0" -PropertyType String -Force

# Restart SNMP Service
Restart-Service SNMP

Write-Host "✅ SNMP configured successfully!" -ForegroundColor Green
```

---

### **Step 3: Configure Firewall**

**Allow SNMP through Windows Firewall:**

```powershell
# Allow UDP port 161 (SNMP)
New-NetFirewallRule -DisplayName "SNMP-In" -Direction Inbound -Protocol UDP -LocalPort 161 -Action Allow

# Verify
Get-NetFirewallRule -DisplayName "SNMP-In"
```

**Or via GUI:**
1. Open **Windows Defender Firewall with Advanced Security**
2. Click **Inbound Rules** → **New Rule**
3. Select **Port** → Next
4. Select **UDP**, enter **161** → Next
5. Select **Allow the connection** → Next
6. Check all profiles (Domain, Private, Public) → Next
7. Name: **SNMP-In** → Finish

---

## ✅ Testing SNMP

### **Test Locally on Windows Server**

**Using PowerShell:**
```powershell
# Install SNMP tools
Install-WindowsFeature -Name RSAT-SNMP

# Test SNMP query
snmpwalk -v 2c -c public localhost system
```

### **Test from Another Machine**

**From Linux/Mac:**
```bash
snmpwalk -v2c -c public <WINDOWS_SERVER_IP> system
```

**From Windows:**
```powershell
# Use Net-SNMP tools (download from http://www.net-snmp.org/download.html)
snmpwalk -v 2c -c public <WINDOWS_SERVER_IP> system
```

**Expected Output:**
```
SNMPv2-MIB::sysDescr.0 = STRING: Hardware: Intel64 Family...
SNMPv2-MIB::sysObjectID.0 = OID: SNMPv2-SMI::enterprises.311.1.1.3.1.2
SNMPv2-MIB::sysUpTime.0 = Timeticks: (123456) 0:20:34.56
...
```

---

## 🔧 Troubleshooting

### **SNMP Service Won't Start**
```powershell
# Check service status
Get-Service SNMP

# View event log
Get-EventLog -LogName Application -Source SNMP -Newest 10
```

### **Connection Refused**
1. Verify firewall rule is active:
   ```powershell
   Get-NetFirewallRule -DisplayName "SNMP-In" | Select-Object -Property DisplayName,Enabled,Action
   ```
2. Check SNMP is listening:
   ```powershell
   netstat -an | findstr :161
   ```
   Should show: `UDP    0.0.0.0:161    *:*`

### **No Data Returned**
1. Verify community string:
   ```powershell
   Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\SNMP\Parameters\ValidCommunities"
   ```
2. Check permitted managers:
   ```powershell
   Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\SNMP\Parameters\PermittedManagers"
   ```

### **Metrics Show as 0 or NaN**
- Windows SNMP may need additional configuration for disk monitoring
- Install **SNMP WMI Provider** if not already installed
- Verify HOST-RESOURCES-MIB is accessible:
  ```powershell
  snmpwalk -v 2c -c public localhost 1.3.6.1.2.1.25
  ```

---

## 📊 SNMP OIDs Used (Windows)

| Metric | OID | Description |
|--------|-----|-------------|
| **CPU Load** | 1.3.6.1.2.1.25.3.3.1.2.1 | Processor load percentage |
| **RAM Total** | 1.3.6.1.2.1.25.2.3.1.5.1 | Total physical memory units |
| **RAM Used** | 1.3.6.1.2.1.25.2.3.1.6.1 | Used memory units |
| **Disk Total** | 1.3.6.1.2.1.25.2.3.1.5.4 | Total disk allocation units |
| **Disk Used** | 1.3.6.1.2.1.25.2.3.1.6.4 | Used disk allocation units |
| **Network In** | 1.3.6.1.2.1.2.2.1.10.2 | Bytes received (interface 2) |
| **Network Out** | 1.3.6.1.2.1.2.2.1.16.2 | Bytes sent (interface 2) |
| **Uptime** | 1.3.6.1.2.1.1.3.0 | System uptime in timeticks |

---

## 🔐 Security Best Practices

1. **Use SNMPv3** (if supported by your app - currently uses v2c):
   ```powershell
   # SNMPv3 with authentication
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\SNMP\Parameters\RFC1156Agent" -Name "sysServices" -Value 76 -PropertyType DWord -Force
   ```

2. **Restrict Access by IP**:
   - Replace `0.0.0.0` with your monitoring server's IP
   - Example: `192.168.100.50`

3. **Use Strong Community String**:
   - Change `public` to a complex string
   - Update in your dashboard's Admin Panel

4. **Monitor SNMP Access**:
   - Enable SNMP auditing in Security Policy
   - Review logs regularly

---

## 📝 Adding Windows Server to Dashboard

1. **Login** to your dashboard (admin/123456)
2. Go to **Admin Panel**
3. Click **Add Server**
4. Enter:
   - **IP Address**: Your Windows server IP (e.g., `192.168.100.50`)
   - **OS Type**: Will auto-detect as `windows`
   - **Community**: `public` (or your custom string)
5. Click **Add Server**

The dashboard will:
- Auto-detect Windows OS from SNMP system description
- Fetch CPU, RAM, Disk, Network, Uptime
- Update every 30 seconds automatically

---

## 🆚 Windows vs Linux SNMP

| Feature | Windows | Linux |
|---------|---------|-------|
| **MIB Used** | HOST-RESOURCES-MIB | UCD-SNMP-MIB |
| **CPU OID** | 1.3.6.1.2.1.25.3.3.1.2 | 1.3.6.1.4.1.2021.11.11.0 |
| **Memory OID** | 1.3.6.1.2.1.25.2.3.1.x | 1.3.6.1.4.1.2021.4.x.0 |
| **Disk OID** | 1.3.6.1.2.1.25.2.3.1.x | 1.3.6.1.4.1.2021.9.1.x |
| **Auto-Detect** | ✅ Yes (via sysDescr) | ✅ Yes (via sysDescr) |

Your dashboard **automatically detects the OS type** and uses the correct OIDs!

---

## ✅ Verification Checklist

- [ ] SNMP Service installed
- [ ] Community string 'public' configured with READ-ONLY access
- [ ] Permitted managers includes your monitoring server IP (or 0.0.0.0)
- [ ] Firewall allows UDP port 161
- [ ] SNMP Service is running
- [ ] Local SNMP test successful
- [ ] Remote SNMP test successful (from monitoring server)
- [ ] Server added to dashboard
- [ ] Metrics displaying correctly

---

## 🔗 Additional Resources

- [Microsoft: SNMP Configuration](https://learn.microsoft.com/en-us/windows-server/networking/technologies/snmp/snmp-top)
- [HOST-RESOURCES-MIB Documentation](https://www.ietf.org/rfc/rfc2790.txt)
- [Net-SNMP Windows Tools](http://www.net-snmp.org/download.html)

---

**Need Help?** Check the troubleshooting section or contact your system administrator.
