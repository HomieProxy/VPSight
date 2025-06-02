#!/bin/bash
# VPSight Agent Installation Script
# Usage: curl -sSL https://your-vpsight-url.com/install_agent.sh | sudo bash -s YOUR_SECRET_CODE

echo "VPSight Agent Installer"
echo "-----------------------"

SECRET_CODE=$1

if [ -z "$SECRET_CODE" ]; then
  echo "Error: Secret code not provided."
  echo "Usage example: ... | sudo bash -s YOUR_SECRET_CODE_HERE"
  exit 1
fi

# 1. Check for root privileges
if [ "$(id -u)" -ne 0 ]; then
  echo "Error: This script must be run as root. Please use sudo."
  exit 1
fi

AGENT_DIR="/opt/vpsight-agent"
AGENT_SCRIPT_NAME="vpsight_agent.sh"
AGENT_LOG_FILE="$AGENT_DIR/agent.log"
SERVICE_NAME="vpsight-agent"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"

echo "Installing VPSight Agent..."
echo "Secret Code provided (for agent configuration)." # Avoid printing the actual code in production logs if sensitive

# 2. Create agent directory
mkdir -p "$AGENT_DIR"
echo "Agent directory created at $AGENT_DIR"

# 3. Create the agent script (conceptual)
# In a real scenario, this would download a pre-compiled binary or a more complex script.
cat << EOF > "$AGENT_DIR/$AGENT_SCRIPT_NAME"
#!/bin/bash
# VPSight Agent (Conceptual Script)

API_ENDPOINT="https://your-vpsight-api-endpoint.com/metrics" # Replace with your actual API endpoint
AGENT_SECRET_CODE="$SECRET_CODE"

log_message() {
  echo "\$(date '+%Y-%m-%d %H:%M:%S') - \$1"
}

