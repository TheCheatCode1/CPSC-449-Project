const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  term: { type: String, required: true },
  definition: { type: String, required: true },
  setId: { type: mongoose.Schema.Types.ObjectId, ref: 'Set', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Safe export
module.exports = mongoose.models.Card || mongoose.model('Card', cardSchema);
