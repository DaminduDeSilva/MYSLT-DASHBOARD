import ServerHealth from '../models/ServerHealth.js';
import { getServerMetrics, testSNMPConnection } from '../services/snmpService.js';

/**
 * Get all servers health status
 */
export const getAllServersHealth = async (req, res) => {
  try {
    const servers = await ServerHealth.find().sort({ serverIp: 1 });

    res.json({
      success: true,
      data: servers
    });
  } catch (error) {
    console.error('Error in getAllServersHealth:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching server health data',
      error: error.message
    });
  }
};

/**
 * Get specific server health
 */
export const getServerHealth = async (req, res) => {
  try {
    const { ip } = req.params;
    const server = await ServerHealth.findOne({ serverIp: ip });

    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    res.json({
      success: true,
      data: server
    });
  } catch (error) {
    console.error('Error in getServerHealth:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching server health data',
      error: error.message
    });
  }
};

/**
 * Update server health (for monitoring agents)
 */
export const updateServerHealth = async (req, res) => {
  try {
    const { serverIp, cpuUtilization, ramUsage, diskSpace, networkTraffic, uptime } = req.body;

    // Determine status based on metrics
    let status = 'healthy';
    if (cpuUtilization > 80 || ramUsage > 80 || diskSpace > 80) {
      status = 'critical';
    } else if (cpuUtilization > 60 || ramUsage > 60 || diskSpace > 60) {
      status = 'warning';
    }

    const server = await ServerHealth.findOneAndUpdate(
      { serverIp },
      {
        cpuUtilization,
        ramUsage,
        diskSpace,
        networkTraffic,
        uptime,
        status,
        lastUpdated: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: server
    });
  } catch (error) {
    console.error('Error in updateServerHealth:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating server health',
      error: error.message
    });
  }
};

/**
 * Delete a server
 */
export const deleteServer = async (req, res) => {
  try {
    const { ip } = req.params;

    const result = await ServerHealth.findOneAndDelete({ serverIp: ip });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    res.json({
      success: true,
      message: 'Server deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteServer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting server',
      error: error.message
    });
  }
};

/**
 * Get server metrics via SNMP
 */
export const getServerMetricsSNMP = async (req, res) => {
  try {
    const { ip } = req.params;
    const { community = 'public' } = req.query;

    console.log(`Fetching SNMP metrics for ${ip}...`);

    const result = await getServerMetrics(ip, community);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      data: {
        serverIp: ip,
        ...result.metrics
      }
    });
  } catch (error) {
    console.error('Error in getServerMetricsSNMP:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching SNMP metrics',
      error: error.message
    });
  }
};

/**
 * Test SNMP connection to a server
 */
export const testSNMPConnectionEndpoint = async (req, res) => {
  try {
    const { ip } = req.body;
    const { community = 'public' } = req.body;

    if (!ip) {
      return res.status(400).json({
        success: false,
        message: 'Server IP is required'
      });
    }

    console.log(`Testing SNMP connection to ${ip}...`);

    const result = await testSNMPConnection(ip, community);

    res.json(result);
  } catch (error) {
    console.error('Error in testSNMPConnectionEndpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing SNMP connection',
      error: error.message
    });
  }
};

/**
 * Add server with SNMP auto-detection (Auto-detects Windows/Linux)
 */
export const addServerWithSNMP = async (req, res) => {
  try {
    const { serverIp, community = 'public', osType = null } = req.body;

    if (!serverIp) {
      return res.status(400).json({
        success: false,
        message: 'Server IP is required'
      });
    }

    console.log(`Adding server ${serverIp} with SNMP...`);

    // Test connection first
    const connectionTest = await testSNMPConnection(serverIp, community);
    
    if (!connectionTest.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to server via SNMP. Please ensure SNMP is enabled.',
        error: connectionTest.error
      });
    }

    console.log(`✅ Connection test passed: ${connectionTest.systemDescription}`);

    // Fetch initial metrics (auto-detects OS if not specified)
    const metricsResult = await getServerMetrics(serverIp, community, osType);
    
    if (!metricsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Connected but failed to fetch metrics',
        error: metricsResult.error
      });
    }

    console.log(`📊 Detected OS: ${metricsResult.osType}`);

    // Save to database
    const server = await ServerHealth.findOneAndUpdate(
      { serverIp },
      {
        serverIp,
        osType: metricsResult.osType,
        ...metricsResult.metrics,
        snmpCommunity: community,
        lastUpdated: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: `Server added successfully (OS: ${metricsResult.osType})`,
      data: server
    });
  } catch (error) {
    console.error('Error in addServerWithSNMP:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding server',
      error: error.message
    });
  }
};

/**
 * Initialize server health data (removed dummy data)
 * Use addServerWithSNMP endpoint to add real servers via SNMP
 */
export const initializeServerHealth = async (req, res) => {
  try {
    // Clear all existing servers
    await ServerHealth.deleteMany({});

    res.json({
      success: true,
      message: 'Server health data cleared. Add servers via SNMP using /api/server-health/snmp/add endpoint',
      data: []
    });
  } catch (error) {
    console.error('Error in initializeServerHealth:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing server health data',
      error: error.message
    });
  }
};
