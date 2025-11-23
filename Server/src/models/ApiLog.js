import mongoose from 'mongoose';

const apiLogSchema = new mongoose.Schema({
  startTimestamp: {
    type: String,
    required: true,
    index: true
  },
  accessMethod: {
    type: String,
    required: true,
    enum: ['MOBILE', 'WEB', 'CHATBOT'],
    index: true
  },
  customerEmail: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Information', 'Warning', 'Error'],
    index: true
  },
  apiNumber: {
    type: String,
    required: true,
    index: true
  },
  endTimestamp: {
    type: String,
    required: true
  },
  responseTime: {
    type: Number,
    required: true
  },
  serverIdentifier: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
apiLogSchema.index({ date: -1 });
apiLogSchema.index({ apiNumber: 1, date: -1 });
apiLogSchema.index({ serverIdentifier: 1, date: -1 });
apiLogSchema.index({ customerEmail: 1, date: -1 });

const ApiLog = mongoose.model('ApiLog', apiLogSchema);

export default ApiLog;
