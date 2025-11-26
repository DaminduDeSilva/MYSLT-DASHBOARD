import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import ApiLog from '../models/ApiLog.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse a single log line
 * Format: startTimestamp,accessMethod,customerEmail,status,apiNumber,empty,endTimestamp,responseTime,serverIdentifier
 * Example: 63895996993756,MOBILE,xxxxxx@gmail.com,Information,A41,,63895996993991,234,16
 */
const parseLogLine = (line) => {
  const parts = line.split(',');
  
  if (parts.length < 9) {
    return null; // Invalid line
  }

  const [startTimestamp, accessMethod, customerEmail, status, apiNumber, , endTimestamp, responseTime, serverIdentifier] = parts;

  // Convert timestamp to date (assuming milliseconds)
  const date = new Date(parseInt(startTimestamp));

  return {
    startTimestamp,
    accessMethod,
    customerEmail,
    status,
    apiNumber,
    endTimestamp,
    responseTime: parseInt(responseTime) || 0,
    serverIdentifier,
    date
  };
};

/**
 * Import logs from filtered-log.txt to MongoDB
 */
const importLogs = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();

    const logFilePath = path.join(__dirname, '../../filtered-log.txt');
    
    if (!fs.existsSync(logFilePath)) {
      console.error('❌ Log file not found:', logFilePath);
      process.exit(1);
    }

    console.log('📂 Reading log file:', logFilePath);
    
    // Clear existing logs (optional - comment out if you want to keep old data)
    console.log('🗑️  Clearing existing logs...');
    await ApiLog.deleteMany({});
    
    const fileStream = fs.createReadStream(logFilePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    let successCount = 0;
    let errorCount = 0;
    const batchSize = 1000;
    const maxRecords = 200000; // Limit to 200,000 records
    let batch = [];

    for await (const line of rl) {
      // Stop if we've reached the limit
      if (successCount >= maxRecords) {
        console.log(`🛑 Reached limit of ${maxRecords} records. Stopping import.`);
        break;
      }
      
      lineCount++;
      
      if (!line.trim()) continue; // Skip empty lines

      const logData = parseLogLine(line);
      
      if (logData) {
        batch.push(logData);
        
        // Insert in batches for better performance
        if (batch.length >= batchSize) {
          try {
            await ApiLog.insertMany(batch, { ordered: false });
            successCount += batch.length;
            console.log(`✅ Imported ${successCount} logs...`);
            batch = [];
          } catch (error) {
            errorCount += batch.length;
            console.error('❌ Error inserting batch:', error.message);
            batch = [];
          }
        }
      } else {
        errorCount++;
      }

      // Progress update every 10000 lines
      if (lineCount % 10000 === 0) {
        console.log(`📊 Processed ${lineCount} lines...`);
      }
    }

    // Insert remaining batch
    if (batch.length > 0) {
      try {
        await ApiLog.insertMany(batch, { ordered: false });
        successCount += batch.length;
      } catch (error) {
        errorCount += batch.length;
        console.error('❌ Error inserting final batch:', error.message);
      }
    }

    console.log('\n✨ Import completed!');
    console.log(`📝 Total lines processed: ${lineCount}`);
    console.log(`✅ Successfully imported: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    // Get statistics
    const totalLogs = await ApiLog.countDocuments();
    const uniqueCustomers = await ApiLog.distinct('customerEmail');
    const uniqueAPIs = await ApiLog.distinct('apiNumber');
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Total logs in DB: ${totalLogs}`);
    console.log(`   Unique customers: ${uniqueCustomers.length}`);
    console.log(`   Unique APIs: ${uniqueAPIs.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
};

// Run the import
importLogs();
