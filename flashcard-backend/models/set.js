const mongoose = require('mongoose');
const setSchema = new mongoose.Schema({
  title: String,
  description: String,
  createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true
  },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Set', setSchema);
