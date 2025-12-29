#!/bin/bash

# ==============================================================
# 🚀 MySLT Log Agent Setup - Server 192.168.100.113
# ==============================================================

# Configuration
DASHBOARD_URL="http://124.43.216.137:5001/api/logs/ingest"
SERVER_ID="LINUX_SRV_113"
LOG_FILE_PATH="/var/www/MYSLT-DASHBOARD/Server/filtered-log.txt" # Adjust if different on that server
AGENT_PATH="/usr/local/bin/log-agent.sh"
SERVICE_FILE="/etc/systemd/system/log-agent.service"

echo "--------------------------------------------------------"
echo "🛠️  Starting Log Agent Setup for $SERVER_ID"
echo "--------------------------------------------------------"

# 1. Check for dependencies
echo "📦 Checking dependencies..."
if ! command -v jq &> /dev/null; then
    echo "Installing jq..."
    sudo yum install -y jq || sudo apt-get install -y jq
fi

# 2. Copy agent script to local bin
echo "📂 Copying agent script..."
# Assumes this script is run from the project root or Scripts folder where log-agent.sh exists
if [ -f "log-agent.sh" ]; then
    sudo cp log-agent.sh $AGENT_PATH
elif [ -f "Scripts/log-agent.sh" ]; then
    sudo cp Scripts/log-agent.sh $AGENT_PATH
else
    echo "❌ Error: log-agent.sh not found in current directory or Scripts/ folder."
    exit 1
fi
sudo chmod +x $AGENT_PATH

# 3. Create systemd service file
echo "⚙️  Creating systemd service..."
sudo bash -c "cat > $SERVICE_FILE <<EOF
[Unit]
Description=MySLT Log Monitoring Agent
After=network.target

[Service]
Type=simple
User=dpd
Environment=\"DASHBOARD_URL=$DASHBOARD_URL\"
Environment=\"SERVER_ID=$SERVER_ID\"
Environment=\"LOG_FILE_PATH=$LOG_FILE_PATH\"
ExecStart=$AGENT_PATH
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF"

# 4. Reload systemd and start service
echo "🔄 Starting service..."
sudo systemctl daemon-reload
sudo systemctl enable log-agent
sudo systemctl restart log-agent

# 5. Verify status
echo "--------------------------------------------------------"
echo "✅ Setup Complete!"
echo "--------------------------------------------------------"
sudo systemctl status log-agent --no-pager | grep "Active:"
echo "--------------------------------------------------------"
echo "📡 Sending logs to: $DASHBOARD_URL"
echo "📝 Watching logs at: $LOG_FILE_PATH"
echo "--------------------------------------------------------"