collect_and_send_data() {
  log_message "Collecting data..."
  HOSTNAME=\$(hostname)

  # --- Collect System Info (Example) ---
  SYSTEM_INFO=\$(cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d'"' -f2 || echo "Linux")
  KERNEL_ARCH=\$(uname -m)
  VIRT_TYPE=\$(systemd-detect-virt 2>/dev/null || echo "unknown")
  SYSTEM_STR="\$SYSTEM_INFO [\$VIRT_TYPE:\$KERNEL_ARCH]"

  # --- Collect CPU Info (Example) ---
  CPU_MODEL=\$(grep "model name" /proc/cpuinfo | head -n1 | awk -F: '{print \$2}' | sed 's/^[ \t]*//' || echo "Generic CPU")
  CPU_CORES=\$(nproc || echo 1)
  # CPU_USAGE: Complex. Using 'top' for a snapshot. Average over time is better.
  CPU_USAGE_RAW=\$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - \$1}')
  CPU_USAGE=\$(printf "%.2f" "\$CPU_USAGE_RAW" || echo 0)

  # --- Collect Disk Info (Example for root '/') ---
  DISK_STATS=\$(df -P / | awk 'NR==2 {print \$3 " " \$2 " " \$5}') # Used Total Percentage(XX%)
  DISK_USED_KB=\$(echo \$DISK_STATS | awk '{print \$1}')
  DISK_TOTAL_KB=\$(echo \$DISK_STATS | awk '{print \$2}')
  DISK_PERCENTAGE_STR=\$(echo \$DISK_STATS | awk '{print \$3}')
  DISK_USED=\$(numfmt --to=iec --suffix=B --format="%.2f" \$((\$DISK_USED_KB * 1024)) || echo "0G")
  DISK_TOTAL=\$(numfmt --to=iec --suffix=B --format="%.2f" \$((\$DISK_TOTAL_KB * 1024)) || echo "0G")
  DISK_PERCENTAGE=\$(echo \$DISK_PERCENTAGE_STR | tr -d '()%')


  # --- Collect RAM Info (Example) ---
  MEM_INFO=\$(free -b | awk 'NR==2{print \$3 " " \$2}') # Used Total
  RAM_USED_BYTES=\$(echo \$MEM_INFO | awk '{print \$1}')
  RAM_TOTAL_BYTES=\$(echo \$MEM_INFO | awk '{print \$2}')
  RAM_USED=\$(numfmt --to=iec --suffix=B --format="%.2f" \$RAM_USED_BYTES || echo "0M")
  RAM_TOTAL=\$(numfmt --to=iec --suffix=B --format="%.2f" \$RAM_TOTAL_BYTES || echo "0M")
  RAM_PERCENTAGE=0
  if [ "\$RAM_TOTAL_BYTES" -ne 0 ]; then
    RAM_PERCENTAGE=\$(awk "BEGIN {printf \"%.2f\", (\$RAM_USED_BYTES / \$RAM_TOTAL_BYTES) * 100}")
  fi

  # --- Collect Swap Info (Example) ---
  SWAP_TOTAL_BYTES=\$(free -b | awk 'NR==3{print \$2}')
  SWAP_STATUS="OFF"
  SWAP_PERCENTAGE=0
  if [ "\$SWAP_TOTAL_BYTES" -ne 0 ]; then
    SWAP_USED_BYTES=\$(free -b | awk 'NR==3{print \$3}')
    SWAP_USED_STR=\$(numfmt --to=iec --suffix=B --format="%.2f" \$SWAP_USED_BYTES)
    SWAP_TOTAL_STR=\$(numfmt --to=iec --suffix=B --format="%.2f" \$SWAP_TOTAL_BYTES)
    SWAP_PERCENTAGE=\$(awk "BEGIN {printf \"%.2f\", (\$SWAP_USED_BYTES / \$SWAP_TOTAL_BYTES) * 100}")
    SWAP_STATUS="\$SWAP_USED_STR / \$SWAP_TOTAL_STR (\$SWAP_PERCENTAGE%)"
  fi

  # --- Network Usage (Placeholder - complex to track accurately without tools like vnStat) ---
  TOTAL_IN="N/A"
  TOTAL_OUT="N/A"
  MONTH_IN="N/A"
  MONTH_OUT="N/A"

  # --- Load Average ---
  LOAD_AVG_RAW=\$(uptime | awk -F'load average: ' '{print \$2}')
  LOAD_AVG_1=\$(echo \$LOAD_AVG_RAW | awk -F, '{print \$1}' | sed 's/ //g')
  LOAD_AVG_5=\$(echo \$LOAD_AVG_RAW | awk -F, '{print \$2}' | sed 's/ //g')
  LOAD_AVG_15=\$(echo \$LOAD_AVG_RAW | awk -F, '{print \$3}' | sed 's/ //g')

  # --- Process Count ---
  PROCESS_COUNT=\$(ps -e --no-headers | wc -l)

  # --- Connection Count ---
  TCP_COUNT=\$(ss -tna | grep -c ESTAB || echo 0)
  UDP_COUNT=\$(ss -luna | wc -l || echo 0) # Counts listening UDP sockets, adjust as needed

  # --- Boot Time ---
  BOOT_TIME_ISO=\$(uptime -s | sed 's/ /T/' | awk '{print \$1 "Z"}')

  # --- Last Active (current time for agent) ---
  LAST_ACTIVE_ISO=\$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  JSON_PAYLOAD=$(cat <<PAYLOAD_EOF
  {
    "id": "\$HOSTNAME-\$AGENT_SECRET_CODE",
    "name": "\$HOSTNAME",
    "system": "\$SYSTEM_STR",
    "cpu": { "model": "\$CPU_MODEL", "cores": \$CPU_CORES, "usage": \$(echo \$CPU_USAGE) },
    "disk": { "used": "\$DISK_USED", "total": "\$DISK_TOTAL", "percentage": \$(echo \$DISK_PERCENTAGE:-0) },
    "ram": { "used": "\$RAM_USED", "total": "\$RAM_TOTAL", "percentage": \$(echo \$RAM_PERCENTAGE:-0) },
    "swap": { "status": "\$SWAP_STATUS", "percentage": \$(echo \$SWAP_PERCENTAGE:-0) },
    "network": { "totalIn": "\$TOTAL_IN", "totalOut": "\$TOTAL_OUT", "currentMonthIn": "\$MONTH_IN", "currentMonthOut": "\$MONTH_OUT" },
    "loadAverage": [\$(echo \$LOAD_AVG_1:-0), \$(echo \$LOAD_AVG_5:-0), \$(echo \$LOAD_AVG_15:-0)],
    "processCount": \$PROCESS_COUNT,
    "connections": { "tcp": \$TCP_COUNT, "udp": \$UDP_COUNT },
    "bootTime": "\$BOOT_TIME_ISO",
    "lastActive": "\$LAST_ACTIVE_ISO"
  }
PAYLOAD_EOF
  )

  log_message "Payload: \$JSON_PAYLOAD"
  # In a real agent, send this data:
  # RESPONSE=\$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer \$AGENT_SECRET_CODE" -d "\$JSON_PAYLOAD" "\$API_ENDPOINT")
  # log_message "API Response: \$RESPONSE"
  log_message "Data collection cycle complete (simulated send)."
}

log_message "VPSight Agent started. Secret: [REDACTED]"
while true; do
  collect_and_send_data
  log_message "Sleeping for 60 seconds..."
  sleep 60
done
EOF

chmod +x "$AGENT_DIR/$AGENT_SCRIPT_NAME"
echo "Agent script created at $AGENT_DIR/$AGENT_SCRIPT_NAME"

# 4. Set up systemd service
echo "Setting up systemd service..."
cat << EOF > "$SERVICE_FILE"
[Unit]
Description=VPSight Monitoring Agent
After=network.target

[Service]
ExecStart=$AGENT_DIR/$AGENT_SCRIPT_NAME
Restart=always
User=root # Consider running as a less privileged user if possible
StandardOutput=append:$AGENT_LOG_FILE
StandardError=append:$AGENT_LOG_FILE
Environment="SECRET_CODE=$SECRET_CODE"

[Install]
WantedBy=multi-user.target
EOF

echo "Systemd service file created at $SERVICE_FILE"

# 5. Enable and start the service
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

if systemctl is-active --quiet $SERVICE_NAME; then
  echo "VPSight Agent service started and enabled successfully."
  echo "Logs can be found at $AGENT_LOG_FILE"
else
  echo "Error: VPSight Agent service failed to start. Check logs:"
  echo "sudo journalctl -u $SERVICE_NAME"
  echo "cat $AGENT_LOG_FILE"
fi

echo "Installation complete."
