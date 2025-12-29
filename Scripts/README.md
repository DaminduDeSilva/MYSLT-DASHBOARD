# MySLT Dashboard Log Agents 🚀

This directory contains universal agents and installers to forward logs from **any** remote server to the MySLT Dashboard.

## 📁 Core Files
- `install-agent.sh`: **Universal Installer** for Linux.
- `log-agent.sh`: The core log-watcher agent.
- `simulate-logs.sh`: Optional simulator to generate mock logs for testing.
- `log-agent.ps1`: Agent for Windows servers.

---

## � How to Transfer to Remote Server

Choose the easiest method for your environment:

### Method A: SCP (Easiest for one-off)
Run this from **your main dashboard server**:
```bash
# scp -P [PORT] -r [SOURCE] [USER]@[IP]:[DESTINATION]
scp -P {PORT} -r /var/www/MYSLT-DASHBOARD/Scripts dpd@[REMOTE_IP]:/home/dpd/
```
*Note: Use uppercase `-P` for the port in SCP.*

### Method B: Git (Best for updates)
If the remote server has access to GitHub, just clone the repo:
```bash
git clone https://github.com/DaminduDeSilva/MYSLT-DASHBOARD.git
cd MYSLT-DASHBOARD/Scripts
```

---

## �🛠️ Linux Setup (Quick Start)

The `install-agent.sh` script handles everything: dependency checks, script installation, and service configuration.

### 1. Basic Installation
To watch a specific log file and use the server's hostname as the identifier:
```bash
sudo ./install-agent.sh --path "/var/log/myapp.log"
```

### 2. Installation with Simulator (For Testing)
If you don't have a log file yet and want to see the dashboard in action:
```bash
sudo ./install-agent.sh --with-simulator
```

### 3. Custom Configuration
```bash
sudo ./install-agent.sh \
  --url "https://YOUR_DASHBOARD_IP:9122/api/logs/ingest" \
  --id "PROD_BACKEND_01" \
  --path "/var/www/logs/api.log"
```

---

## 📊 Management
Once installed, the agents run as systemd services:

- **Check Status**: `sudo systemctl status log-agent`
- **Stop Simulator**: `sudo systemctl stop log-simulator`
- **View Agent Logs**: `journalctl -u log-agent -f`

---

## 🛡️ Resource Safety
- **Agent**: Only wakes up when the log file changes. Extremely efficient.
- **Simulator**: Generates one line every 10 seconds (~430KB/day). Safe for production testing.
- **Network**: Logs are batched (default: 10 lines) before being sent, minimizing HTTPS requests.
