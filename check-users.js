const mongoose = require('mongoose');
const User = require('./models/User.mongo');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/acadify')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    // Check all users
    const users = await User.find({});
    console.log(`Total users in database: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ NO USERS FOUND! Database needs to be seeded.');
      console.log('Run: npm run seed\n');
    } else {
      console.log('Users found:');
      users.forEach(user => {
        console.log(`- ${user.role.toUpperCase()}: ${user.email} (${user.name})`);
      });
      
      console.log('\n--- Testing Login Credentials ---\n');
      
      // Test admin
      const admin = await User.findOne({ email: 'admin@acadify.com' });
      if (admin) {
        const adminMatch = await admin.comparePassword('admin123');
        console.log(`Admin (admin@acadify.com / admin123): ${adminMatch ? '✅ VALID' : '❌ INVALID'}`);
      } else {
        console.log('Admin: ❌ NOT FOUND');
      }
      
      // Test faculty
      const faculty = await User.findOne({ email: 'john.smith@acadify.com' });
      if (faculty) {
        const facultyMatch = await faculty.comparePassword('faculty123');
        console.log(`Faculty (john.smith@acadify.com / faculty123): ${facultyMatch ? '✅ VALID' : '❌ INVALID'}`);
      } else {
        console.log('Faculty: ❌ NOT FOUND');
      }
      
      // Test student
      const student = await User.findOne({ email: 'alice@example.com' });
      if (student) {
        const studentMatch = await student.comparePassword('student123');
        console.log(`Student (alice@example.com / student123): ${studentMatch ? '✅ VALID' : '❌ INVALID'}`);
      } else {
        console.log('Student: ❌ NOT FOUND');
      }
    }
    
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
