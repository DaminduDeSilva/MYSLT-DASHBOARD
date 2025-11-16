import mongoose from 'mongoose';

const serverHealthSchema = new mongoose.Schema({
  serverIp: {
    type: String,
    required: true,
    unique: true
  },
  cpuUtilization: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  ramUsage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  diskSpace: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  networkTraffic: {
    type: Number,
    default: 0
  },
  uptime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['healthy', 'warning', 'critical'],
    default: 'healthy'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const ServerHealth = mongoose.model('ServerHealth', serverHealthSchema);

export default ServerHealth;
