const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  title: String,
  description: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Safe export
module.exports = mongoose.models.Set || mongoose.model('Set', setSchema);
