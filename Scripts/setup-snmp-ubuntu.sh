#!/bin/bash
# MySLT Dashboard - Ubuntu Server SNMP Setup Script
# Run this script on the NEW Ubuntu server you want to monitor
# Usage: sudo ./setup-snmp-ubuntu.sh

echo "🚀 MySLT Dashboard - Ubuntu Server SNMP Setup"
echo "============================================="
echo "Setting up SNMP monitoring for MySLT Dashboard"
echo "Monitoring Server: 192.168.100.137"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root. This is recommended for system configuration."
else
    print_error "This script should be run with sudo privileges."
    echo "Usage: sudo $0"
    exit 1
fi

# Detect Ubuntu version
UBUNTU_VERSION=$(lsb_release -rs 2>/dev/null)
UBUNTU_CODENAME=$(lsb_release -cs 2>/dev/null)

print_status "Detected Ubuntu $UBUNTU_VERSION ($UBUNTU_CODENAME)"

# Step 1: Update system and install SNMP
print_status "Step 1: Updating system and installing SNMP packages..."
export DEBIAN_FRONTEND=noninteractive
apt update -y > /dev/null 2>&1
apt install -y snmpd snmp snmp-mibs-downloader

if [ $? -eq 0 ]; then
    print_status "✅ SNMP packages installed successfully"
else
    print_error "❌ Failed to install SNMP packages"
    exit 1
fi

# Step 2: Download and configure MIBs
print_status "Step 2: Configuring SNMP MIBs..."
download-mibs > /dev/null 2>&1

# Comment out mibs line in snmp.conf to enable MIB loading
if [ -f /etc/snmp/snmp.conf ]; then
    sed -i 's/^mibs :/#mibs :/' /etc/snmp/snmp.conf
    print_status "✅ MIBs configured"
fi

# Step 3: Backup existing config
print_status "Step 3: Backing up existing configuration..."
if [ -f /etc/snmp/snmpd.conf ]; then
    cp /etc/snmp/snmpd.conf /etc/snmp/snmpd.conf.backup.$(date +%Y%m%d_%H%M%S)
    print_status "✅ Existing config backed up"
else
    print_status "ℹ️ No existing config found"
fi

# Step 4: Get server information
SERVER_IP=$(hostname -I | awk '{print $1}')
HOSTNAME=$(hostname)

print_status "Step 4: Server Information"
echo "   Server IP: $SERVER_IP"
echo "   Hostname: $HOSTNAME"
echo "   Ubuntu Version: $UBUNTU_VERSION"

# Step 5: Create SNMP configuration
print_status "Step 5: Creating SNMP configuration..."

cat > /etc/snmp/snmpd.conf << 'EOF'
# MySLT Dashboard SNMP Configuration - Ubuntu Server
# Auto-generated configuration for server monitoring

# =============================
# BASIC CONFIGURATION
# =============================

# Listen on all interfaces
agentAddress udp:161,udp6:[::1]:161

# Community string (change 'public' for better security)
rocommunity public default

# For enhanced security, restrict access to monitoring server only:
# rocommunity public 192.168.100.137/32

# System information
syslocation "Ubuntu Server - Production Environment"
syscontact "System Administrator <admin@company.com>"
sysservices 72

# =============================
# UCD-SNMP-MIB EXTENSIONS
# =============================

# Disk monitoring (Required for MySLT Dashboard)
disk / 10%
disk /var 10%
disk /tmp 10%
disk /home 10%
disk /usr 10%

# Load averages monitoring
load 12 10 5

# Process monitoring (Ubuntu-specific processes)
proc sshd
proc systemd
proc networkd
proc resolved
proc cron
proc rsyslog
proc apache2
proc nginx
proc mysql
proc mysqld
proc postgresql
proc docker
proc containerd
proc kubelet
proc snap

# =============================
# UBUNTU-SPECIFIC MONITORING
# =============================

# Enable all disk monitoring
includeAllDisks 10%

# Default monitors for Ubuntu
defaultMonitors yes

# Network interface monitoring
linkUpDownNotifications yes

