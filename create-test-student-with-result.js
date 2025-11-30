require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.mongo');
const Student = require('./models/Student.mongo');
const ReportCard = require('./models/ReportCard.mongo');

async function createTestStudentWithResult() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const studentData = {
            name: 'Result Test Student',
            email: 'result_test@student.com',
            roll_number: 'RES001',
            program: 'BCA',
            semester: 1,
            password: 'password123'
        };

        // 1. Create User
        // Check if exists
        let user = await User.findOne({ email: studentData.email });
        if (user) {
            console.log('User already exists, updating...');
            // Optional: delete existing to start fresh or just update
            await User.deleteOne({ email: studentData.email });
            await Student.deleteOne({ user_id: user.user_id });
            await ReportCard.deleteMany({ student_id: user.user_id });
            console.log('Deleted existing user data.');
        }

        const user_id = `STU-${Date.now()}`;
        user = new User({
            user_id,
            name: studentData.name,
            email: studentData.email,
            password: studentData.password,
            role: 'student',
            program: studentData.program,
            semester: studentData.semester
        });
        await user.save();
        console.log(`✅ Created User: ${user.email}`);

        // 2. Create Student Profile
        const student = new Student({
            student_id: `S-${user_id}`,
            user_id,
            roll_number: studentData.roll_number,
            program: studentData.program,
            semester: studentData.semester,
            status: 'active'
        });
        await student.save();
        console.log(`✅ Created Student Profile`);

        // 3. Create Report Card
        const reportCard = new ReportCard({
            report_id: `REP-${Date.now()}`,
            student_id: user_id,
            program: studentData.program,
            semester: studentData.semester,
            academic_year: '2024-2025',
            subjects: [
                { subject: 'Programming in C', internal_marks: 40, external_marks: 50, total_marks: 90, max_marks: 100, grade: 'A+', credits: 4 },
                { subject: 'Mathematics', internal_marks: 35, external_marks: 45, total_marks: 80, max_marks: 100, grade: 'A', credits: 4 },
                { subject: 'Digital Electronics', internal_marks: 30, external_marks: 40, total_marks: 70, max_marks: 100, grade: 'B+', credits: 3 },
                { subject: 'Communication Skills', internal_marks: 45, external_marks: 40, total_marks: 85, max_marks: 100, grade: 'A+', credits: 2 }
            ],
            total_marks_obtained: 325,
            total_max_marks: 400,
            percentage: 81.25,
            cgpa: 8.5,
            sgpa: 8.5,
            attendance_percentage: 92,
            remarks: 'Excellent performance!',
            status: 'published'
        });
        await reportCard.save();
        console.log(`✅ Created Published Report Card`);

        console.log('\n🎉 Test Student Created Successfully!');
        console.log(`Email: ${studentData.email}`);
        console.log(`Password: ${studentData.password}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createTestStudentWithResult();
