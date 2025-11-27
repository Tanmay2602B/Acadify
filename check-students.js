// Quick script to check students in database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.mongo');

async function checkStudents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        
        // Count total students
        const totalStudents = await User.countDocuments({ role: 'student' });
        console.log(`📊 Total Students: ${totalStudents}\n`);
        
        // Get all students
        const students = await User.find({ role: 'student' })
            .select('user_id name email program semester')
            .sort({ created_at: -1 });
        
        if (students.length === 0) {
            console.log('⚠️ No students found in database');
        } else {
            console.log('👥 Student List:\n');
            
            // Group by program
            const byProgram = {};
            students.forEach(student => {
                const program = student.program || 'Unknown';
                if (!byProgram[program]) {
                    byProgram[program] = [];
                }
                byProgram[program].push(student);
            });
            
            // Display by program
            Object.keys(byProgram).sort().forEach(program => {
                console.log(`\n📚 ${program}:`);
                byProgram[program].forEach((student, idx) => {
                    console.log(`  ${idx + 1}. ${student.name} (${student.user_id})`);
                    console.log(`     Email: ${student.email}`);
                    console.log(`     Semester: ${student.semester || 'N/A'}`);
                });
                console.log(`  Total: ${byProgram[program].length} students`);
            });
            
            // Show recent additions
            console.log('\n\n🕐 Recently Added (Last 10):');
            students.slice(0, 10).forEach((student, idx) => {
                console.log(`  ${idx + 1}. ${student.name} - ${student.program} Sem ${student.semester}`);
            });
        }
        
        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkStudents();