# =============================
# ACCESS CONTROL
# =============================

# Define views
view systemonly included .1.3.6.1.2.1.1
view systemonly included .1.3.6.1.2.1.25.1
view systemonly included .1.3.6.1.4.1.2021
view all included .1 80

# Access control
access notConfigGroup "" any noauth exact all none none
access readonly "" any noauth exact systemonly none none

# Community access
com2sec readonly default public
group MyROGroup v2c readonly
access MyROGroup "" any noauth exact all none none

# =============================
# EXTENDED FEATURES
# =============================

# Enable AgentX master for extensibility
master agentx

# Extended information (Ubuntu-specific)
extend .1.3.6.1.4.1.2021.7890.1 osInfo /usr/bin/lsb_release -a
extend .1.3.6.1.4.1.2021.7890.2 kernelInfo /bin/uname -r
extend .1.3.6.1.4.1.2021.7890.3 uptimeInfo /usr/bin/uptime
extend .1.3.6.1.4.1.2021.7890.4 diskInfo /bin/df -h
extend .1.3.6.1.4.1.2021.7890.5 memInfo /usr/bin/free -h
extend .1.3.6.1.4.1.2021.7890.6 networkInfo /bin/ip addr show

EOF

print_status "✅ SNMP configuration created"

# Step 6: Configure UFW firewall
print_status "Step 6: Configuring UFW firewall..."

# Check if UFW is installed and active
if command -v ufw >/dev/null 2>&1; then
    ufw allow 161/udp > /dev/null 2>&1
    
    # Check if UFW is active
    if ufw status | grep -q "Status: active"; then
        print_status "✅ UFW firewall configured - Port 161/UDP allowed"
    else
        print_warning "⚠️ UFW installed but not active - Port 161/UDP rule added"
        echo "   To activate UFW: sudo ufw enable"
    fi
else
    print_warning "⚠️ UFW not installed - manual firewall configuration may be needed"
fi

# Step 7: Configure AppArmor (Ubuntu-specific)
print_status "Step 7: Configuring AppArmor..."
if command -v aa-status >/dev/null 2>&1; then
    # Check if AppArmor profile exists for snmpd
    if [ -f /etc/apparmor.d/usr.sbin.snmpd ]; then
        aa-complain /usr/sbin/snmpd > /dev/null 2>&1
        print_status "✅ AppArmor configured for SNMP"
    else
        print_status "ℹ️ No AppArmor profile found for snmpd"
    fi
else
    print_status "ℹ️ AppArmor not installed"
fi

# Step 8: Start and enable SNMP service
print_status "Step 8: Starting SNMP service..."
systemctl start snmpd
systemctl enable snmpd

if systemctl is-active --quiet snmpd; then
    print_status "✅ SNMP service started and enabled"
else
    print_error "❌ Failed to start SNMP service"
    systemctl status snmpd
    exit 1
fi

# Step 9: Test SNMP locally
print_status "Step 9: Testing SNMP configuration..."

echo ""
echo "🧪 Local SNMP Tests:"
echo "-------------------"

