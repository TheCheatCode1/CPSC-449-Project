const mongoose = require('mongoose');
const cardSchema = new mongoose.Schema({
  setId: { type: mongoose.Schema.Types.ObjectId, ref: 'Set' },
  front: String,
  back: String,
  example: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});
module.exports = mongoose.model('Card', cardSchema);
