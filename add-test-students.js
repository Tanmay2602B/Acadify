// Script to add a few test students to verify the system
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.mongo');
const Student = require('./models/Student.mongo');

async function addTestStudents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        
        const testStudents = [
            {
                name: 'Test Student 1',
                email: 'test1@student.com',
                roll_number: 'BCA001',
                program: 'BCA',
                semester: 1
            },
            {
                name: 'Test Student 2',
                email: 'test2@student.com',
                roll_number: 'BCA002',
                program: 'BCA',
                semester: 1
            },
            {
                name: 'Test Student 3',
                email: 'test3@student.com',
                roll_number: 'MCA001',
                program: 'MCA',
                semester: 1
            }
        ];
        
        let added = 0;
        let skipped = 0;
        
        for (const studentData of testStudents) {
            // Check if already exists
            const existing = await User.findOne({ email: studentData.email });
            if (existing) {
                console.log(`⏭️  Skipped: ${studentData.name} (already exists)`);
                skipped++;
                continue;
            }
            
            // Create user
            const user_id = `STU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const user = new User({
                user_id,
                name: studentData.name,
                email: studentData.email,
                password: 'password123', // Default password
                role: 'student',
                program: studentData.program,
                semester: studentData.semester
            });
            
            await user.save();
            
            // Create student profile
            const student = new Student({
                student_id: `S-${user_id}`,
                user_id,
                roll_number: studentData.roll_number,
                program: studentData.program,
                semester: studentData.semester,
                status: 'active'
            });
            
            await student.save();
            
            console.log(`✅ Added: ${studentData.name} (${studentData.email})`);
            added++;
        }
        
        console.log(`\n📊 Summary:`);
        console.log(`   Added: ${added}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Total: ${added + skipped}`);
        
        // Show total count
        const totalStudents = await User.countDocuments({ role: 'student' });
        console.log(`\n👥 Total students in database: ${totalStudents}`);
        
        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

addTestStudents();