# Test system info
echo "📋 System Information:"
SYSTEM_INFO=$(snmpget -v2c -c public localhost .1.3.6.1.2.1.1.1.0 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "   ✅ $(echo $SYSTEM_INFO | cut -d: -f2- | xargs)"
else
    echo "   ❌ System info query failed"
fi

# Test CPU
echo "🖥️ CPU Information:"
CPU_RESULT=$(snmpget -v2c -c public localhost .1.3.6.1.4.1.2021.11.11.0 2>/dev/null)
if [ $? -eq 0 ]; then
    CPU_IDLE=$(echo $CPU_RESULT | grep -o '[0-9]*' | tail -1)
    CPU_USAGE=$((100 - CPU_IDLE))
    echo "   ✅ CPU Usage: ${CPU_USAGE}%"
else
    echo "   ⚠️ CPU monitoring: Will use alternative method"
fi

# Test Memory
echo "💾 Memory Information:"
MEM_RESULT=$(snmpget -v2c -c public localhost .1.3.6.1.4.1.2021.4.5.0 2>/dev/null)
if [ $? -eq 0 ]; then
    MEM_TOTAL=$(echo $MEM_RESULT | grep -o '[0-9]*' | tail -1)
    echo "   ✅ Memory Total: $((MEM_TOTAL / 1024)) MB"
    
    MEM_AVAIL=$(snmpget -v2c -c public localhost .1.3.6.1.4.1.2021.4.6.0 2>/dev/null | grep -o '[0-9]*' | tail -1)
    MEM_USED=$((MEM_TOTAL - MEM_AVAIL))
    MEM_PERCENT=$((MEM_USED * 100 / MEM_TOTAL))
    echo "   ✅ Memory Usage: ${MEM_PERCENT}%"
else
    echo "   ❌ Memory monitoring: FAILED"
fi

# Test Disk
echo "💿 Disk Information:"
DISK_RESULT=$(snmpget -v2c -c public localhost .1.3.6.1.4.1.2021.9.1.9.1 2>/dev/null)
if [ $? -eq 0 ]; then
    DISK_PERCENT=$(echo $DISK_RESULT | grep -o '[0-9]*' | tail -1)
    echo "   ✅ Root Disk Usage: ${DISK_PERCENT}%"
else
    echo "   ❌ Disk monitoring: FAILED"
fi

# Test Load
echo "📊 Load Average:"
LOAD_RESULT=$(snmpget -v2c -c public localhost .1.3.6.1.4.1.2021.10.1.3.1 2>/dev/null)
if [ $? -eq 0 ]; then
    LOAD_1MIN=$(echo $LOAD_RESULT | grep -o '[0-9.]*' | tail -1)
    echo "   ✅ 1-minute load: ${LOAD_1MIN}"
else
    echo "   ⚠️ Load monitoring: Limited data"
fi

# Step 10: Final verification
echo ""
print_status "Step 10: Final verification..."
print_status "Server IP: $SERVER_IP"
print_status "SNMP Port: 161/UDP"
print_status "Community: public"
print_status "Service Status: $(systemctl is-active snmpd)"

# Step 11: Instructions for adding to dashboard
echo ""
echo "🎯 Next Steps - Add to MySLT Dashboard:"
echo "======================================"
echo ""
echo "1. 🌐 Open your MySLT Dashboard:"
echo "   https://dpdlab1.slt.lk:9122/admin"
echo ""
echo "2. 📊 Add this Ubuntu server:"
echo "   • Click 'Add Server'"
echo "   • IP Address: $SERVER_IP"
echo "   • OS Type: Linux"
echo "   • Click 'Add'"
echo ""
echo "3. 🧪 Or test via API:"
echo "   curl -X POST https://dpdlab1.slt.lk:9122/api/server-health/snmp/add \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"serverIp\": \"$SERVER_IP\", \"community\": \"public\"}'"
echo ""
echo "4. ✅ Verify monitoring:"
echo "   curl https://dpdlab1.slt.lk:9122/api/server-health/snmp/$SERVER_IP"
echo ""

print_status "🎉 Ubuntu server setup complete!"
print_status "Server $SERVER_IP is ready for MySLT Dashboard monitoring"

echo ""
echo "📋 Configuration Summary:"
echo "------------------------"
echo "• Ubuntu Version: $UBUNTU_VERSION ($UBUNTU_CODENAME)"
echo "• SNMP Service: $(systemctl is-active snmpd)"
echo "• Config File: /etc/snmp/snmpd.conf"
echo "• Backup File: /etc/snmp/snmpd.conf.backup.*"
echo "• MIBs: Enabled and downloaded"
echo "• UFW Firewall: Port 161/UDP configured"
echo ""
echo "🔧 Troubleshooting:"
echo "• Check service: sudo systemctl status snmpd"
echo "• View logs: sudo journalctl -u snmpd -f"
echo "• Test locally: snmpwalk -v2c -c public localhost system"
echo "• Check firewall: sudo ufw status"
echo "• Restart service: sudo systemctl restart snmpd"
