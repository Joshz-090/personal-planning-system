const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'denied'], default: 'active' }, // Admin can set to 'denied'
  
  // Subscription fields
  subscription: {
    plan: { type: String, enum: ['free', 'ai', 'pro'], default: 'free' },
    status: { type: String, enum: ['active', 'pending', 'expired'], default: 'active' },
    expiryDate: { type: Date },
    lastPaymentRef: { type: String },
    pendingPlan: { type: String }, // Plan user is waiting for approval for
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
