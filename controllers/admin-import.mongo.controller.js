const User = require('../models/User.mongo');
const Student = require('../models/Student.mongo');
const { parseFile, validateStudentData, validateFacultyData, generateTemplate } = require('../utils/csvParser');
const { generateSecurePassword, generateUserId } = require('../utils/passwordGenerator');
const bcrypt = require('bcryptjs');

/**
 * Import students from CSV/Excel - REDESIGNED
 */
const importStudents = async (req, res) => {
  try {
    console.log('\n=== IMPORT STUDENTS - PARSE FILE ===');

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log(`File: ${req.file.originalname}`);
    console.log(`Size: ${req.file.size} bytes`);
    console.log(`Type: ${req.file.mimetype}`);

    // Parse file
    const data = parseFile(req.file.buffer, req.file.mimetype);
    console.log(`Parsed ${data.length} rows from file`);

    if (data.length === 0) {
      return res.status(400).json({ message: 'File is empty or invalid format' });
    }

    // Log first row to check column names
    console.log('First row columns:', Object.keys(data[0]));
    console.log('First row sample:', JSON.stringify(data[0], null, 2));

    // Validate data with detailed logging
    const { valid, invalid } = validateStudentData(data);

    console.log(`Validation: ${valid.length} valid, ${invalid.length} invalid`);

    if (invalid.length > 0) {
      console.log('Invalid rows:', invalid.slice(0, 3)); // Show first 3 invalid
    }

    if (valid.length === 0) {
      return res.status(400).json({
        message: 'No valid records found. Check column names and data format.',
        invalid: invalid.slice(0, 10), // Return first 10 invalid rows
        hint: 'Required columns: name, email, program, semester'
      });
    }

    // Generate user IDs and passwords
    const studentsWithCredentials = valid.map(student => {
      const user_id = generateUserId('student');
      const password = generateSecurePassword(12);

      return {
        name: String(student.name).trim(),
        email: String(student.email).toLowerCase().trim(),
        program: String(student.program).trim(),
        semester: parseInt(student.semester),
        roll_number: student.roll_number || '',
        enrollment_number: student.enrollment_number || undefined,
        batch: student.batch || '',
        section: student.section || '',
        phone: student.phone || '',
        parent_phone: student.parent_phone || '',
        address: student.address || '',
        date_of_birth: student.date_of_birth || null,
        blood_group: student.blood_group || '',
        user_id,
        password
      };
    });

    console.log(`✅ Prepared ${studentsWithCredentials.length} students for import`);

    // Return preview for confirmation
    res.json({
      message: 'File parsed successfully',
      preview: studentsWithCredentials,
      total: studentsWithCredentials.length,
      invalid: invalid.length > 0 ? invalid.slice(0, 10) : undefined,
      invalidCount: invalid.length
    });

  } catch (error) {
    console.error('❌ Import error:', error);
    res.status(500).json({
      message: 'Failed to parse file',
      error: error.message,
      hint: 'Make sure file is .xlsx or .csv format with correct columns'
    });
  }
};

/**
 * Confirm and save imported students
 */
const confirmImportStudents = async (req, res) => {
  try {
    const { students } = req.body;

    console.log('\n=== CONFIRM IMPORT STUDENTS - SAVE TO DATABASE ===');
    console.log(`Received ${students?.length || 0} students to save`);

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'No students data provided' });
    }

    console.log('Sample student:', JSON.stringify(students[0], null, 2));

    const results = [];
    const errors = [];
    let processed = 0;

    for (const studentData of students) {
      processed++;

      try {
        const email = String(studentData.email).toLowerCase().trim();
        const name = String(studentData.name).trim();

        if (processed <= 3 || processed % 10 === 0) {
          console.log(`[${processed}/${students.length}] Processing: ${name}`);
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
          console.log(`  ⏭️  Skipped (duplicate): ${email}`);
          errors.push({
            email: email,
            name: name,
            error: 'Email already exists in database'
          });
          continue;
        }

        // Create user account
        const user = new User({
          user_id: studentData.user_id,
          name: name,
          email: email,
          password: studentData.password,
          role: 'student',
          program: studentData.program,
          semester: studentData.semester
        });

        await user.save();

        // Create student profile
        const student = new Student({
          student_id: `S-${studentData.user_id}`,
          user_id: studentData.user_id,
          roll_number: studentData.roll_number || `${studentData.program}${studentData.semester}${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`,
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
          user_id: studentData.user_id,
          name: name,
          email: email,
          password: studentData.password,
          program: studentData.program,
          semester: studentData.semester,
          success: true
        });

      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        errors.push({
          email: studentData.email,
          name: studentData.name,
          error: error.message
        });
      }
    }

    console.log('\n=== IMPORT COMPLETE ===');
    console.log(`✅ Successfully added: ${results.length}`);
    console.log(`❌ Failed: ${errors.length}`);
    console.log(`📊 Total processed: ${students.length}`);

    res.status(201).json({
      message: 'Import completed',
      total: students.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Confirm import error:', error);
    res.status(500).json({ message: 'Failed to save students', error: error.message });
  }
};

/**
 * Import faculty from CSV/Excel
 */
const importFaculty = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const data = parseFile(req.file.buffer, req.file.mimetype);
    const { valid, invalid } = validateFacultyData(data);

    if (valid.length === 0) {
      return res.status(400).json({
        message: 'No valid records found',
        invalid
      });
    }

    const facultyWithCredentials = valid.map(faculty => {
      const user_id = generateUserId('faculty');
      const password = generateSecurePassword(12);

      return {
        ...faculty,
        user_id,
        password,
        email: String(faculty.email).toLowerCase().trim()
      };
    });

    res.json({
      message: 'File parsed successfully',
      preview: facultyWithCredentials,
      total: facultyWithCredentials.length,
      invalid: invalid.length > 0 ? invalid : undefined
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Failed to import faculty', error: error.message });
  }
};

/**
 * Confirm and save imported faculty
 */
const confirmImportFaculty = async (req, res) => {
  try {
    const { faculty } = req.body;

    if (!Array.isArray(faculty) || faculty.length === 0) {
      return res.status(400).json({ message: 'No faculty data provided' });
    }

    const results = [];
    const errors = [];

    for (const facultyData of faculty) {
      try {
        const existingUser = await User.findOne({ email: facultyData.email });
        if (existingUser) {
          errors.push({
            email: facultyData.email,
            error: 'Email already exists'
          });
          continue;
        }

        const user = new User({
          user_id: facultyData.user_id,
          name: facultyData.name,
          email: facultyData.email,
          password: facultyData.password,
          role: 'faculty',
          department: facultyData.department,
          designation: facultyData.designation
        });

        await user.save();

        results.push({
          user_id: facultyData.user_id,
          name: facultyData.name,
          email: facultyData.email,
          password: facultyData.password,
          success: true
        });

      } catch (error) {
        errors.push({
          email: facultyData.email,
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: 'Import completed',
      total: faculty.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Confirm import error:', error);
    res.status(500).json({ message: 'Failed to save faculty', error: error.message });
  }
};

/**
 * Download CSV template
 */
const downloadTemplate = (req, res) => {
  try {
    const { type } = req.params; // 'student' or 'faculty'

    const template = generateTemplate(type);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-template.csv`);
    res.send(template);

  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({ message: 'Failed to generate template' });
  }
};

module.exports = {
  importStudents,
  confirmImportStudents,
  importFaculty,
  confirmImportFaculty,
  downloadTemplate
};
