# 🚀 Transition Guide: From Scripts to Fluent Bit

This guide explains how to safely stop the current agents and start using Fluent Bit for production-grade log shipping.

---

## 🐧 Linux (Server 113)

### 1. Stop the current agent
```bash
sudo systemctl stop log-agent
sudo systemctl disable log-agent
```

### 2. Install Fluent Bit (if not already done)
```bash
curl https://raw.githubusercontent.com/fluent/fluent-bit/master/install.sh | sh
```

### 3. Deploy Configuration
Run these commands from your **Dashboard Server** (137) to copy the files safely (via `/tmp` then `sudo mv`):

```bash
# 1. Copy and move the main config
scp Scripts/fluent-bit-linux.conf dpd@192.168.100.113:/tmp/ && \
ssh dpd@192.168.100.113 "sudo mv /tmp/fluent-bit-linux.conf /etc/fluent-bit/fluent-bit.conf"

# 2. Copy and move the parsers config
scp Scripts/parsers.conf dpd@192.168.100.113:/tmp/ && \
ssh dpd@192.168.100.113 "sudo mv /tmp/parsers.conf /etc/fluent-bit/parsers.conf"
```

### 4. Start Fluent Bit
```bash
sudo systemctl enable fluent-bit
sudo systemctl start fluent-bit
```

---

## 🪟 Windows (Server 114)

### 1. Stop the current agent
Open **Administrator PowerShell** and run:
```powershell
Stop-ScheduledTask -TaskName "MySLT-Log-Agent"
Unregister-ScheduledTask -TaskName "MySLT-Log-Agent" -Confirm:$false
```

### 2. Install Fluent Bit
1. Download the ZIP from [fluentbit.io](https://fluentbit.io/releases/).
2. Extract to `C:\fluent-bit`.

### 3. Deploy Configuration
Run these commands from your **Dashboard Server** (137) to copy the files:
```bash
scp Scripts/fluent-bit-windows.conf Administrator@192.168.100.114:C:\fluent-bit\etc\fluent-bit.conf
scp Scripts/parsers.conf Administrator@192.168.100.114:C:\fluent-bit\etc\parsers.conf
```

### 4. Start Fluent Bit (as a Service)
```powershell
C:\fluent-bit\bin\fluent-bit.exe -c C:\fluent-bit\etc\fluent-bit.conf --install MySLT-Fluent-Bit
Start-Service MySLT-Fluent-Bit
```

---

## 🔍 How to Verify
Check the Dashboard! Logs should start appearing immediately.
The tags in the Fluent Bit config are set to:
- Linux: `192.168.100.113`
- Windows: `192.168.100.114`

If you need to check Fluent Bit logs:
- Linux: `sudo journalctl -u fluent-bit -f`
- Windows: Check the Event Viewer or run `fluent-bit.exe` manually to see output.
