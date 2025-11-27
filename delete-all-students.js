// Script to delete all students from database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.mongo');
const Student = require('./models/Student.mongo');

async function deleteAllStudents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        
        // Count before deletion
        const userCount = await User.countDocuments({ role: 'student' });
        const studentCount = await Student.countDocuments({});
        
        console.log(`Found ${userCount} student users`);
        console.log(`Found ${studentCount} student profiles\n`);
        
        if (userCount === 0 && studentCount === 0) {
            console.log('No students to delete.');
            await mongoose.disconnect();
            return;
        }
        
        // Confirm deletion
        console.log('⚠️  WARNING: This will delete ALL students!');
        console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('Deleting students...\n');
        
        // Delete student profiles
        const studentResult = await Student.deleteMany({});
        console.log(`✅ Deleted ${studentResult.deletedCount} student profiles`);
        
        // Delete student users
        const userResult = await User.deleteMany({ role: 'student' });
        console.log(`✅ Deleted ${userResult.deletedCount} student users`);
        
        // Verify deletion
        const remainingUsers = await User.countDocuments({ role: 'student' });
        const remainingStudents = await Student.countDocuments({});
        
        console.log(`\n📊 Remaining:`);
        console.log(`   Student users: ${remainingUsers}`);
        console.log(`   Student profiles: ${remainingStudents}`);
        
        if (remainingUsers === 0 && remainingStudents === 0) {
            console.log('\n✅ All students deleted successfully!');
        } else {
            console.log('\n⚠️  Some students may not have been deleted');
        }
        
        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

deleteAllStudents();
