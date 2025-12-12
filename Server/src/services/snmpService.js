import snmp from 'net-snmp';

/**
 * SNMP OIDs for Linux systems
 */
const OIDS = {
  // System Info
  sysUpTime: '1.3.6.1.2.1.1.3.0',
  sysDescr: '1.3.6.1.2.1.1.1.0',
  
  // CPU Usage (UCD-SNMP-MIB)
  cpuIdle: '1.3.6.1.4.1.2021.11.11.0',      // CPU idle percentage
  cpuUser: '1.3.6.1.4.1.2021.11.9.0',       // CPU user percentage
  cpuSystem: '1.3.6.1.4.1.2021.11.10.0',    // CPU system percentage
  
  // Memory (UCD-SNMP-MIB)
  memTotalReal: '1.3.6.1.4.1.2021.4.5.0',   // Total RAM in KB
  memAvailReal: '1.3.6.1.4.1.2021.4.6.0',   // Available RAM in KB
  memBuffer: '1.3.6.1.4.1.2021.4.14.0',     // Buffer memory in KB
  memCached: '1.3.6.1.4.1.2021.4.15.0',     // Cached memory in KB
  
  // Disk (UCD-SNMP-MIB)
  dskPath: '1.3.6.1.4.1.2021.9.1.2.1',      // Disk path (usually /)
  dskTotal: '1.3.6.1.4.1.2021.9.1.6.1',     // Total disk size in KB
  dskUsed: '1.3.6.1.4.1.2021.9.1.8.1',      // Used disk space in KB
  dskPercent: '1.3.6.1.4.1.2021.9.1.9.1',   // Disk usage percentage
  
  // Network (IF-MIB)
  ifInOctets: '1.3.6.1.2.1.2.2.1.10.2',     // Bytes received on interface 2 (usually eth0)
  ifOutOctets: '1.3.6.1.2.1.2.2.1.16.2',    // Bytes sent on interface 2
  ifDescr: '1.3.6.1.2.1.2.2.1.2.2',         // Interface description
};

/**
 * Create SNMP session
 */
const createSession = (host, community = 'public') => {
  const options = {
    port: 161,
    retries: 1,
    timeout: 5000,
    transport: 'udp4',
    trapPort: 162,
    version: snmp.Version2c,
  };

  return snmp.createSession(host, community, options);
};

/**
 * Query single SNMP OID
 */
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

/**
 * Query multiple SNMP OIDs
 */
const getMultipleOids = (session, oids) => {
  return new Promise((resolve, reject) => {
    session.get(oids, (error, varbinds) => {
      if (error) {
        reject(error);
      } else {
        const results = {};
        varbinds.forEach((varbind, index) => {
          if (snmp.isVarbindError(varbind)) {
            results[oids[index]] = null;
          } else {
            results[oids[index]] = varbind.value;
          }
        });
        resolve(results);
      }
    });
  });
};

/**
 * Format uptime from timeticks to readable string
 */
const formatUptime = (timeticks) => {
  const seconds = Math.floor(timeticks / 100);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${days}d ${hours}h ${minutes}m`;
};

/**
 * Get server health metrics via SNMP
 */
export const getServerMetrics = async (host, community = 'public') => {
  let session;
  
  try {
    session = createSession(host, community);
    
    // Query all OIDs
    const oidList = [
      OIDS.sysUpTime,
      OIDS.cpuIdle,
      OIDS.cpuUser,
      OIDS.cpuSystem,
      OIDS.memTotalReal,
      OIDS.memAvailReal,
      OIDS.memBuffer,
      OIDS.memCached,
      OIDS.dskPercent,
      OIDS.ifInOctets,
      OIDS.ifOutOctets,
    ];
    
    const results = await getMultipleOids(session, oidList);
    
    // Debug: Log raw SNMP results
    console.log(`📊 Raw SNMP data for ${host}:`, {
      cpuIdle: results[OIDS.cpuIdle],
      memTotal: results[OIDS.memTotalReal],
      memAvail: results[OIDS.memAvailReal],
      diskPercent: results[OIDS.dskPercent],
      bytesIn: results[OIDS.ifInOctets],
      bytesOut: results[OIDS.ifOutOctets],
      uptime: results[OIDS.sysUpTime]
    });
    
    // Calculate CPU usage (100 - idle)
    const cpuIdle = parseInt(results[OIDS.cpuIdle]) || 0;
    const cpuUtilization = Math.max(0, Math.min(100, 100 - cpuIdle));
    
    // Calculate RAM usage
    const memTotal = parseInt(results[OIDS.memTotalReal]) || 1;
    const memAvail = parseInt(results[OIDS.memAvailReal]) || 0;
    const memBuffer = parseInt(results[OIDS.memBuffer]) || 0;
    const memCached = parseInt(results[OIDS.memCached]) || 0;
    
    // Available memory includes buffers and cache
    const memUsed = memTotal - memAvail - memBuffer - memCached;
    const ramUsage = Math.max(0, Math.min(100, (memUsed / memTotal) * 100));
    
    // Disk usage percentage
    const diskSpace = parseInt(results[OIDS.dskPercent]) || 0;
    
    // Network traffic (convert bytes to MB)
    const bytesIn = parseInt(results[OIDS.ifInOctets]) || 0;
    const bytesOut = parseInt(results[OIDS.ifOutOctets]) || 0;
    const totalBytes = bytesIn + bytesOut;
    const networkTraffic = parseFloat((totalBytes / (1024 * 1024)).toFixed(2)); // Convert to MB
    
    // Uptime
    const uptime = formatUptime(parseInt(results[OIDS.sysUpTime]) || 0);
    
    console.log(`✅ Calculated metrics for ${host}:`, {
      cpuUtilization: cpuUtilization + '%',
      ramUsage: ramUsage.toFixed(2) + '%',
      diskSpace: diskSpace + '%',
      networkTraffic: networkTraffic + ' MB',
      uptime
    });
    
    // Determine status
    let status = 'healthy';
    if (cpuUtilization > 80 || ramUsage > 80 || diskSpace > 80) {
      status = 'critical';
    } else if (cpuUtilization > 60 || ramUsage > 60 || diskSpace > 60) {
      status = 'warning';
    }
    
    session.close();
    
    return {
      success: true,
      metrics: {
        cpuUtilization: parseFloat(cpuUtilization.toFixed(2)),
        ramUsage: parseFloat(ramUsage.toFixed(2)),
        diskSpace: parseFloat(diskSpace.toFixed(2)),
        networkTraffic,
        uptime,
        status,
        lastUpdated: new Date(),
      }
    };
    
  } catch (error) {
    if (session) {
      session.close();
    }
    
    console.error(`SNMP Error for ${host}:`, error.message);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve SNMP metrics. Ensure SNMP is enabled on the server.'
    };
  }
};

/**
 * Test SNMP connection to a host
 */
export const testSNMPConnection = async (host, community = 'public') => {
  let session;
  
  try {
    session = createSession(host, community);
    
    // Try to get system description
    const sysDescr = await getSingleOid(session, OIDS.sysDescr);
    
    session.close();
    
    return {
      success: true,
      message: 'SNMP connection successful',
      systemDescription: sysDescr.toString()
    };
    
  } catch (error) {
    if (session) {
      session.close();
    }
    
    return {
      success: false,
      error: error.message,
      message: 'SNMP connection failed'
    };
  }
};

export default {
  getServerMetrics,
  testSNMPConnection,
};
