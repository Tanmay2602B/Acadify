const mongoose = require('mongoose');
const User = require('./models/User.mongo');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/acadify')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    // Check faculty
    const faculty = await User.find({ role: 'faculty' });
    console.log(`Total faculty in database: ${faculty.length}\n`);
    
    if (faculty.length === 0) {
        console.log('❌ NO FACULTY FOUND!');
    } else {
        console.log('Faculty found:');
        faculty.forEach(f => {
            console.log(`- ${f.name} (${f.email})`);
            console.log(`  User ID: ${f.user_id}`);
            console.log(`  Department: ${f.department || 'N/A'}`);
            console.log(`  Designation: ${f.designation || 'N/A'}`);
            console.log('');
        });
    }
    
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
