const mongoose = require('mongoose');
require('dotenv').config(); // ✅ Load from .env

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI; // ✅ Use variable from .env
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`✅ MongoDB connected: ${conn.connection.name}`);
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
