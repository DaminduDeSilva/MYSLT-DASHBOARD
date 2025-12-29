#!/bin/bash

# ==============================================================
# 🚀 MySLT Log Simulator
# ==============================================================

# Configuration
LOG_FILE_PATH=${1:-"./filtered-log.txt"}
INTERVAL=${2:-5} # Seconds between logs

echo "--------------------------------------------------------"
echo "🚀 Starting Log Simulator"
echo "📝 Writing to: $LOG_FILE_PATH"
echo "⏱️  Interval: $INTERVAL seconds"
echo "--------------------------------------------------------"

# Ensure directory exists
mkdir -p "$(dirname "$LOG_FILE_PATH")"
touch "$LOG_FILE_PATH"

# Log generation loop
while true; do
    TIMESTAMP=$(date +%s%3N)
    METHODS=("MOBILE" "DESKTOP" "WEB")
    EMAILS=("user1@example.com" "user2@gmail.com" "test_customer@slt.lk")
    STATUSES=("Information" "Warning" "Error" "Critical")
    APIS=("A01" "A02" "A03" "A04" "A05")
    
    # Pick random values
    METHOD=${METHODS[$RANDOM % ${#METHODS[@]}]}
    EMAIL=${EMAILS[$RANDOM % ${#EMAILS[@]}]}
    STATUS=${STATUSES[$RANDOM % ${#STATUSES[@]}]}
    API=${APIS[$RANDOM % ${#APIS[@]}]}
    RESP_TIME=$((100 + RANDOM % 900))
    END_TIMESTAMP=$((TIMESTAMP + RESP_TIME))
    
    # Format: startTimestamp,accessMethod,customerEmail,status,apiNumber,,endTimestamp,responseTime,serverIdentifier
    LOG_LINE="$TIMESTAMP,$METHOD,$EMAIL,$STATUS,$API,,$END_TIMESTAMP,$RESP_TIME,"
    
    echo "$LOG_LINE" >> "$LOG_FILE_PATH"
    echo "✅ [$(date +%T)] Generated: $API ($STATUS) for $EMAIL"
    
    sleep "$INTERVAL"
done
