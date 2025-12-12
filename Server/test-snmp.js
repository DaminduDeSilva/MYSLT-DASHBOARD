import { getServerMetrics, testSNMPConnection } from './src/services/snmpService.js';

const testServer = async () => {
  const serverIP = '192.168.100.113'; // Your Linux server
  const community = 'public';

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 Testing SNMP Connection to:', serverIP);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test 1: Connection Test
  console.log('📡 Test 1: Testing SNMP connection...');
  const connectionResult = await testSNMPConnection(serverIP, community);
  
  if (connectionResult.success) {
    console.log('✅ Connection successful!');
    console.log('📋 System:', connectionResult.systemDescription);
  } else {
    console.log('❌ Connection failed:', connectionResult.error);
    console.log('💡 Make sure:');
    console.log('   - SNMP is installed: sudo apt install snmpd');
    console.log('   - SNMP is running: sudo systemctl status snmpd');
    console.log('   - Port 161 is open: sudo ufw allow 161/udp');
    console.log('   - Community string is "public"');
    return;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test 2: Fetch Metrics
  console.log('📊 Test 2: Fetching server metrics...');
  const metricsResult = await getServerMetrics(serverIP, community);
  
  if (metricsResult.success) {
    console.log('✅ Metrics retrieved successfully!\n');
    console.log('📈 Server Health Metrics:');
    console.log('   CPU Utilization:', metricsResult.metrics.cpuUtilization + '%');
    console.log('   RAM Usage:', metricsResult.metrics.ramUsage + '%');
    console.log('   Disk Space:', metricsResult.metrics.diskSpace + '%');
    console.log('   Network Traffic:', metricsResult.metrics.networkTraffic, 'bytes');
    console.log('   Uptime:', metricsResult.metrics.uptime);
    console.log('   Status:', metricsResult.metrics.status);
  } else {
    console.log('❌ Failed to fetch metrics:', metricsResult.error);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ Test completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  process.exit(0);
};

testServer();
