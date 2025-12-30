# MySLT Dashboard Log Agents 🚀

Universal agents and installers to forward logs from **any** remote server to the MySLT Dashboard.

> [!TIP]
> For complete implementation details, troubleshooting, and architecture overview, see **[MULTI_SERVER_LOG_MONITORING.md](../MULTI_SERVER_LOG_MONITORING.md)**

## 📁 Core Files
- `install-agent.sh` - **Universal Installer** for Linux
- `log-agent.sh` - Linux log-watcher agent
- `simulate-logs.sh` - Mock log generator (for testing)
- `install-agent.ps1` - **Universal Installer** for Windows
- `log-agent.ps1` - Windows log-watcher agent
- `simulate-logs.ps1` - Windows log simulator
- `setup-snmp-windows.ps1` - Windows SNMP setup script

---

## 🚀 Quick Start (Linux)

### 1. Transfer Scripts to Remote Server

**Using SCP** (from dashboard server):
```bash
scp -P [SSH_PORT] -r /var/www/MYSLT-DASHBOARD/Scripts dpd@[REMOTE_IP]:/home/dpd/
```

**Using Git** (on remote server):
```bash
git clone https://github.com/Omindu1015/MYSLT-DASHBOARD.git
cd MYSLT-DASHBOARD/Scripts
```

### 2. Install Agent

```bash
cd /home/dpd/Scripts
chmod +x install-agent.sh

# With simulator (for testing)
sudo ./install-agent.sh --with-simulator

# For real log file
sudo ./install-agent.sh --path "/var/log/myapp.log"
```

### 3. Configure Server Identifier

> [!IMPORTANT]
> **Use IP address, not hostname!**

```bash
sudo nano /etc/systemd/system/log-agent.service
```

Update this line:
```ini
Environment="SERVER_ID=192.168.100.113"
```

Then reload:
```bash
sudo systemctl daemon-reload
sudo systemctl restart log-agent
```

### 4. Verify

```bash
# Check status
sudo systemctl status log-agent

# Watch for success messages
sudo journalctl -u log-agent -f
# Should see: ✅ Sent X lines.
```

---

## 🚀 Quick Start (Windows)

### 1. Transfer Scripts to Remote Server

**Using SCP** (from dashboard server):
```powershell
# In PowerShell on your local machine
scp -r /var/www/MYSLT-DASHBOARD/Scripts administrator@[REMOTE_IP]:C:\temp\
```

### 2. Install Agent

Run **PowerShell as Administrator**:
```powershell
cd C:\temp\Scripts

# Simple installation
# IMPORTANT: -ServerId MUST be the IP address of the Windows server!
.\install-agent.ps1 -DashboardUrl "http://[DASHBOARD_IP]:5001/api/logs/ingest" -ServerId "[WINDOWS_IP]" -LogFilePath "C:\Path\To\Your\Log.log"

# With simulator (for testing)
.\install-agent.ps1 -DashboardUrl "http://[DASHBOARD_IP]:5001/api/logs/ingest" -ServerId "192.168.100.114" -LogFilePath "C:\Logs\test.log" -WithSimulator
```

### 3. Verify

```powershell
# Check if Scheduled Tasks are running
Get-ScheduledTask -TaskName "MySLT-*"

# Watch simulator logs (if installed)
Get-Content -Path "C:\Logs\test.log" -Wait
```

---

## 📡 SNMP Monitoring (Windows)

To monitor system metrics (CPU, RAM, Disk) on a Windows server:

1. Copy `setup-snmp-windows.ps1` to the server.
2. Run **PowerShell as Administrator**.
3. Execute:
```powershell
.\setup-snmp-windows.ps1 -MonitoringServer "[DASHBOARD_IP]"
```
4. Follow the interactive prompts to complete the setup.

---

## 📊 Management Commands

| Command | Purpose |
|---------|---------|
| `sudo systemctl status log-agent` | [Linux] Check agent status |
| `Get-ScheduledTask -TaskName "MySLT-*"` | [Windows] Check agent status |
| `sudo journalctl -u log-agent -f` | [Linux] Watch agent logs |
| `Get-Content -Path "C:\Logs\test.log" -Wait` | [Windows] Watch logs |
| `Unregister-ScheduledTask -TaskName "MySLT-*" -Confirm:$false` | [Windows] Remove tasks |

---

## 🛡️ Resource Safety

- **Agent**: Only active when log file changes (~1-2% CPU)
- **Simulator**: Generates ~1 log every 10 seconds.
- **Network**: Logs batched (default 50 lines) before sending.
- **Encoding**: Scripts are ASCII-only to prevent parsing issues in diverse environments.

---

## 🔧 Troubleshooting (General)

### Agent not sending?
1. **Check Logs**: Verify the agent says `[OK] Sent X lines`.
2. **Server ID**: Ensure `ServerId` is the IP address, not the hostname.
3. **Connectivity**: Run `Test-NetConnection -ComputerName [DASHBOARD_IP] -Port 5001` on Windows.
4. **Manual Test**:
   ```bash
   curl -X POST http://[DASHBOARD_IP]:5001/api/logs/ingest \
     -H "Content-Type: application/json" \
     -d '{"serverIdentifier":"TEST","logs":["test"]}'
   ```

---

## 🪟 Troubleshooting (Windows Specific)

### 1. "Missing terminator: '" or "TerminatorExpectedAtEndOfString"
*   **Cause**: PowerShell parser issue, often due to non-ASCII characters (emojis) or encoding mismatches.
*   **Fix**: Use the latest ASCII-only versions of the scripts. Avoid direct string interpolation with complex nested quotes.

### 2. "Process cannot access the file because it is being used by another process"
*   **Cause**: The Simulator and Agent are trying to access the log file at the same time without shared permissions.
*   **Fix**: The latest `simulate-logs.ps1` uses .NET `FileStream` with `[System.IO.FileShare]::ReadWrite` to allow the Agent to read while the Simulator writes.

### 3. "Get-Content : Cannot find path because it does not exist"
*   **Cause**: The background tasks haven't started or crashed before creating the log directory.
*   **Fix**: Run the installer as Administrator. If it still fails, check the "Operation History" in Task Scheduler for the "MySLT-Log-Simulator" task.

### 4. Registered but not showing on Dashboard
*   **Cause**: Mismatch between the `ServerId` sent by the agent and the IP registered in the dashboard.
*   **Fix**: Re-run `install-agent.ps1` and explicitly set `-ServerId` to the Windows server's IP (e.g., `192.168.100.114`).

---

**For complete documentation**: [MULTI_SERVER_LOG_MONITORING.md](../MULTI_SERVER_LOG_MONITORING.md)

