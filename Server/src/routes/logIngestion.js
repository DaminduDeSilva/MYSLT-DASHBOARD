import express from 'express';
import { ingestLogs, ingestLogStream } from '../controllers/logController.js';

const router = express.Router();

// Define log ingestion routes
router.post('/ingest', ingestLogs);
router.post('/ingest/stream', ingestLogStream);

export default router;
