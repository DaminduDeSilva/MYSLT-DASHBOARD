#!/bin/bash

# MySLT Log Forwarding Agent (Linux)
# This script watches a log file and sends new lines to the Dashboard API.

# Configuration (can be overridden by environment variables)
DASHBOARD_URL=${DASHBOARD_URL:-"http://localhost:5000/api/logs/ingest"}
SERVER_ID=${SERVER_ID:-"LINUX_SERVER"}
LOG_FILE_PATH=${LOG_FILE_PATH:-"/var/www/MYSLT-DASHBOARD/Server/filtered-log.txt"}
BATCH_SIZE=${BATCH_SIZE:-50}
SLEEP_INTERVAL=${SLEEP_INTERVAL:-5}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 MySLT Log Agent starting..."
echo "📡 Dashboard: $DASHBOARD_URL"
echo "🆔 Server ID: $SERVER_ID"
echo "📂 Log File:  $LOG_FILE_PATH"
echo "📦 Batch Size: $BATCH_SIZE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f "$LOG_FILE_PATH" ]; then
    echo "❌ Error: Log file not found at $LOG_FILE_PATH"
    exit 1
fi

# Buffer for batching
log_buffer=()

send_batch() {
    if [ ${#log_buffer[@]} -gt 0 ]; then
        # Create JSON payload
        # Convert array to JSON array of strings
        json_logs=$(printf '%s\n' "${log_buffer[@]}" | jq -R . | jq -s .)
        
        payload=$(cat <<EOF
{
  "serverIdentifier": "$SERVER_ID",
  "logs": $json_logs
}
EOF
)
        # Send to API
        response=$(curl -s -X POST -H "Content-Type: application/json" -d "$payload" "$DASHBOARD_URL")
        
        if [[ $response == *"success\":true"* ]]; then
            echo "✅ Sent ${#log_buffer[@]} lines."
            log_buffer=()
        else
            echo "❌ Failed to send logs: $response"
            # Keep buffer to retry next time (simple retry logic)
        fi
    fi
}

# Use tail to watch the file
tail -F "$LOG_FILE_PATH" | while read -r line; do
    log_buffer+=("$line")
    
    # Send if batch size reached
    if [ ${#log_buffer[@]} -ge "$BATCH_SIZE" ]; then
        send_batch
    fi
done &

# Periodic flush every SLEEP_INTERVAL seconds if there are pending logs
while true; do
    sleep "$SLEEP_INTERVAL"
    send_batch
done
