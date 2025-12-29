#!/bin/bash

# ==============================================================
# 🚀 MySLT Log Agent Setup - Server 192.168.100.113
# ==============================================================

# Configuration
DASHBOARD_URL="http://124.43.216.137:5001/api/logs/ingest"
SERVER_ID="LINUX_SRV_113"
LOG_FILE_PATH="/var/www/MYSLT-DASHBOARD/Server/filtered-log.txt" 
AGENT_PATH="/usr/local/bin/log-agent.sh"
SIMULATOR_PATH="/usr/local/bin/simulate-logs.sh"
AGENT_SERVICE="/etc/systemd/system/log-agent.service"
SIMULATOR_SERVICE="/etc/systemd/system/log-simulator.service"

echo "--------------------------------------------------------"
echo "🛠️  Starting Log Agent & Simulator Setup for $SERVER_ID"
echo "--------------------------------------------------------"

# 1. Check for dependencies
echo "📦 Checking dependencies..."
if ! command -v jq &> /dev/null; then
    echo "Installing jq..."
    sudo yum install -y jq || sudo apt-get install -y jq
fi

# 2. Copy scripts
echo "📂 Copying scripts..."
# Agent
if [ -f "log-agent.sh" ]; then
    sudo cp log-agent.sh $AGENT_PATH
elif [ -f "Scripts/log-agent.sh" ]; then
    sudo cp Scripts/log-agent.sh $AGENT_PATH
fi
sudo chmod +x $AGENT_PATH

# Simulator
if [ -f "simulate-logs.sh" ]; then
    sudo cp simulate-logs.sh $SIMULATOR_PATH
elif [ -f "Scripts/simulate-logs.sh" ]; then
    sudo cp Scripts/simulate-logs.sh $SIMULATOR_PATH
fi
sudo chmod +x $SIMULATOR_PATH

# 3. Create Log Agent service
echo "⚙️  Creating log-agent service..."
sudo bash -c "cat > $AGENT_SERVICE <<EOF
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

# 4. Create Log Simulator service
echo "⚙️  Creating log-simulator service..."
sudo bash -c "cat > $SIMULATOR_SERVICE <<EOF
[Unit]
Description=MySLT Log Simulator
After=network.target

[Service]
Type=simple
User=dpd
ExecStart=$SIMULATOR_PATH $LOG_FILE_PATH 10
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF"

# 5. Reload systemd and start services
echo "🔄 Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable log-agent log-simulator
sudo systemctl restart log-simulator
sudo systemctl restart log-agent

# 6. Verify status
echo "--------------------------------------------------------"
echo "✅ Setup Complete!"
echo "--------------------------------------------------------"
sudo systemctl status log-agent --no-pager | grep "Active:"
sudo systemctl status log-simulator --no-pager | grep "Active:"
echo "--------------------------------------------------------"
echo "📡 Sending logs to: $DASHBOARD_URL"
echo "📝 Watching & Simulating logs at: $LOG_FILE_PATH"
echo "--------------------------------------------------------"
