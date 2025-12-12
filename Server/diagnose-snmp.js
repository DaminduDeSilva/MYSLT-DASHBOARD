import { getServerMetrics } from './src/services/snmpService.js';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 SNMP Diagnostic Test');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const testIP = '192.168.100.113';

console.log(`Testing server: ${testIP}`);
console.log('Community: public\n');

try {
  const result = await getServerMetrics(testIP, 'public');
  
  if (result.success) {
    console.log('\n✅ SUCCESS! Real data fetched:\n');
    console.log('CPU Utilization:', result.metrics.cpuUtilization + '%');
    console.log('RAM Usage:', result.metrics.ramUsage + '%');
    console.log('Disk Space:', result.metrics.diskSpace + '%');
    console.log('Network Traffic:', result.metrics.networkTraffic, 'MB');
    console.log('Uptime:', result.metrics.uptime);
    console.log('Status:', result.metrics.status);
  } else {
    console.log('\n❌ FAILED to fetch data\n');
    console.log('Error:', result.error);
    console.log('Message:', result.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Ensure SNMP is installed: sudo apt install snmpd');
    console.log('2. Check SNMP is running: sudo systemctl status snmpd');
    console.log('3. Verify config: sudo nano /etc/snmp/snmpd.conf');
    console.log('   Required line: agentAddress udp:161');
    console.log('   Required line: rocommunity public default');
    console.log('4. Restart SNMP: sudo systemctl restart snmpd');
    console.log('5. Allow port: sudo ufw allow 161/udp');
  }
} catch (error) {
  console.log('\n❌ ERROR:', error.message);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
process.exit(0);
