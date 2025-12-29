# MySLT Dashboard Log Agents 🚀

Universal agents and installers to forward logs from **any** remote server to the MySLT Dashboard.

> [!TIP]
> For complete implementation details, troubleshooting, and architecture overview, see **[MULTI_SERVER_LOG_MONITORING.md](../MULTI_SERVER_LOG_MONITORING.md)**

## 📁 Core Files
- `install-agent.sh` - **Universal Installer** for Linux
- `log-agent.sh` - Linux log-watcher agent
- `simulate-logs.sh` - Mock log generator (for testing)
- `log-agent.ps1` - Windows agent

---

## 🚀 Quick Start (Linux)

### 1. Transfer Scripts to Remote Server

**Using SCP** (from dashboard server):
```bash
scp -P 3501 -r /var/www/MYSLT-DASHBOARD/Scripts dpd@[REMOTE_IP]:/home/dpd/
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

## 📊 Management Commands

| Command | Purpose |
|---------|---------|
| `sudo systemctl status log-agent` | Check agent status |
| `sudo systemctl stop log-simulator` | Stop simulator |
| `sudo journalctl -u log-agent -f` | Watch agent logs live |
| `sudo systemctl restart log-agent` | Restart agent |

---

## 🛡️ Resource Safety

- **Agent**: Only active when log file changes (~1-2% CPU)
- **Simulator**: 1 log every 10 seconds (~430KB/day, negligible CPU)
- **Network**: Logs batched (default 50 lines) before sending

---

## 🔧 Troubleshooting

### Agent not sending?
```bash
# Check logs for errors
sudo journalctl -u log-agent -n 50

# Verify SERVER_ID is IP address
sudo systemctl cat log-agent | grep SERVER_ID

# Test connectivity
curl -X POST http://192.168.100.137:5001/api/logs/ingest \
  -H "Content-Type: application/json" \
  -d '{"serverIdentifier":"TEST","logs":["test"]}'
```

### Dashboard not showing data?
1. Verify SERVER_ID uses IP format (not hostname)
2. Check firewall: `sudo firewall-cmd --list-ports | grep 5001`
3. Restart backend: `pm2 restart myslt-backend`

**For detailed troubleshooting**, see [MULTI_SERVER_LOG_MONITORING.md](../MULTI_SERVER_LOG_MONITORING.md#-quick-troubleshooting)

---

## 📚 Advanced Configuration

### Custom Batch Size
```bash
sudo systemctl edit log-agent
```
Add:
```ini
[Service]
Environment="BATCH_SIZE=10"
```

### Custom Dashboard URL
```bash
sudo ./install-agent.sh \
  --url "http://YOUR_IP:5001/api/logs/ingest" \
  --id "192.168.100.113" \
  --path "/var/log/app.log"
```

---

**For complete documentation**: [MULTI_SERVER_LOG_MONITORING.md](../MULTI_SERVER_LOG_MONITORING.md)
