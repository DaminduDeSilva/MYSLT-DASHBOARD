# MySLT Dashboard Log Agents

This directory contains the agents and scripts needed to forward logs from remote servers to the MySLT Dashboard.

## 📁 Files
- `log-agent.sh`: Agent for Linux (Rocky Linux, Ubuntu, Debian, etc.)
- `log-agent.ps1`: Agent for Windows
- `test-ingestion.js`: Helper script to test the ingestion API (Node.js)

## 📦 Linux Setup (Bash)

The Linux agent uses `tail -F` to watch a log file and `curl` to send batches of logs to the dashboard.

### 1. Requirements
- `curl`
- `jq` (optional, but recommended for better parsing)
- `systemd` (for running as a service)

### 2. Manual Installation
1.  Copy `log-agent.sh` to the remote server.
2.  Set environment variables:
    ```bash
    export DASHBOARD_URL="http://[DASHBOARD_IP]:5001/api/logs/ingest"
    export SERVER_ID="MY_SERVER_01"
    export LOG_FILE_PATH="/var/log/myapp.log"
    ./log-agent.sh
    ```

### 3. Run as a Service (Recommended)
Create a service file at `/etc/systemd/system/log-agent.service`:
```ini
[Unit]
Description=MySLT Log Monitoring Agent
After=network.target

[Service]
Type=simple
User=dpd
Environment="DASHBOARD_URL=http://[DASHBOARD_IP]:5001/api/logs/ingest"
Environment="SERVER_ID=MY_SERVER_01"
Environment="LOG_FILE_PATH=/var/log/myapp.log"
ExecStart=/usr/local/bin/log-agent.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## 📦 Windows Setup (PowerShell)

The Windows agent uses a .NET `StreamReader` to efficiently tail a log file.

### 1. Manual Execution
Edit the variables at the top of `log-agent.ps1` or pass them via environment variables:
```powershell
$env:DASHBOARD_URL="http://[DASHBOARD_IP]:5001/api/logs/ingest"
$env:SERVER_ID="WINDOWS_SERVER_01"
$env:LOG_FILE_PATH="C:\Logs\app.log"
.\log-agent.ps1
```

### 2. Run as a Scheduled Task
To run in the background, set up a Windows Scheduled Task to trigger "At startup" or "At logon" running `powershell.exe -ExecutionPolicy Bypass -File C:\Path\To\log-agent.ps1`.
