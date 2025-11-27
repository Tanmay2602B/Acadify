const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User.mongo');
const Student = require('./models/Student.mongo');
const Exam = require('./models/Exam.mongo').Exam;
const ExamSubmission = require('./models/Exam.mongo').ExamSubmission;
const Attendance = require('./models/Attendance.mongo');
const ReportCard = require('./models/ReportCard.mongo');
const Timetable = require('./models/Timetable.mongo');
const Resource = require('./models/Resource.mongo');
const Notification = require('./models/Notification.mongo');
const Meeting = require('./models/Meeting.mongo');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/acadify', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Exam.deleteMany({});
    await ExamSubmission.deleteMany({});
    await Attendance.deleteMany({});
    await ReportCard.deleteMany({});
    await Timetable.deleteMany({});
    await Resource.deleteMany({});
    await Notification.deleteMany({});
    await Meeting.deleteMany({});
    
    console.log('Creating seed data...');
    
    // Create Admin
    const admin = new User({
      user_id: 'ADM-001',
      name: 'Admin User',
      email: 'admin@acadify.com',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();
    console.log('✓ Admin created');
    
    // Create Faculty
    const faculty1 = new User({
      user_id: 'FAC-001',
      name: 'Dr. John Smith',
      email: 'john.smith@acadify.com',
      password: 'faculty123',
      role: 'faculty',
      department: 'Computer Science',
      designation: 'Professor'
    });
    await faculty1.save();
    
    const faculty2 = new User({
      user_id: 'FAC-002',
      name: 'Prof. Jane Doe',
      email: 'jane.doe@acadify.com',
      password: 'faculty123',
      role: 'faculty',
      department: 'Mathematics',
      designation: 'Associate Professor'
    });
    await faculty2.save();
    console.log('✓ Faculty created (2)');
    
    // Create Students
    const students = [
      {
        user_id: 'STU-001',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'student123',
        role: 'student',
        program: 'BCA',
        semester: '1'
      },
      {
        user_id: 'STU-002',
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'student123',
        role: 'student',
        program: 'BCA',
        semester: '1'
      },
      {
        user_id: 'STU-003',
        name: 'Carol Davis',
        email: 'carol@example.com',
        password: 'student123',
        role: 'student',
        program: 'BCA',
        semester: '1'
      }
    ];
    
    for (const studentData of students) {
      const student = new User(studentData);
      await student.save();
      
      // Create student profile
      const studentProfile = new Student({
        student_id: `S-${studentData.user_id}`,
        user_id: studentData.user_id,
        roll_number: `BCA1${studentData.user_id.split('-')[1]}`,
        enrollment_number: `EN2024${studentData.user_id.split('-')[1]}`,
        program: studentData.program,
        semester: studentData.semester,
        batch: '2024-2027',
        section: 'A',
        phone: '9876543210',
        status: 'active'
      });
      await studentProfile.save();
    }
    console.log('✓ Students created (3)');
    
    // Create Sample Timetable
    const timetable = new Timetable({
      timetable_id: 'TT-BCA-1-2024',
      program: 'BCA',
      semester: '1',
      academic_year: '2024-2025',
      entries: [
        {
          day: 'Monday',
          start_time: '09:00',
          end_time: '10:00',
          subject: 'Programming in C',
          faculty_id: 'FAC-001',
          faculty_name: 'Dr. John Smith',
          room: 'Room 101',
          type: 'lecture'
        },
        {
          day: 'Monday',
          start_time: '10:00',
          end_time: '11:00',
          subject: 'Mathematics',
          faculty_id: 'FAC-002',
          faculty_name: 'Prof. Jane Doe',
          room: 'Room 102',
          type: 'lecture'
        },
        {
          day: 'Tuesday',
          start_time: '09:00',
          end_time: '10:00',
          subject: 'Digital Electronics',
          faculty_id: 'FAC-001',
          faculty_name: 'Dr. John Smith',
          room: 'Room 103',
          type: 'lecture'
        }
      ],
      is_active: true
    });
    await timetable.save();
    console.log('✓ Timetable created');
    
    // Create Sample Meeting
    const meeting = new Meeting({
      meeting_id: 'MTG-001',
      title: 'Programming Lecture',
      description: 'Introduction to C Programming',
      program: 'BCA',
      semester: '1',
      subject: 'Programming in C',
      faculty_id: 'FAC-001',
      faculty_name: 'Dr. John Smith',
      scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 60,
      jitsi_room_name: 'acadify-bca-1-programming',
      jitsi_room_url: 'https://meet.jit.si/acadify-bca-1-programming',
      status: 'scheduled',
      auto_attendance: true,
      minimum_duration: 30
    });
    await meeting.save();
    console.log('✓ Meeting created');
    
    // Create Sample Quiz
    const quiz = new Exam({
      exam_id: 'QUIZ-001',
      title: 'Programming Quiz 1',
      description: 'Basic C Programming Concepts',
      program: 'BCA',
      semester: '1',
      subject: 'Programming in C',
      faculty_id: 'FAC-001',
      duration: 30,
      total_marks: 10,
      start_time: new Date(),
      end_time: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      questions: [
        {
          question_text: 'What is the correct syntax to output "Hello World" in C?',
          option_a: 'echo("Hello World");',
          option_b: 'printf("Hello World");',
          option_c: 'System.out.println("Hello World");',
          option_d: 'cout << "Hello World";',
          correct_answer: 'option_b',
          marks: 2
        },
        {
          question_text: 'Which of the following is a valid variable name in C?',
          option_a: '2variable',
          option_b: 'variable-name',
          option_c: 'variable_name',
          option_d: 'variable name',
          correct_answer: 'option_c',
          marks: 2
        },
        {
          question_text: 'What is the size of int data type in C (on most systems)?',
          option_a: '2 bytes',
          option_b: '4 bytes',
          option_c: '8 bytes',
          option_d: '1 byte',
          correct_answer: 'option_b',
          marks: 2
        },
        {
          question_text: 'Which operator is used to access the address of a variable?',
          option_a: '*',
          option_b: '&',
          option_c: '#',
          option_d: '@',
          correct_answer: 'option_b',
          marks: 2
        },
        {
          question_text: 'What is the output of: printf("%d", 5 + 3 * 2);',
          option_a: '16',
          option_b: '11',
          option_c: '13',
          option_d: '10',
          correct_answer: 'option_b',
          marks: 2
        }
      ],
      anti_cheat_enabled: true,
      randomize_questions: true,
      show_results: true,
      status: 'published'
    });
    await quiz.save();
    console.log('✓ Quiz created');
    
    // Create Sample Attendance
    const attendance = new Attendance({
      attendance_id: 'ATT-001',
      program: 'BCA',
      semester: '1',
      subject: 'Programming in C',
      faculty_id: 'FAC-001',
      date: new Date(),
      records: [
        {
          student_id: 'STU-001',
          status: 'present',
          marked_at: new Date()
        },
        {
          student_id: 'STU-002',
          status: 'present',
          marked_at: new Date()
        },
        {
          student_id: 'STU-003',
          status: 'absent',
          marked_at: new Date()
        }
      ]
    });
    await attendance.save();
    console.log('✓ Attendance created');
    
    // Create Sample Notifications
    const notifications = [
      {
        notification_id: 'NOT-001',
        recipient_id: 'STU-001',
        recipient_role: 'student',
        type: 'meeting',
        title: 'New Meeting Scheduled',
        message: 'A new meeting "Programming Lecture" has been scheduled for tomorrow',
        link: '/student/meetings/MTG-001',
        is_read: false,
        priority: 'high'
      },
      {
        notification_id: 'NOT-002',
        recipient_id: 'STU-002',
        recipient_role: 'student',
        type: 'assignment',
        title: 'New Assignment Posted',
        message: 'A new assignment has been posted for Programming in C',
        link: '/student/assignments',
        is_read: false,
        priority: 'high'
      }
    ];
    
    for (const notifData of notifications) {
      const notification = new Notification(notifData);
      await notification.save();
    }
    console.log('✓ Notifications created (2)');
    
    // Create Sample Report Card
    const reportCard = new ReportCard({
      report_id: 'RPT-STU-001-1-2024',
      student_id: 'STU-001',
      program: 'BCA',
      semester: '1',
      academic_year: '2024-2025',
      subjects: [
        {
          subject: 'Programming in C',
          internal_marks: 18,
          external_marks: 75,
          total_marks: 93,
          max_marks: 100,
          grade: 'A+',
          credits: 4
        },
        {
          subject: 'Mathematics',
          internal_marks: 20,
          external_marks: 80,
          total_marks: 100,
          max_marks: 100,
          grade: 'A+',
          credits: 4
        }
      ],
      total_marks_obtained: 193,
      total_max_marks: 200,
      percentage: 96.5,
      sgpa: 10,
      cgpa: 10,
      attendance_percentage: 95,
      remarks: 'Excellent performance. Keep up the good work!',
      status: 'published'
    });
    await reportCard.save();
    console.log('✓ Report Card created');
    
    // Create Sample Resource
    const resource = new Resource({
      resource_id: 'RES-001',
      title: 'Introduction to C Programming',
      description: 'Basic concepts of C programming language',
      type: 'notes',
      program: 'BCA',
      semester: '1',
      subject: 'Programming in C',
      faculty_id: 'FAC-001',
      file_url: 'https://example.com/notes.pdf',
      file_type: 'pdf',
      is_active: true
    });
    await resource.save();
    console.log('✓ Resource created');
    
    console.log('\n✅ Seed data created successfully!');
    console.log('\n📊 Summary:');
    console.log('  - Admin: 1');
    console.log('  - Faculty: 2');
    console.log('  - Students: 3');
    console.log('  - Timetable: 1');
    console.log('  - Meeting: 1');
    console.log('  - Quiz: 1');
    console.log('  - Attendance: 1');
    console.log('  - Notifications: 2');
    console.log('  - Report Card: 1');
    console.log('  - Resource: 1');
    
    console.log('\n🔑 Login Credentials:');
    console.log('  Admin:   admin@acadify.com / admin123');
    console.log('  Faculty: john.smith@acadify.com / faculty123');
    console.log('  Student: alice@example.com / student123');
    
    console.log('\n✨ All MongoDB collections are now visible in MongoDB Compass!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
});
