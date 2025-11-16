import express from 'express';
import {
  getDashboardStats,
  getApiResponseTimes,
  getApiSuccessRates,
  getLiveTraffic,
  getApiDetails,
  getApiList
} from '../controllers/dashboardController.js';

const router = express.Router();

// Dashboard statistics
router.get('/stats', getDashboardStats);

// API response times
router.get('/response-times', getApiResponseTimes);

// API success rates
router.get('/success-rates', getApiSuccessRates);

// Live traffic data
router.get('/live-traffic', getLiveTraffic);

// API details table
router.get('/api-details', getApiDetails);

// Get API list for filters
router.get('/api-list', getApiList);

export default router;
