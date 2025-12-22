#!/bin/bash
# MySLT Dashboard - Rocky Linux Server SNMP Setup Script
# Run this script on the NEW Rocky Linux server you want to monitor
# Usage: sudo ./setup-snmp-rocky-linux.sh

echo "🚀 MySLT Dashboard - Rocky Linux SNMP Setup"
echo "==========================================="
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

# Step 1: Update system and install SNMP
print_status "Step 1: Installing SNMP packages..."
dnf update -y > /dev/null 2>&1
dnf install -y net-snmp net-snmp-utils

if [ $? -eq 0 ]; then
    print_status "✅ SNMP packages installed successfully"
else
    print_error "❌ Failed to install SNMP packages"
    exit 1
fi

# Step 2: Backup existing config
print_status "Step 2: Backing up existing configuration..."
if [ -f /etc/snmp/snmpd.conf ]; then
    cp /etc/snmp/snmpd.conf /etc/snmp/snmpd.conf.backup.$(date +%Y%m%d_%H%M%S)
    print_status "✅ Existing config backed up"
else
    print_status "ℹ️ No existing config found"
fi

# Step 3: Get server information
SERVER_IP=$(hostname -I | awk '{print $1}')
HOSTNAME=$(hostname)

print_status "Step 3: Server Information"
echo "   Server IP: $SERVER_IP"
echo "   Hostname: $HOSTNAME"

# Step 4: Create SNMP configuration
print_status "Step 4: Creating SNMP configuration..."

cat > /etc/snmp/snmpd.conf << 'EOF'
# MySLT Dashboard SNMP Configuration - Rocky Linux
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
syslocation "Rocky Linux Server - Production Environment"
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

# Process monitoring
proc sshd
proc httpd
proc nginx
proc apache2
proc mysqld
proc mongod
proc docker
proc systemd

# =============================
# ADVANCED MONITORING
# =============================

# Enable all disk monitoring
includeAllDisks 10%

# Default monitors
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

# Enable extended statistics
extend .1.3.6.1.4.1.2021.7890.1 serverInfo /bin/uname -a
extend .1.3.6.1.4.1.2021.7890.2 uptimeInfo /usr/bin/uptime
extend .1.3.6.1.4.1.2021.7890.3 memInfo /usr/bin/free -m

EOF

print_status "✅ SNMP configuration created"

# Step 5: Configure firewall
print_status "Step 5: Configuring firewall..."

# Check if firewalld is running
if systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --add-port=161/udp > /dev/null 2>&1
    firewall-cmd --reload > /dev/null 2>&1
    print_status "✅ Firewall configured (firewalld)"
else
    print_warning "⚠️ Firewalld not running - manual firewall configuration may be needed"
fi

# Step 6: Configure SELinux (if enforcing)
print_status "Step 6: Configuring SELinux..."
if [ "$(getenforce 2>/dev/null)" = "Enforcing" ]; then
    setsebool -P snmpd_write_snmpd_state 1 > /dev/null 2>&1
    print_status "✅ SELinux configured for SNMP"
else
    print_status "ℹ️ SELinux not enforcing or not installed"
fi

# Step 7: Start and enable SNMP service
print_status "Step 7: Starting SNMP service..."
systemctl start snmpd
systemctl enable snmpd

if systemctl is-active --quiet snmpd; then
    print_status "✅ SNMP service started and enabled"
else
    print_error "❌ Failed to start SNMP service"
    exit 1
fi

# Step 8: Test SNMP locally
print_status "Step 8: Testing SNMP configuration..."

echo ""
echo "🧪 Local SNMP Tests:"
echo "-------------------"

# Test system info
echo "📋 System Information:"
snmpget -v2c -c public localhost .1.3.6.1.2.1.1.1.0 2>/dev/null | cut -d: -f2- | xargs

# Test CPU
echo "🖥️ CPU Information:"
CPU_RESULT=$(snmpget -v2c -c public localhost .1.3.6.1.4.1.2021.11.11.0 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "   ✅ CPU monitoring: WORKING"
else
    echo "   ⚠️ CPU monitoring: Limited (will use alternative method)"
fi

# Test Memory
echo "💾 Memory Information:"
MEM_RESULT=$(snmpget -v2c -c public localhost .1.3.6.1.4.1.2021.4.5.0 2>/dev/null)
if [ $? -eq 0 ]; then
    MEM_TOTAL=$(echo $MEM_RESULT | grep -o '[0-9]*' | tail -1)
    echo "   ✅ Memory Total: $((MEM_TOTAL / 1024)) MB"
else
    echo "   ❌ Memory monitoring: FAILED"
fi

# Test Disk
echo "💿 Disk Information:"
DISK_RESULT=$(snmpget -v2c -c public localhost .1.3.6.1.4.1.2021.9.1.9.1 2>/dev/null)
if [ $? -eq 0 ]; then
    DISK_PERCENT=$(echo $DISK_RESULT | grep -o '[0-9]*' | tail -1)
    echo "   ✅ Disk Usage: ${DISK_PERCENT}%"
else
    echo "   ❌ Disk monitoring: FAILED"
fi

# Step 9: Final verification
echo ""
print_status "Step 9: Final verification..."
print_status "Server IP: $SERVER_IP"
print_status "SNMP Port: 161/UDP"
print_status "Community: public"
print_status "Service Status: $(systemctl is-active snmpd)"

# Step 10: Instructions for adding to dashboard
echo ""
echo "🎯 Next Steps - Add to MySLT Dashboard:"
echo "======================================"
echo ""
echo "1. 🌐 Open your MySLT Dashboard:"
echo "   https://dpdlab1.slt.lk:9122/admin"
echo ""
echo "2. 📊 Add this server:"
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

print_status "🎉 Rocky Linux server setup complete!"
print_status "Server $SERVER_IP is ready for MySLT Dashboard monitoring"

echo ""
echo "📋 Configuration Summary:"
echo "------------------------"
echo "• SNMP Service: $(systemctl is-active snmpd)"
echo "• Config File: /etc/snmp/snmpd.conf"
echo "• Backup File: /etc/snmp/snmpd.conf.backup.*"
echo "• Log File: /var/log/snmpd.log"
echo "• Firewall: Port 161/UDP opened"
echo ""
echo "🔧 Troubleshooting:"
echo "• Check service: systemctl status snmpd"
echo "• View logs: journalctl -u snmpd -f"
echo "• Test locally: snmpwalk -v2c -c public localhost system"
