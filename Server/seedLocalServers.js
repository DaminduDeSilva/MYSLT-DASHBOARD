import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const serverSchema = new mongoose.Schema({
  serverIp: { type: String, required: true, unique: true },
  osType: { type: String, enum: ['linux', 'windows'], required: true },
  snmpCommunity: { type: String, default: 'public' },
  status: { type: String, default: 'healthy' },
  lastUpdated: { type: Date, default: Date.now }
}, { collection: 'serverhealths' });

const ServerHealth = mongoose.model('ServerHealth', serverSchema);

const seedLocalServers = async () => {
  try {
    console.log('🔄 Connecting to Local MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/myslt_dashboard');
    console.log('✅ Connected.');

    const servers = [
      { serverIp: '192.168.100.137', osType: 'linux', snmpCommunity: 'public' },
      { serverIp: '192.168.100.114', osType: 'windows', snmpCommunity: 'public' },
      { serverIp: '192.168.100.113', osType: 'linux', snmpCommunity: 'public' }
    ];

    for (const server of servers) {
      await ServerHealth.findOneAndUpdate(
        { serverIp: server.serverIp },
        server,
        { upsert: true, new: true }
      );
      console.log(`📡 Seeded server: ${server.serverIp}`);
    }

    console.log('✨ Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedLocalServers();
