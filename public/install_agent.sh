
#!/bin/bash

# VPSight Agent Installation Script

# Ensure a secret code is provided
if [ -z "$1" ]; then
  echo "Error: No secret code provided."
  echo "Usage: $0 YOUR_SECRET_CODE"
  exit 1
fi

SECRET_CODE="$1"
YOUR_APP_URL="${NEXT_PUBLIC_APP_URL:-http://your-vpsight-app.com}" # Replace with your actual app URL or use env var

echo "VPSight Agent Installer"
echo "======================="
echo "Secret Code: $SECRET_CODE"
echo "Target App URL: $YOUR_APP_URL"
echo ""

# --- Simulate Agent Installation ---
echo "[1/5] Checking prerequisites (curl, sudo)..."
if ! command -v curl &> /dev/null; then
    echo "Error: curl is not installed. Please install curl and try again."
    exit 1
fi
if ! command -v sudo &> /dev/null && [ "$(id -u)" -ne 0 ]; then
    echo "Error: sudo is not installed or you are not root. Please run with sudo or as root."
    # exit 1 # Commenting out exit for easier testing, uncomment for production
fi
echo "Prerequisites check passed."
sleep 1

echo "[2/5] Fetching IP Addresses..."
# Attempt to get IPv4
IPV4=$(curl -s -4 https://ifconfig.co || curl -s -4 https://api.ipify.org || curl -s -4 https://icanhazip.com || echo "N/A")
# Attempt to get IPv6 (allow failure if no IPv6)
IPV6=$(curl -s -6 https://ifconfig.co || curl -s -6 https://api64.ipify.org || curl -s -6 https://icanhazip.com || echo "N/A")

echo "   IPv4 Address: $IPV4"
echo "   IPv6 Address: $IPV6"
sleep 1

echo "[3/5] Downloading agent binary (simulated)..."
# Placeholder for actual download command
# mkdir -p /opt/vpsight_agent
# curl -sSL $YOUR_APP_URL/downloads/vpsight_agent_linux_amd64 -o /opt/vpsight_agent/vpsight-agent
# chmod +x /opt/vpsight_agent/vpsight-agent
echo "Agent binary downloaded (simulated)."
sleep 1

echo "[4/5] Configuring agent with secret and IPs (simulated)..."
# Placeholder for configuration steps
# echo "SECRET_KEY=$SECRET_CODE" > /etc/vpsight_agent.conf
# echo "REPORT_URL=$YOUR_APP_URL/api/agent/report" >> /etc/vpsight_agent.conf
echo "Agent configured (simulated)."

# Placeholder for how an agent might report its IP initially
# This endpoint /api/agent/report_ip needs to be implemented in your Next.js app
if [ "$IPV4" != "N/A" ] || [ "$IPV6" != "N/A" ]; then
  echo ""
  echo "To report IP address(es) to the server, the agent would typically make a request like this:"
  echo "curl -X POST -H \"Content-Type: application/json\" \\"
  echo "     -d '{\"secret\": \"$SECRET_CODE\", \"ipv4\": \"$IPV4\", \"ipv6\": \"$IPV6\"}' \\"
  echo "     $YOUR_APP_URL/api/agent/report_ip"
  echo "(This is a placeholder; ensure the /api/agent/report_ip endpoint is implemented in your app)"
  echo ""
fi
sleep 1

echo "[5/5] Setting up agent service (simulated)..."
# Placeholder for systemd service creation or other init system
# cp $YOUR_APP_URL/agent_service_files/vpsight-agent.service /etc/systemd/system/
# sudo systemctl daemon-reload
# sudo systemctl enable vpsight-agent
# sudo systemctl start vpsight-agent
echo "Agent service set up and started (simulated)."
sleep 1

echo ""
echo "VPSight Agent installation (simulated) complete!"
echo "The agent should now be collecting data and reporting to $YOUR_APP_URL."
echo "Make sure to implement the necessary API endpoints in your VPSight application."

exit 0
