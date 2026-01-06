#!/bin/bash

# ==============================================================
# 🚀 MySLT Universal Log Agent Installer
# ==============================================================

# Default Configuration
DASHBOARD_URL="http://192.168.100.137:5001/api/logs/ingest" # Update to your production URL
SERVER_ID=$(hostname)
LOG_FILE_PATH="/var/www/MYSLT-DASHBOARD/Server/filtered-log.txt"
INSTALL_DIR="/usr/local/bin"

usage() {
    echo "Usage: sudo $0 [options]"
    echo "Options:"
    echo "  --url <url>       Dashboard Ingestion URL (default: $DASHBOARD_URL)"
    echo "  --id <id>         Server Identifier (default: $SERVER_ID)"
    echo "  --path <path>     Log file path to watch (default: $LOG_FILE_PATH)"
    echo "  --with-simulator  Enable the log simulator service as well"
    echo ""
    exit 1
}

# Parse arguments
WITH_SIMULATOR=false
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --url) DASHBOARD_URL="$2"; shift ;;
        --id) SERVER_ID="$2"; shift ;;
        --path) LOG_FILE_PATH="$2"; shift ;;
        --with-simulator) WITH_SIMULATOR=true ;;
        -h|--help) usage ;;
        *) echo "Unknown parameter: $1"; usage ;;
    esac
    shift
done

echo "--------------------------------------------------------"
echo "🛠️  Starting Universal Log Agent Installation"
echo "--------------------------------------------------------"
echo "📡 Dashboard: $DASHBOARD_URL"
echo "🆔 Server ID: $SERVER_ID"
echo "📝 Log Path:  $LOG_FILE_PATH"
echo "--------------------------------------------------------"

# 1. Check for dependencies
if ! command -v jq &> /dev/null; then
    echo "📦 Installing jq..."
    if command -v yum &> /dev/null; then sudo yum install -y jq
    elif command -v apt-get &> /dev/null; then sudo apt-get update && sudo apt-get install -y jq
    fi
fi

# 2. Copy scripts to /usr/local/bin
echo "📂 Copying scripts..."
for script in "log-agent.sh" "simulate-logs.sh"; do
    if [ -f "$script" ]; then sudo cp "$script" "$INSTALL_DIR/"
    elif [ -f "Scripts/$script" ]; then sudo cp "Scripts/$script" "$INSTALL_DIR/"
    fi
    sudo chmod +x "$INSTALL_DIR/$script"
done

# 3. Create Log Agent Service
echo "⚙️  Configuring Log Agent Service..."
sudo bash -c "cat > /etc/systemd/system/log-agent.service <<EOF
[Unit]
Description=MySLT Log Monitoring Agent
After=network.target

[Service]
Type=simple
User=$(whoami)
Environment=\"DASHBOARD_URL=$DASHBOARD_URL\"
Environment=\"SERVER_ID=$SERVER_ID\"
Environment=\"LOG_FILE_PATH=$LOG_FILE_PATH\"
ExecStart=$INSTALL_DIR/log-agent.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF"

# 4. Create Log Simulator Service (Optional)
if [ "$WITH_SIMULATOR" = true ]; then
    echo "⚙️  Configuring Log Simulator Service..."
    sudo bash -c "cat > /etc/systemd/system/log-simulator.service <<EOF
[Unit]
Description=MySLT Log Simulator
After=network.target

[Service]
Type=simple
User=$(whoami)
ExecStart=$INSTALL_DIR/simulate-logs.sh $LOG_FILE_PATH 10
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF"
    sudo systemctl enable log-simulator
    sudo systemctl restart log-simulator
fi

# 5. Start Agent
echo "🔄 Starting Log Agent..."
sudo systemctl daemon-reload
sudo systemctl enable log-agent
sudo systemctl restart log-agent

echo "--------------------------------------------------------"
echo "✅ Installation Complete!"
echo "--------------------------------------------------------"
sudo systemctl status log-agent --no-pager | grep "Active:"
if [ "$WITH_SIMULATOR" = true ]; then
    sudo systemctl status log-simulator --no-pager | grep "Active:"
fi
echo "--------------------------------------------------------"
