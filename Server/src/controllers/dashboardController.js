import ApiLog from '../models/ApiLog.js';
import ServerHealth from '../models/ServerHealth.js';
import { apiMapping } from '../config/apiMapping.js';

/**
 * Get dashboard statistics and KPIs
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { apiNumber, customerEmail, dateFrom, dateTo, serverIdentifier } = req.query;

    // Build query filter
    const filter = {};
    
    if (apiNumber && apiNumber !== 'ALL') {
      filter.apiNumber = apiNumber;
    }
    
    if (customerEmail) {
      filter.customerEmail = { $regex: customerEmail, $options: 'i' };
    }
    
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }
    
    if (serverIdentifier) {
      filter.serverIdentifier = serverIdentifier;
    }

    // Get all added servers from ServerHealth
    const addedServers = await ServerHealth.find().select('serverIp').lean();
    
    // Get statistics
    const [
      totalActiveCustomers,
      totalTrafficCount,
      accessMethodStats,
      responseTypeStats,
      recentLogs,
      serverRequestStats
    ] = await Promise.all([
      // Unique active customers
      ApiLog.distinct('customerEmail', filter).then(emails => emails.length),
      
      // Total traffic count
      ApiLog.countDocuments(filter),
      
      // Access method distribution
      ApiLog.aggregate([
        { $match: filter },
        { $group: { _id: '$accessMethod', count: { $sum: 1 } } }
      ]),
      
      // Response type distribution
      ApiLog.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Recent logs for live traffic
      ApiLog.find(filter)
        .sort({ date: -1 })
        .limit(100)
        .select('date customerEmail apiNumber responseTime status'),
      
      // Dynamic server request counts (group by serverIdentifier)
      ApiLog.aggregate([
        { $match: filter },
        { $group: { _id: '$serverIdentifier', count: { $sum: 1 } } }
      ])
    ]);

    // Calculate live traffic (requests in last minute)
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const liveTraffic = recentLogs.filter(log => log.date >= oneMinuteAgo).length;

    // Map server IPs to their request counts
    // Convert server IPs to server identifiers for matching with logs
    const serverRequests = {};
    addedServers.forEach(server => {
      const serverIp = server.serverIp;
      // Find matching serverIdentifier in logs (might be last octet or full IP)
      const matchingStat = serverRequestStats.find(stat => 
        serverIp.endsWith(`.${stat._id}`) || stat._id === serverIp
      );
      serverRequests[serverIp] = matchingStat ? matchingStat.count : 0;
    });

    res.json({
      success: true,
      data: {
        totalActiveCustomers,
        totalTrafficCount,
        liveTraffic,
        serverRequests,
        accessMethodDistribution: accessMethodStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        responseTypeDistribution: responseTypeStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

/**
 * Get API response times
 */
export const getApiResponseTimes = async (req, res) => {
  try {
    const { apiNumber, dateFrom, dateTo } = req.query;

    const filter = {};
    
    if (apiNumber && apiNumber !== 'ALL') {
      filter.apiNumber = apiNumber;
    }
    
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const responseTimeStats = await ApiLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$apiNumber',
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgResponseTime: -1 } },
      { $limit: 10 }
    ]);

    const formattedData = responseTimeStats.map(stat => ({
      apiNumber: stat._id,
      apiName: apiMapping[stat._id] || 'Unknown',
      avgResponseTime: Math.round(stat.avgResponseTime),
      minResponseTime: stat.minResponseTime,
      maxResponseTime: stat.maxResponseTime,
      requestCount: stat.count
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error in getApiResponseTimes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching API response times',
      error: error.message
    });
  }
};

/**
 * Get API success rates
 */
export const getApiSuccessRates = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const filter = {};
    
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const successRates = await ApiLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$apiNumber',
          total: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$status', 'Information'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          apiNumber: '$_id',
          successRate: {
            $multiply: [{ $divide: ['$successful', '$total'] }, 100]
          },
          total: 1
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    const formattedData = successRates.map(stat => ({
      apiNumber: stat.apiNumber,
      apiName: apiMapping[stat.apiNumber] || 'Unknown',
      successRate: Math.round(stat.successRate * 100) / 100,
      totalRequests: stat.total
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error in getApiSuccessRates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching API success rates',
      error: error.message
    });
  }
};

/**
 * Get live traffic data (time series)
 */
export const getLiveTraffic = async (req, res) => {
  try {
    const { minutes = 30 } = req.query;
    const timeAgo = new Date(Date.now() - minutes * 60000);

    const trafficData = await ApiLog.aggregate([
      {
        $match: {
          date: { $gte: timeAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%H:%M',
              date: '$date'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: trafficData.map(item => ({
        time: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Error in getLiveTraffic:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching live traffic data',
      error: error.message
    });
  }
};

/**
 * Get API details table data
 */
export const getApiDetails = async (req, res) => {
  try {
    const { page = 1, limit = 10, apiNumber, dateFrom, dateTo } = req.query;

    const filter = {};
    
    if (apiNumber && apiNumber !== 'ALL') {
      filter.apiNumber = apiNumber;
    }
    
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const apiStats = await ApiLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$apiNumber',
          successRate: {
            $avg: { $cond: [{ $eq: ['$status', 'Information'] }, 100, 0] }
          },
          avgResponseTime: { $avg: '$responseTime' },
          requestCount: { $sum: 1 }
        }
      },
      { $sort: { requestCount: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);

    const total = await ApiLog.distinct('apiNumber', filter).then(apis => apis.length);

    const formattedData = apiStats.map(stat => ({
      apiId: stat._id,
      method: 'GET', // You might want to add method field to logs
      path: apiMapping[stat._id] || 'Unknown',
      successRate: `${Math.round(stat.successRate)}%`,
      avgResponse: `${Math.round(stat.avgResponseTime)}ms`,
      requestCount: stat.requestCount
    }));

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getApiDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching API details',
      error: error.message
    });
  }
};

/**
 * Get available API list for filters
 */
export const getApiList = async (req, res) => {
  try {
    const apiList = Object.entries(apiMapping).map(([number, name]) => ({
      number,
      name
    }));

    res.json({
      success: true,
      data: apiList
    });
  } catch (error) {
    console.error('Error in getApiList:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching API list',
      error: error.message
    });
  }
};
