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
    
    // Support both email and phone number in customerEmail field (username)
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
    const oneMinuteAgo = new Date(Date.now() - 60000);
    
    // Build live traffic filter (last minute only, ignoring user's date filters)
    const liveTrafficFilter = {};
    if (apiNumber && apiNumber !== 'ALL') {
      liveTrafficFilter.apiNumber = apiNumber;
    }
    if (customerEmail) {
      liveTrafficFilter.customerEmail = { $regex: customerEmail, $options: 'i' };
    }
    if (serverIdentifier) {
      liveTrafficFilter.serverIdentifier = serverIdentifier;
    }
    // Always use last minute for live traffic
    liveTrafficFilter.date = { $gte: oneMinuteAgo };
    
    const [
      totalActiveCustomers,
      totalTrafficCount,
      accessMethodStats,
      responseTypeStats,
      liveTraffic,
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
      
      // Live traffic (requests in last minute) - query database directly
      ApiLog.countDocuments(liveTrafficFilter),
      
      // Dynamic server request counts (group by serverIdentifier)
      ApiLog.aggregate([
        { $match: filter },
        { $group: { _id: '$serverIdentifier', count: { $sum: 1 } } }
      ])
    ]);

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
    const { apiNumber, dateFrom, dateTo, serverIdentifier } = req.query;

    const filter = {};
    
    if (apiNumber && apiNumber !== 'ALL') {
      filter.apiNumber = apiNumber;
    }

    if (serverIdentifier) {
      filter.serverIdentifier = serverIdentifier;
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
    const { dateFrom, dateTo, serverIdentifier } = req.query;

    const filter = {};
    
    if (serverIdentifier) {
      filter.serverIdentifier = serverIdentifier;
    }
    
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
    const { minutes = 30, serverIdentifier } = req.query;
    const now = new Date();
    const timeAgo = new Date(now.getTime() - minutes * 60000);

    const filter = {
      date: { $gte: timeAgo, $lte: now }
    };

    if (serverIdentifier) {
      filter.serverIdentifier = serverIdentifier;
    }

    // Group by 2-minute intervals for smoother visualization
    const intervalMinutes = 2;
    
    const trafficData = await ApiLog.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: {
            $subtract: [
              { $toLong: '$date' },
              { $mod: [{ $toLong: '$date' }, intervalMinutes * 60 * 1000] }
            ]
          },
          timestamp: { $first: '$date' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          timestamp: 1,
          count: 1
        }
      }
    ]);

    // Fill in missing time slots with zero values for continuous line
    const result = [];
    const intervalMs = intervalMinutes * 60 * 1000;
    const startTime = Math.floor(timeAgo.getTime() / intervalMs) * intervalMs;
    const endTime = Math.floor(now.getTime() / intervalMs) * intervalMs;
    
    const dataMap = new Map();
    trafficData.forEach(item => {
      const roundedTime = Math.floor(new Date(item.timestamp).getTime() / intervalMs) * intervalMs;
      dataMap.set(roundedTime, item.count);
    });
    
    for (let time = startTime; time <= endTime; time += intervalMs) {
      const date = new Date(time);
      result.push({
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        count: dataMap.get(time) || 0
      });
    }

    res.json({
      success: true,
      data: result
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
    const { page = 1, limit = 10, apiNumber, dateFrom, dateTo, serverIdentifier } = req.query;

    const filter = {};
    
    if (apiNumber && apiNumber !== 'ALL') {
      filter.apiNumber = apiNumber;
    }

    if (serverIdentifier) {
      filter.serverIdentifier = serverIdentifier;
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

/**
 * Get customer logs by username (email or phone)
 */
export const getCustomerLogs = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    // Search for logs matching the username (customerEmail field)
    const logs = await ApiLog.find({
      customerEmail: { $regex: username, $options: 'i' }
    })
      .sort({ date: -1 })
      .limit(100)
      .select('startTimestamp accessMethod status apiNumber endTimestamp responseTime serverIdentifier')
      .lean();

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error in getCustomerLogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer logs',
      error: error.message
    });
  }
};

/**
 * Get top 20 APIs with highest success rate
 */
