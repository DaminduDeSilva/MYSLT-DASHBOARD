#!/bin/bash
# Fix SNMP Configuration for Rocky Linux Server 192.168.100.113
# Run this script ON the target server (192.168.100.113)

echo "🔧 Fixing SNMP Configuration for MySLT Dashboard Monitoring"
echo "========================================================"

# 1. Backup existing config
echo "📦 Creating backup of current SNMP config..."
sudo cp /etc/snmp/snmpd.conf /etc/snmp/snmpd.conf.backup.$(date +%Y%m%d_%H%M%S)

# 2. Create proper SNMP configuration with UCD-SNMP-MIB
echo "📝 Creating new SNMP configuration..."
sudo tee /etc/snmp/snmpd.conf > /dev/null << 'EOF'
# SNMP Configuration for MySLT Dashboard Monitoring
# Rocky Linux with UCD-SNMP-MIB Extensions

# Listen on all interfaces
agentAddress udp:161,udp6:[::1]:161

# Allow access from monitoring server and local network
rocommunity public default
# For better security, restrict to monitoring server:
# rocommunity public 192.168.100.137/32

# System information
syslocation "Rocky Linux Server - Data Center"
syscontact admin@yourcompany.com
sysservices 72

# ===== CRITICAL: UCD-SNMP-MIB EXTENSIONS =====
# These are REQUIRED for MySLT Dashboard to read metrics

# Disk monitoring (enables .1.3.6.1.4.1.2021.9.x OIDs)
disk / 10%
disk /var 10%
disk /tmp 10%
disk /home 10%

# Load averages (enables .1.3.6.1.4.1.2021.10.x OIDs)  
load 12 10 5

# CPU monitoring (enables .1.3.6.1.4.1.2021.11.x OIDs)
# This is automatically enabled with UCD-SNMP-MIB

# Memory monitoring (enables .1.3.6.1.4.1.2021.4.x OIDs)
# This is automatically enabled with UCD-SNMP-MIB

# Process monitoring (optional)
proc sshd
proc httpd
proc nginx
proc mysqld
proc mongod

# Network interfaces (standard IF-MIB)
# Automatically available

# ===== ACCESS CONTROL =====
view systemonly included .1.3.6.1.2.1.1
view systemonly included .1.3.6.1.2.1.25.1
view systemonly included .1.3.6.1.4.1.2021
view all included .1 80

access notConfigGroup "" any noauth exact all none none
access readonly "" any noauth exact systemonly none none

# Enable UCD-SNMP-MIB (CRITICAL!)
includeAllDisks 10%

# Enable AgentX master
master agentx

# Enable all disk monitoring
defaultMonitors yes
linkUpDownNotifications yes

# Default community
com2sec readonly default public
group MyROGroup v2c readonly
view all included .1 80
access MyROGroup "" any noauth exact all none none
EOF

# 3. Restart SNMP service
echo "🔄 Restarting SNMP service..."
sudo systemctl restart snmpd

# 4. Check service status
echo "🔍 Checking SNMP service status..."
sudo systemctl status snmpd --no-pager | grep "Active:" | head -1

# 5. Test UCD-SNMP-MIB OIDs locally
echo "🧪 Testing UCD-SNMP-MIB OIDs locally..."

echo "Testing CPU Idle OID:"
snmpget -v2c -c public localhost .1.3.6.1.4.1.2021.11.11.0 2>/dev/null || echo "❌ CPU OID not available"

echo "Testing Memory Total OID:"
snmpget -v2c -c public localhost .1.3.6.1.4.1.2021.4.5.0 2>/dev/null || echo "❌ Memory OID not available"

echo "Testing Disk Percent OID:"
snmpget -v2c -c public localhost .1.3.6.1.4.1.2021.9.1.9.1 2>/dev/null || echo "❌ Disk OID not available"

echo ""
echo "🔍 Available UCD-SNMP-MIB OIDs:"
snmpwalk -v2c -c public localhost .1.3.6.1.4.1.2021 2>/dev/null | head -10 || echo "❌ No UCD-SNMP-MIB OIDs found"

echo ""
echo "✅ Configuration complete!"
echo "🔍 Test from monitoring server with:"
echo "   snmpwalk -v2c -c public 192.168.100.113 .1.3.6.1.4.1.2021.11"
echo "   curl https://dpdlab1.slt.lk:9122/api/server-health/snmp/192.168.100.113"
