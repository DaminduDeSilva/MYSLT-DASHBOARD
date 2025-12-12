import ServerHealth from '../models/ServerHealth.js';
import { getServerMetrics } from '../services/snmpService.js';

const REFRESH_INTERVAL = 30000; // 30 seconds
let monitorInterval = null;

/**
 * Update all servers' health metrics via SNMP
 */
const updateAllServers = async () => {
  try {
    const servers = await ServerHealth.find();
    
    if (servers.length === 0) {
      console.log('📊 No servers to monitor');
      return;
    }

    console.log(`📊 Updating metrics for ${servers.length} servers...`);

    const updatePromises = servers.map(async (server) => {
      try {
        const community = server.snmpCommunity || 'public';
        const osType = server.osType || null; // Use stored OS type
        const result = await getServerMetrics(server.serverIp, community, osType);

        if (result.success) {
          await ServerHealth.findOneAndUpdate(
            { serverIp: server.serverIp },
            { 
              osType: result.osType, // Update OS type if it was auto-detected
              ...result.metrics, 
              lastUpdated: new Date() 
            }
          );
          console.log(`✅ Updated ${server.serverIp} (${result.osType})`);
        } else {
          console.log(`❌ Failed to update ${server.serverIp}: ${result.message}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${server.serverIp}:`, error.message);
      }
    });

    await Promise.all(updatePromises);
    console.log('✨ Server metrics update completed');

  } catch (error) {
    console.error('❌ Error in updateAllServers:', error);
  }
};

/**
 * Start SNMP monitoring background job
 */
export const startSNMPMonitor = () => {
  if (monitorInterval) {
    console.log('⚠️  SNMP monitor already running');
    return;
  }

  console.log('🚀 Starting SNMP monitor...');
  console.log(`⏱️  Refresh interval: ${REFRESH_INTERVAL / 1000} seconds`);

  // Initial update
  updateAllServers();

  // Set up recurring updates
  monitorInterval = setInterval(updateAllServers, REFRESH_INTERVAL);

  console.log('✅ SNMP monitor started successfully');
};

/**
 * Stop SNMP monitoring
 */
export const stopSNMPMonitor = () => {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    console.log('🛑 SNMP monitor stopped');
  }
};

/**
 * Force immediate update of all servers
 */
export const forceUpdate = async () => {
  console.log('🔄 Forcing immediate server metrics update...');
  await updateAllServers();
};

export default {
  startSNMPMonitor,
  stopSNMPMonitor,
  forceUpdate,
};
