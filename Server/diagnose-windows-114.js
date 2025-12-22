#!/usr/bin/env node
// Diagnostic script for Windows Server 192.168.100.114
// Find correct SNMP OIDs for CPU and Network monitoring

import snmp from 'net-snmp';

const host = '192.168.100.114';
const community = 'public';

console.log(`🔍 Diagnosing Windows SNMP OIDs for ${host}`);
console.log('=' .repeat(60));

const createSession = (host, community = 'public') => {
  const options = {
    port: 161,
    retries: 1,
    timeout: 5000,
    transport: 'udp4',
    version: snmp.Version2c,
  };
  return snmp.createSession(host, community, options);
};

const getSingleOid = (session, oid) => {
  return new Promise((resolve, reject) => {
    session.get([oid], (error, varbinds) => {
      if (error) {
        reject(error);
      } else {
        if (snmp.isVarbindError(varbinds[0])) {
          reject(new Error(snmp.varbindError(varbinds[0])));
        } else {
          resolve(varbinds[0].value);
        }
      }
    });
  });
};

const walkOid = (session, baseOid) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    session.walk(baseOid, (varbinds) => {
      varbinds.forEach((varbind) => {
        if (snmp.isVarbindError(varbind)) {
          console.log('Error: ', snmp.varbindError(varbind));
        } else {
          results.push({
            oid: varbind.oid,
            value: varbind.value
          });
        }
      });
    }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const diagnoseWindows = async () => {
  let session;
  
  try {
    session = createSession(host, community);
    
    console.log('\n📋 1. System Information:');
    console.log('-' .repeat(40));
    
    const sysDescr = await getSingleOid(session, '1.3.6.1.2.1.1.1.0');
    console.log('System Description:', sysDescr.toString());
    
    console.log('\n🖥️ 2. CPU Analysis:');
    console.log('-' .repeat(40));
    
    // Try different CPU OIDs
    const cpuOids = [
      { name: 'hrProcessorLoad.1', oid: '1.3.6.1.2.1.25.3.3.1.2.1' },
      { name: 'hrProcessorLoad.2', oid: '1.3.6.1.2.1.25.3.3.1.2.2' },
      { name: 'hrProcessorLoad.3', oid: '1.3.6.1.2.1.25.3.3.1.2.3' },
      { name: 'hrProcessorLoad.4', oid: '1.3.6.1.2.1.25.3.3.1.2.4' },
    ];
    
    for (const cpu of cpuOids) {
      try {
        const value = await getSingleOid(session, cpu.oid);
        console.log(`✅ ${cpu.name}: ${value}%`);
      } catch (error) {
        console.log(`❌ ${cpu.name}: ${error.message}`);
      }
    }
    
    // Walk the processor table to find all CPUs
    console.log('\n🔍 Walking hrProcessorLoad table:');
    try {
      const processors = await walkOid(session, '1.3.6.1.2.1.25.3.3.1.2');
      processors.forEach((proc, index) => {
        console.log(`  CPU ${index + 1} (${proc.oid}): ${proc.value}%`);
      });
    } catch (error) {
      console.log('❌ Could not walk processor table:', error.message);
    }
    
    console.log('\n🌐 3. Network Interface Analysis:');
    console.log('-' .repeat(40));
    
    // Walk interface descriptions
    console.log('🔍 Available Network Interfaces:');
    try {
      const interfaces = await walkOid(session, '1.3.6.1.2.1.2.2.1.2');
      interfaces.forEach((iface, index) => {
        console.log(`  Interface ${index + 1} (${iface.oid}): ${iface.value.toString()}`);
      });
    } catch (error) {
      console.log('❌ Could not walk interface table:', error.message);
    }
    
    // Test network traffic on different interfaces
    console.log('\n🔍 Network Traffic on Each Interface:');
    for (let i = 1; i <= 10; i++) {
      try {
        const inOctets = await getSingleOid(session, `1.3.6.1.2.1.2.2.1.10.${i}`);
        const outOctets = await getSingleOid(session, `1.3.6.1.2.1.2.2.1.16.${i}`);
        const ifDescr = await getSingleOid(session, `1.3.6.1.2.1.2.2.1.2.${i}`);
        
        const totalBytes = parseInt(inOctets) + parseInt(outOctets);
        const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
        
        console.log(`  Interface ${i} (${ifDescr.toString()}): ${totalMB} MB`);
      } catch (error) {
        // Interface doesn't exist, continue
      }
    }
    
    console.log('\n💾 4. Memory Details:');
    console.log('-' .repeat(40));
    
    // Walk storage table to find memory entries
    try {
      const storageTypes = await walkOid(session, '1.3.6.1.2.1.25.2.3.1.2');
      const storageDescr = await walkOid(session, '1.3.6.1.2.1.25.2.3.1.3');
      
      console.log('🔍 Storage Entries:');
      storageTypes.forEach((storage, index) => {
        const description = storageDescr[index] ? storageDescr[index].value.toString() : 'Unknown';
        console.log(`  Index ${index + 1}: Type=${storage.value}, Desc="${description}"`);
      });
    } catch (error) {
      console.log('❌ Could not walk storage table:', error.message);
    }
    
    console.log('\n🎯 5. Recommended OIDs for this server:');
    console.log('-' .repeat(40));
    
    // Find the best CPU OID
    let bestCpuOid = null;
    let bestCpuValue = null;
    
    for (const cpu of cpuOids) {
      try {
        const value = await getSingleOid(session, cpu.oid);
        if (parseInt(value) > 0) {
          bestCpuOid = cpu.oid;
          bestCpuValue = value;
          break;
        }
      } catch (error) {
        // Continue to next
      }
    }
    
    if (bestCpuOid) {
      console.log(`✅ Best CPU OID: ${bestCpuOid} (${bestCpuValue}%)`);
    } else {
      console.log('❌ No working CPU OID found');
    }
    
    // Find the best network interface
    let bestNetworkInterface = null;
    let bestNetworkTraffic = 0;
    
    for (let i = 1; i <= 10; i++) {
      try {
        const inOctets = await getSingleOid(session, `1.3.6.1.2.1.2.2.1.10.${i}`);
        const outOctets = await getSingleOid(session, `1.3.6.1.2.1.2.2.1.16.${i}`);
        const totalBytes = parseInt(inOctets) + parseInt(outOctets);
        
        if (totalBytes > bestNetworkTraffic) {
          bestNetworkInterface = i;
          bestNetworkTraffic = totalBytes;
        }
      } catch (error) {
        // Interface doesn't exist, continue
      }
    }
    
    if (bestNetworkInterface) {
      const ifDescr = await getSingleOid(session, `1.3.6.1.2.1.2.2.1.2.${bestNetworkInterface}`);
      const totalMB = (bestNetworkTraffic / (1024 * 1024)).toFixed(2);
      console.log(`✅ Best Network Interface: ${bestNetworkInterface} (${ifDescr.toString()}) - ${totalMB} MB`);
    } else {
      console.log('❌ No active network interface found');
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  } finally {
    if (session) {
      session.close();
    }
  }
};

diagnoseWindows();
