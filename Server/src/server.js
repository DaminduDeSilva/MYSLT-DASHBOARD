import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import dashboardRoutes from './routes/dashboard.js';
import serverHealthRoutes from './routes/serverHealth.js';
import logIngestionRoutes from './routes/logIngestion.js';
import { startSNMPMonitor } from './utils/snmpMonitor.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MySLT Monitoring API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/server-health', serverHealthRoutes);
app.use('/api/logs', logIngestionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 MySLT Monitoring API Server`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Start SNMP monitoring after server starts
  setTimeout(() => {
    startSNMPMonitor();
  }, 2000); // Wait 2 seconds for DB connection to stabilize
});

export default app;
