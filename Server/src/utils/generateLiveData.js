import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ApiLog from '../models/ApiLog.js';
import { apiMapping } from '../config/apiMapping.js';

// Load environment variables
dotenv.config();

// Configuration
const CONFIG = {
  GENERATION_INTERVAL: 2000, // Generate data every 2 seconds
  BATCH_SIZE: 5, // Generate 3-7 records per batch
  DELETE_OLDER_THAN_HOURS: 24, // Delete records older than 24 hours
  CLEANUP_INTERVAL: 300000, // Clean up every 5 minutes (300000ms)
};

// Sample data pools
const ACCESS_METHODS = ['MOBILE', 'WEB', 'CHATBOT'];
const SERVERS = ['16', '21', '138'];
const STATUSES = ['Information', 'Warning', 'Error'];
const STATUS_WEIGHTS = [0.85, 0.10, 0.05]; // 85% Info, 10% Warning, 5% Error

// Sample emails and phone numbers
const SAMPLE_CONTACTS = [
  'dinushpriyamal@gmail.com',
  'user123@gmail.com',
  'test.user@yahoo.com',
  'john.doe@outlook.com',
  'sarah.smith@gmail.com',
  '0712399203',
  '0756430431',
  '0757281193',
  '0771234567',
  '0779876543',
  '0112345678',
  '0775551234',
];

// Get random API number from the mapping
const getRandomApiNumber = () => {
  const apiNumbers = Object.keys(apiMapping);
  return apiNumbers[Math.floor(Math.random() * apiNumbers.length)];
};

// Get weighted random status
const getRandomStatus = () => {
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < STATUSES.length; i++) {
    cumulative += STATUS_WEIGHTS[i];
    if (random < cumulative) {
      return STATUSES[i];
    }
  }
  return STATUSES[0];
};

// Generate random response time based on status
const getResponseTime = (status) => {
  if (status === 'Error') {
    return Math.floor(Math.random() * 2000) + 1000; // 1000-3000ms for errors
  } else if (status === 'Warning') {
    return Math.floor(Math.random() * 800) + 400; // 400-1200ms for warnings
  } else {
    return Math.floor(Math.random() * 400) + 50; // 50-450ms for information
  }
};

// Generate a single log record
const generateLogRecord = () => {
  const timestamp = Date.now();
  const accessMethod = ACCESS_METHODS[Math.floor(Math.random() * ACCESS_METHODS.length)];
  const customerEmail = SAMPLE_CONTACTS[Math.floor(Math.random() * SAMPLE_CONTACTS.length)];
  const status = getRandomStatus();
  const apiNumber = getRandomApiNumber();
  const responseTime = getResponseTime(status);
  const serverIdentifier = SERVERS[Math.floor(Math.random() * SERVERS.length)];
  
  return {
    startTimestamp: timestamp.toString(),
    accessMethod,
    customerEmail,
    status,
    apiNumber,
    endTimestamp: (timestamp + responseTime).toString(),
    responseTime,
    serverIdentifier,
    date: new Date(),
  };
};

// Generate and insert batch of records
const generateBatch = async () => {
  try {
    const batchSize = Math.floor(Math.random() * 4) + CONFIG.BATCH_SIZE - 2; // 3-7 records
    const records = [];
    
    for (let i = 0; i < batchSize; i++) {
      records.push(generateLogRecord());
    }
    
    await ApiLog.insertMany(records);
    
    const totalCount = await ApiLog.countDocuments();
    console.log(`✓ Generated ${batchSize} records | Total in DB: ${totalCount}`);
  } catch (error) {
    console.error('Error generating batch:', error.message);
  }
};

// Delete old records
const cleanupOldRecords = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - CONFIG.DELETE_OLDER_THAN_HOURS);
    
    const result = await ApiLog.deleteMany({
      date: { $lt: cutoffDate }
    });
    
    if (result.deletedCount > 0) {
      console.log(`🗑️  Cleaned up ${result.deletedCount} old records (older than ${CONFIG.DELETE_OLDER_THAN_HOURS} hours)`);
    }
  } catch (error) {
    console.error('Error during cleanup:', error.message);
  }
};

// Main function
const startLiveDataGenerator = async () => {
  try {
    // Connect to MongoDB using environment variable
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🔗 Connected to MongoDB');
    console.log('🚀 Starting live data generator...');
    console.log(`📊 Config: ${CONFIG.BATCH_SIZE}± records every ${CONFIG.GENERATION_INTERVAL/1000}s`);
    console.log(`🗑️  Auto-cleanup: Records older than ${CONFIG.DELETE_OLDER_THAN_HOURS} hours`);
    console.log('---');
    
    // Initial cleanup
    await cleanupOldRecords();
    
    // Start generation interval
    setInterval(generateBatch, CONFIG.GENERATION_INTERVAL);
    
    // Start cleanup interval
    setInterval(cleanupOldRecords, CONFIG.CLEANUP_INTERVAL);
    
  } catch (error) {
    console.error('❌ Error starting live data generator:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Stopping live data generator...');
  await mongoose.connection.close();
  console.log('👋 Disconnected from MongoDB');
  process.exit(0);
});

// Start the generator
startLiveDataGenerator();
