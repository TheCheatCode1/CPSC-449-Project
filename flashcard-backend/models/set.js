const mongoose = require('mongoose');
const setSchema = new mongoose.Schema({
  title: String,
  description: String,
  createdBy: String, // or ObjectId reference to user
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Set', setSchema);
