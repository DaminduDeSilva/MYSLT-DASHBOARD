import ServerHealth from '../models/ServerHealth.js';

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
 * Initialize server health data with mock data
 */
export const initializeServerHealth = async (req, res) => {
  try {
    const servers = [
      {
        serverIp: '172.25.37.16',
        cpuUtilization: 46.88,
        ramUsage: 61.91,
        diskSpace: 60.27,
        networkTraffic: 0,
        uptime: '11d 0h 2m',
        status: 'healthy'
      },
      {
        serverIp: '172.25.37.21',
        cpuUtilization: 63.05,
        ramUsage: 71.54,
        diskSpace: 49.48,
        networkTraffic: 0,
        uptime: '15d 0h 2m',
        status: 'warning'
      },
      {
        serverIp: '172.25.37.138',
        cpuUtilization: 41.01,
        ramUsage: 51.59,
        diskSpace: 66.9,
        networkTraffic: 0,
        uptime: '30d 0h 2m',
        status: 'healthy'
      }
    ];

    // Delete existing data
    await ServerHealth.deleteMany({});

    // Insert new data
    const result = await ServerHealth.insertMany(servers);

    res.json({
      success: true,
      message: 'Server health data initialized',
      data: result
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
