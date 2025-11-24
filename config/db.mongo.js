const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB connection URI
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/acadify';

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch(err => {
  console.error('MongoDB connection failed:', err.message);
  console.log('The application will continue to run but database features will not work.');
  console.log('Please ensure MongoDB is installed and running, and the MONGO_URI is correct in .env file.');
});

module.exports = mongoose.connection;