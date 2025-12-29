import express from 'express';
import { ingestLogs } from '../controllers/logController.js';

const router = express.Router();

// Define log ingestion route
router.post('/ingest', ingestLogs);

export default router;
