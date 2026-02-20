# 🛠️ MySLT Monitoring: Prerequisite Installation Guide

This guide contains all the commands needed to prepare a fresh server (**RHEL**, **Rocky Linux**, or **Windows**) for the MySLT Monitoring Ecosystem.

> [!NOTE]
> **For Red Hat (RHEL) Users:** Ensure your server is registered with an active subscription using `sudo subscription-manager register`.

---

## 🖥️ 1. Dashboard Server (RHEL / Rocky Linux)

Run these commands on the server that will host the central dashboard.

### 1.1 Base Environment & EPEL
```bash
# Update system
sudo dnf update -y

# Enable EPEL Repository (Often required for extra packages on RHEL)
sudo dnf install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm

# Install Node.js, NPM, and Nginx
sudo dnf install -y nodejs npm nginx

# Install PM2 globally for process management
sudo npm install -g pm2
```

### 1.2 MongoDB 7.0 Installation
```bash
# Add MongoDB Repository
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo <<EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF

# Install and start MongoDB
sudo dnf install -y mongodb-org
sudo systemctl enable --now mongod
```

### 1.3 Firewall & Security
```bash
# Allow Nginx to connect to the backend API (Port 5001)
sudo setsebool -P httpd_can_network_connect 1

# Open Web and Log Ingestion ports
sudo firewall-cmd --add-service={http,https} --permanent
sudo firewall-cmd --add-port=5001/tcp --permanent
sudo firewall-cmd --reload
```

---

## 📈 2. Monitored Server: RHEL / Rocky Linux

Run these on the remote Linux servers you want to monitor.

### 2.1 Infrastructure Metrics (SNMP)
```bash
# Install SNMP and utilities
sudo dnf install -y net-snmp net-snmp-utils
sudo systemctl enable --now snmpd

# Open SNMP port
sudo firewall-cmd --add-service=snmp --permanent
sudo firewall-cmd --reload
```

### 2.2 Log Streaming (Fluent Bit)
```bash
# Add Fluent Bit Repository
sudo tee /etc/yum.repos.d/fluent-bit.repo <<EOF
[fluent-bit]
name = Fluent Bit
baseurl = https://packages.fluentbit.io/centos/7/\$basearch/
gpgcheck = 1
gpgkey = https://packages.fluentbit.io/fluent-bit.gpg
enabled = 1
EOF

# Install and start Fluent Bit
sudo dnf install -y fluent-bit
sudo systemctl enable --now fluent-bit
```

---

## 🪟 3. Monitored Server: Windows

Run these on the remote Windows servers you want to monitor (via PowerShell as Administrator).

### 3.1 Infrastructure Metrics (SNMP)
```powershell
# Install SNMP Features
Install-WindowsFeature -Name SNMP-Service,SNMP-WMI-Provider

# Allow SNMP through Firewall (Port 161)
New-NetFirewallRule -DisplayName "SNMP-In" -Direction Inbound -Protocol UDP -LocalPort 161 -Action Allow
```

### 3.2 Log Streaming (Fluent Bit)
1. **Download MSI Installer**: [fluentbit.io](https://fluentbit.io/announcements/v3.0.0/)
2. **Install manually** via the downloaded wizard.
3. **Register Service** (after installation):
```cmd
sc create MySLT-Fluent-Bit binPath= "\"C:\Program Files\fluent-bit\bin\fluent-bit.exe\" -c \"C:\Program Files\fluent-bit\conf\fluent-bit.conf\"" start= auto
net start MySLT-Fluent-Bit
```

---

## 📝 Summary Table of Ports

| Service | Port | Protocol | Usage |
| :--- | :--- | :--- | :--- |
| **HTTP/HTTPS** | 80/443 | TCP | Dashboard Web UI |
| **Log Ingest** | 5001 | TCP | Fluent Bit -> Dashboard |
| **SNMP Query** | 161 | UDP | Dashboard -> Remote Server |
| **MongoDB** | 27017 | TCP | Local database access |

---
**Next Steps**: After installing these prerequisites, follow the [DEPLOYMENT_GUIDE.md](file:///var/www/MYSLT-DASHBOARD/DEPLOYMENT_GUIDE.md) to configure the application.
