const User = require('../models/User.mongo');
const Student = require('../models/Student.mongo');
const bcrypt = require('bcryptjs');

// Bulk add students from CSV/JSON
const bulkAddStudents = async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'Invalid student data. Expected an array of students.' });
    }

    const results = [];
    const errors = [];

    for (const studentData of students) {
      try {
        // Validate required fields
        if (!studentData.name || !studentData.email || !studentData.roll_number || !studentData.program || !studentData.semester) {
          errors.push({
            data: studentData,
            error: 'Missing required fields (name, email, roll_number, program, semester)'
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: studentData.email });
        if (existingUser) {
          errors.push({
            data: studentData,
            error: 'Email already exists'
          });
          continue;
        }

        // Check if roll number already exists
        const existingStudent = await Student.findOne({ roll_number: studentData.roll_number });
        if (existingStudent) {
          errors.push({
            data: studentData,
            error: 'Roll number already exists'
          });
          continue;
        }

        // Generate user_id and student_id
        const user_id = `STU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const student_id = `S-${studentData.roll_number}`;

        // Generate default password (can be roll number or a random password)
        const defaultPassword = studentData.password || studentData.roll_number;

        // Create user account
        const user = new User({
          user_id,
          name: studentData.name,
          email: studentData.email,
          password: defaultPassword, // Will be hashed by pre-save hook
          role: 'student',
          program: studentData.program,
          semester: studentData.semester
        });

        await user.save();

        // Create student profile
        const student = new Student({
          student_id,
          user_id,
          roll_number: studentData.roll_number,
          enrollment_number: studentData.enrollment_number || undefined,
          program: studentData.program,
          semester: studentData.semester,
          batch: studentData.batch || '',
          section: studentData.section || '',
          phone: studentData.phone || '',
          parent_phone: studentData.parent_phone || '',
          address: studentData.address || '',
          date_of_birth: studentData.date_of_birth ? new Date(studentData.date_of_birth) : null,
          blood_group: studentData.blood_group || '',
          status: 'active'
        });

        await student.save();

        results.push({
          name: studentData.name,
          email: studentData.email,
          roll_number: studentData.roll_number,
          user_id,
          student_id,
          success: true
        });
      } catch (error) {
        errors.push({
          data: studentData,
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: 'Bulk student upload completed',
      total: students.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('Error in bulk student upload:', error);
    res.status(500).json({ message: 'Failed to upload students', error: error.message });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const { program, semester, status } = req.query;

    console.log('=== GET ALL STUDENTS ===');
    console.log('Query parameters:', req.query);

    // Build query for User collection (simpler approach)
    const userQuery = { role: 'student' };
    if (program) userQuery.program = program;
    if (semester) userQuery.semester = parseInt(semester);

    console.log('User query:', userQuery);

    // Get all student users
    const users = await User.find(userQuery)
      .select('user_id name email program semester created_at')
      .sort({ created_at: -1 });

    console.log(`Found ${users.length} student users`);

    // Get corresponding student profiles
    const studentsWithDetails = [];
    for (const user of users) {
      try {
        const studentProfile = await Student.findOne({ user_id: user.user_id });

        studentsWithDetails.push({
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          program: user.program,
          semester: user.semester,
          roll_number: studentProfile?.roll_number || 'N/A',
          enrollment_number: studentProfile?.enrollment_number || '',
          student_id: studentProfile?.student_id || user.user_id,
          phone: studentProfile?.phone || '',
          status: studentProfile?.status || 'active',
          created_at: user.created_at
        });
      } catch (err) {
        console.error(`Error loading profile for ${user.user_id}:`, err.message);
        // Still include the user even if profile fails
        studentsWithDetails.push({
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          program: user.program,
          semester: user.semester,
          roll_number: 'N/A',
          student_id: user.user_id,
          status: 'active'
        });
      }
    }

    console.log(`Returning ${studentsWithDetails.length} students with details`);
    if (studentsWithDetails.length > 0) {
      console.log('Sample student:', studentsWithDetails[0]);
    }

    res.json({ students: studentsWithDetails });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { student_id } = req.params;
    const updates = req.body;

    const student = await Student.findOne({ student_id });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update student fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'user_id' && key !== 'student_id') {
        student[key] = updates[key];
      }
    });

    await student.save();

    // Update user fields if provided
    if (updates.name || updates.email) {
      const user = await User.findOne({ user_id: student.user_id });
      if (user) {
        if (updates.name) user.name = updates.name;
        if (updates.email) user.email = updates.email;
        if (updates.program) user.program = updates.program;
        if (updates.semester) user.semester = updates.semester;
        await user.save();
      }
    }

    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { student_id } = req.params;

    const student = await Student.findOne({ student_id });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete user account
    await User.deleteOne({ user_id: student.user_id });

    // Delete student profile
    await Student.deleteOne({ student_id });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
};

// Get student credentials for download
const getStudentCredentials = async (req, res) => {
  try {
    const { program, semester } = req.query;

    let query = { status: 'active' };
    if (program) query.program = program;
    if (semester) query.semester = semester;

    const students = await Student.find(query);

    const credentials = await Promise.all(students.map(async (stu) => {
      const user = await User.findOne({ user_id: stu.user_id });
      return {
        student_id: stu.student_id,
        roll_number: stu.roll_number,
        name: user?.name || 'N/A',
        email: user?.email || 'N/A',
        program: stu.program,
        semester: stu.semester,
        password: '********' // Placeholder - implement secure password retrieval
      };
    }));

    res.json({ credentials });
  } catch (error) {
    console.error('Error fetching student credentials:', error);
    res.status(500).json({ message: 'Failed to fetch student credentials' });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { student_id } = req.params;

    const student = await Student.findOne({ student_id });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const user = await User.findOne({ user_id: student.user_id });

    res.json({
      student: {
        ...student.toObject(),
        name: user?.name,
        email: user?.email
      }
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Failed to fetch student' });
  }
};

module.exports = {
  bulkAddStudents,
  getAllStudents,
  updateStudent,
  deleteStudent,
  getStudentById,
  getStudentCredentials
};
