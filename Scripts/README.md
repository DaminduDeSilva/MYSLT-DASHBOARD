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

## 🧪 Log Simulator (For Testing)

The `simulate-logs.sh` script generates mock log entries to help test the pipeline on servers that don't have active applications.

### 1. Usage
```bash
# ./simulate-logs.sh [log_file_path] [interval_seconds]
./simulate-logs.sh ./filtered-log.txt 10
```

### 2. Resource Safety 🛡️
The simulator is designed to be extremely lightweight:
- **Default Interval**: 10 seconds (Approx 6 logs/minute).
- **Disk Impact**: ~430 KB per day.
- **CPU/RAM**: Negligible (uses standard sleep and echo).
- **Batching**: The log-agent will batch these logs, so it only sends data to the dashboard once every ~100 seconds (if batch size is 10).

> [!TIP]
> To stop the simulation, simply run `sudo systemctl stop log-simulator` (if installed as a service).
