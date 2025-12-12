import { getServerMetrics, testSNMPConnection } from './src/services/snmpService.js';

/**
 * Test SNMP connection and metrics for both Windows and Linux servers
 * Usage: node test-snmp-universal.js
 */

const testServers = async () => {
  console.log('🔍 Universal SNMP Connection Test\n');
  console.log('=' .repeat(60));

  // Test server configuration
  const servers = [
    {
      name: 'Proxmox Linux Server (Your Server)',
      ip: '124.43.216.136', // or 192.168.100.113 if on same network
      community: 'public',
      expectedOS: 'linux'
    },
    // Uncomment to test a Windows server
    // {
    //   name: 'Windows Server',
    //   ip: '192.168.1.100',
    //   community: 'public',
    //   expectedOS: 'windows'
    // }
  ];

  for (const server of servers) {
    console.log(`\n📡 Testing: ${server.name}`);
    console.log(`   IP: ${server.ip}`);
    console.log(`   Expected OS: ${server.expectedOS}`);
    console.log('-'.repeat(60));

    // Test connection
    console.log('\n1️⃣ Testing SNMP Connection...');
    const connectionResult = await testSNMPConnection(server.ip, server.community);
    
    if (!connectionResult.success) {
      console.log('❌ Connection Failed:', connectionResult.message);
      console.log('   Error:', connectionResult.error);
      console.log('\n💡 Troubleshooting:');
      console.log('   - Ensure SNMP is installed and running');
      console.log('   - Check firewall allows UDP port 161');
      console.log('   - Verify community string is "public"');
      console.log('   - Test with: snmpwalk -v2c -c public ' + server.ip + ' system');
      continue;
    }

    console.log('✅ Connection Successful!');
    console.log('   System:', connectionResult.systemDescription.substring(0, 80) + '...');

    // Fetch metrics with auto-detection
    console.log('\n2️⃣ Fetching Server Metrics (Auto-detecting OS)...');
    const metricsResult = await getServerMetrics(server.ip, server.community);
    
    if (!metricsResult.success) {
      console.log('❌ Failed to fetch metrics:', metricsResult.message);
      console.log('   Error:', metricsResult.error);
      continue;
    }

    console.log('✅ Metrics Retrieved Successfully!');
    console.log('\n📊 Server Details:');
    console.log('   Detected OS:', metricsResult.osType.toUpperCase());
    console.log('   Status:', metricsResult.metrics.status.toUpperCase());
    console.log('\n📈 Performance Metrics:');
    console.log('   CPU Usage:', metricsResult.metrics.cpuUtilization + '%');
    console.log('   RAM Usage:', metricsResult.metrics.ramUsage.toFixed(2) + '%');
    console.log('   Disk Usage:', metricsResult.metrics.diskSpace + '%');
    console.log('   Network Traffic:', metricsResult.metrics.networkTraffic + ' MB');
    console.log('   Uptime:', metricsResult.metrics.uptime);

    // Verify OS detection
    if (server.expectedOS && metricsResult.osType !== server.expectedOS) {
      console.log('\n⚠️  Warning: Expected ' + server.expectedOS + ' but detected ' + metricsResult.osType);
    } else {
      console.log('\n✅ OS Detection Correct!');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Test Complete!\n');
  
  console.log('📝 Next Steps:');
  console.log('   1. If all tests passed, add server via Admin Panel');
  console.log('   2. Go to http://localhost:5173 and login (admin/123456)');
  console.log('   3. Navigate to Admin Panel → Add Server');
  console.log('   4. Enter server IP and click Add');
  console.log('   5. Check System Health page for real-time metrics');
};

// Run tests
testServers().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
