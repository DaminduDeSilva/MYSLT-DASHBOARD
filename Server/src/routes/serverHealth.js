import express from 'express';
import {
  getAllServersHealth,
  getServerHealth,
  updateServerHealth,
  initializeServerHealth
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

export default router;
