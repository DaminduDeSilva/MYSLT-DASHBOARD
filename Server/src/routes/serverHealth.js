import express from 'express';
import {
  getAllServersHealth,
  getServerHealth,
  updateServerHealth,
  initializeServerHealth,
  getServerMetricsSNMP,
  testSNMPConnectionEndpoint,
  addServerWithSNMP,
  deleteServer
} from '../controllers/serverHealthController.js';

const router = express.Router();

// Get all servers health
router.get('/', getAllServersHealth);

// Get specific server health by IP
router.get('/:ip', getServerHealth);

// Update server health (for monitoring agents)
router.post('/update', updateServerHealth);

// Initialize server health data
router.post('/initialize', initializeServerHealth);

// SNMP Routes
router.get('/snmp/:ip', getServerMetricsSNMP);
router.post('/snmp/test', testSNMPConnectionEndpoint);
router.post('/snmp/add', addServerWithSNMP);

// Delete server
router.delete('/:ip', deleteServer);

export default router;