export const getTopSuccessApis = async (req, res) => {
  try {
    const { dateFrom, dateTo, serverIdentifier } = req.query;

    const filter = {};
    
    if (serverIdentifier) {
      filter.serverIdentifier = serverIdentifier;
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
          total: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$status', 'Information'] }, 1, 0] }
          },
          avgResponseTime: { $avg: '$responseTime' }
        }
      },
      {
        $project: {
          apiNumber: '$_id',
          successRate: {
            $multiply: [{ $divide: ['$successful', '$total'] }, 100]
          },
          avgResponseTime: 1,
          requestCount: '$total'
        }
      },
      { $sort: { successRate: -1 } },
      { $limit: 20 }
    ]);

    const formattedData = apiStats.map(stat => ({
      apiId: stat.apiNumber,
      method: 'GET',
      path: apiMapping[stat.apiNumber] || 'Unknown',
      successRate: `${Math.round(stat.successRate)}%`,
      avgResponse: `${Math.round(stat.avgResponseTime)}ms`,
      requestCount: stat.requestCount
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error in getTopSuccessApis:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top success APIs',
      error: error.message
    });
  }
};

/**
 * Get top 20 APIs with highest error rate
 */
export const getTopErrorApis = async (req, res) => {
  try {
    const { dateFrom, dateTo, serverIdentifier } = req.query;

    const filter = {};
    
    if (serverIdentifier) {
      filter.serverIdentifier = serverIdentifier;
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
          total: { $sum: 1 },
          errors: {
            $sum: { 
              $cond: [
                { $in: ['$status', ['Error', 'Critical', 'Warning']] }, 
                1, 
                0
              ] 
            }
          },
          avgResponseTime: { $avg: '$responseTime' }
        }
      },
      {
        $project: {
          apiNumber: '$_id',
          errorRate: {
            $multiply: [{ $divide: ['$errors', '$total'] }, 100]
          },
          successRate: {
            $multiply: [{ $divide: [{ $subtract: ['$total', '$errors'] }, '$total'] }, 100]
          },
          avgResponseTime: 1,
          requestCount: '$total'
        }
      },
      { $sort: { errorRate: -1 } },
      { $limit: 20 }
    ]);

    const formattedData = apiStats.map(stat => ({
      apiId: stat.apiNumber,
      method: 'GET',
      path: apiMapping[stat.apiNumber] || 'Unknown',
      successRate: `${Math.round(stat.successRate)}%`,
      avgResponse: `${Math.round(stat.avgResponseTime)}ms`,
      requestCount: stat.requestCount
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error in getTopErrorApis:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top error APIs',
      error: error.message
    });
  }
};

/**
 * Get API success rate history over time for a specific API
 */
export const getApiSuccessRateHistory = async (req, res) => {
  try {
    const { apiNumber, hours = 24, dateFrom, dateTo, serverIdentifier } = req.query;

    // Build query filter
    const filter = {};
    
    if (apiNumber && apiNumber !== 'ALL') {
      filter.apiNumber = apiNumber;
    }
    
    if (serverIdentifier) {
      filter.serverIdentifier = serverIdentifier;
    }

    // Set time range - default to last 24 hours
    const hoursNum = parseInt(hours);
    const now = new Date();
    const startTime = dateFrom ? new Date(dateFrom) : new Date(now.getTime() - hoursNum * 60 * 60 * 1000);
    const endTime = dateTo ? new Date(dateTo) : now;
    
    filter.date = { $gte: startTime, $lte: endTime };

    // Group by hour and calculate success rate
    const successRateData = await ApiLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
            hour: { $hour: '$date' }
          },
          totalRequests: { $sum: 1 },
          successRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Information'] }, 1, 0]
            }
          },
          timestamp: { $first: '$date' }
        }
      },
      {
        $project: {
          _id: 0,
          timestamp: 1,
          successRate: {
            $multiply: [
              { $divide: ['$successRequests', '$totalRequests'] },
              100
            ]
          },
          totalRequests: 1,
          successRequests: 1
        }
      },
      { $sort: { timestamp: 1 } }
    ]);

    res.json({
      success: true,
      data: successRateData
    });
  } catch (error) {
    console.error('Error in getApiSuccessRateHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching API success rate history',
      error: error.message
    });
  }
};
