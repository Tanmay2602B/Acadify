const User = require('../models/User.mongo');
const Student = require('../models/Student.mongo');
const Faculty = require('../models/Faculty.mongo');
const Program = require('../models/Program.mongo');
const Resource = require('../models/Resource.mongo');
const Meeting = require('../models/Meeting.mongo');
const Credential = require('../models/Credential.mongo');
const {
    generateFacultyId,
    generateFacultyPassword,
    generateStudentId,
    generateStudentPassword,
    generateRollNumber,
    generateProgramId
} = require('../utils/credentialGenerator');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const students = await User.countDocuments({ role: 'student' });
        const faculty = await User.countDocuments({ role: 'faculty' });
        const programs = await Program.countDocuments({ status: 'active' });
        const resources = await Resource.countDocuments();

        // Count meetings scheduled for this week
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7));
        const meetingsThisWeek = await Meeting.countDocuments({
            date: { $gte: startOfWeek, $lte: endOfWeek }
        });

        res.json({
            totalStudents: students,
            totalFaculty: faculty,
            totalPrograms: programs,
            totalResources: resources,
            meetingsThisWeek: meetingsThisWeek,
            pendingAlerts: 0, // Placeholder
            recentActivity: [] // Placeholder
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== FACULTY MANAGEMENT ====================

// Create faculty with auto-generated credentials
const createFaculty = async (req, res) => {
    try {
        const { name, email, department, dateOfBirth, phone, designation, qualification } = req.body;

        // Validate required fields
        if (!name || !email || !department || !dateOfBirth) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if faculty already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Generate credentials
        const facultyId = generateFacultyId(name, dateOfBirth);
        const password = generateFacultyPassword(name, dateOfBirth);

        // Create user account
        const user = new User({
            user_id: facultyId,
            name,
            email,
            password, // Will be hashed by pre-save hook
            role: 'faculty',
            department,
            designation,
            phone
        });
        await user.save();

        // Create faculty profile
        const faculty = new Faculty({
            faculty_id: facultyId,
            user_id: facultyId,
            department,
            designation,
            qualification,
            phone,
            date_of_birth: new Date(dateOfBirth),
            status: 'offline',
            active_status: 'active'
        });
        await faculty.save();

        // Store credentials for admin viewing
        const credential = new Credential({
            user_id: facultyId,
            role: 'faculty',
            email,
            created_by: 'admin'
        });
        credential.setPassword(password);
        await credential.save();

        res.status(201).json({
            message: 'Faculty created successfully',
            faculty: {
                faculty_id: facultyId,
                name,
                email,
                department,
                designation
            },
            credentials: {
                faculty_id: facultyId,
                password: password, // Send plain password for download
                email
            }
        });
    } catch (error) {
        console.error('Error creating faculty:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all faculty with status
const getAllFaculty = async (req, res) => {
    try {
        const facultyList = await Faculty.find().populate('user_id', 'name email');

        const facultyData = await Promise.all(facultyList.map(async (fac) => {
            const user = await User.findOne({ user_id: fac.user_id });
            return {
                faculty_id: fac.faculty_id,
                user_id: fac.user_id,
                name: user?.name || 'N/A',
                email: user?.email || 'N/A',
                department: fac.department,
                designation: fac.designation,
                status: fac.status, // online, in-class, offline
                active_status: fac.active_status,
                assigned_lectures: fac.assigned_lectures?.length || 0
            };
        }));

        res.json({ faculty: facultyData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get faculty credentials for download
const getFacultyCredentials = async (req, res) => {
    try {
        const facultyList = await Faculty.find({ active_status: 'active' });

        const credentials = await Promise.all(facultyList.map(async (fac) => {
            const user = await User.findOne({ user_id: fac.user_id });
            const credential = await Credential.findOne({ user_id: fac.user_id });
            
            return {
                faculty_id: fac.faculty_id,
                name: user?.name || 'N/A',
                email: user?.email || 'N/A',
                department: fac.department,
                designation: fac.designation,
                password: credential ? credential.getPassword() : 'Not Available',
                status: fac.active_status
            };
        }));

        res.json({ credentials });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update faculty status (online/in-class/offline)
const updateFacultyStatus = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const { status } = req.body;

        if (!['online', 'in-class', 'offline'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const faculty = await Faculty.findOneAndUpdate(
            { faculty_id: facultyId },
            { status },
            { new: true }
        );

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        res.json({ message: 'Status updated successfully', status: faculty.status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete faculty
const deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete faculty profile
        const faculty = await Faculty.findOneAndDelete({ faculty_id: id });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Delete user account
        await User.findOneAndDelete({ user_id: id });

        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== STUDENT MANAGEMENT ====================

// Create single student with auto-generated credentials
const createStudent = async (req, res) => {
    try {
        const { name, email, program, semester, dateOfBirth, phone, batch } = req.body;

        // Validate required fields
        if (!name || !email || !program || !semester) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if student already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Generate credentials
        const studentId = generateStudentId(name, program, semester, dateOfBirth);
        const password = generateStudentPassword(name, program, semester);

        // Get sequence number for roll number
        const existingStudents = await Student.countDocuments({ program, semester });
        const rollNumber = generateRollNumber(program, semester, existingStudents + 1);

        // Create user account
        const user = new User({
            user_id: studentId,
            name,
            email,
            password, // Will be hashed by pre-save hook
            role: 'student',
            program,
            semester
        });
        await user.save();

        // Create student profile
        const student = new Student({
            student_id: studentId,
            user_id: studentId,
            roll_number: rollNumber,
            program,
            semester,
            batch,
            phone,
            date_of_birth: dateOfBirth ? new Date(dateOfBirth) : null,
            status: 'active'
        });
        await student.save();

        // Store credentials for admin viewing
        const credential = new Credential({
            user_id: studentId,
            role: 'student',
            email,
            created_by: 'admin'
        });
        credential.setPassword(password);
        await credential.save();

        res.status(201).json({
            message: 'Student created successfully',
            student: {
                student_id: studentId,
                roll_number: rollNumber,
                name,
                email,
                program,
                semester
            },
            credentials: {
                student_id: studentId,
                roll_number: rollNumber,
                password: password, // Send plain password for download
                email
            }
        });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all students
const getAllStudents = async (req, res) => {
    try {
        const { program, semester } = req.query;

        let query = {};
        if (program) query.program = program;
        if (semester) query.semester = semester;

        const students = await Student.find(query);

        const studentData = await Promise.all(students.map(async (stu) => {
            const user = await User.findOne({ user_id: stu.user_id });
            return {
                student_id: stu.student_id,
                roll_number: stu.roll_number,
                name: user?.name || 'N/A',
                email: user?.email || 'N/A',
                program: stu.program,
                semester: stu.semester,
                batch: stu.batch,
                status: stu.status
            };
        }));

        res.json({ students: studentData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update student
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, program, semester, phone, batch } = req.body;

        // Update user account
        const user = await User.findOneAndUpdate(
            { user_id: id },
            { name, email, program, semester },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Update student profile
        await Student.findOneAndUpdate(
            { student_id: id },
            { program, semester, phone, batch },
            { new: true }
        );

        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete student
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete student profile
        const student = await Student.findOneAndDelete({ student_id: id });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Delete user account
        await User.findOneAndDelete({ user_id: id });

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
            const credential = await Credential.findOne({ user_id: stu.user_id });
            
            return {
                student_id: stu.student_id,
                roll_number: stu.roll_number,
                name: user?.name || 'N/A',
                email: user?.email || 'N/A',
                program: stu.program,
                semester: stu.semester,
                password: credential ? credential.getPassword() : 'Not Available'
            };
        }));

        res.json({ credentials });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== PROGRAM MANAGEMENT ====================

// Create program
const createProgram = async (req, res) => {
    try {
        const { name, code, duration, semesters, description } = req.body;

        // Validate required fields
        if (!name || !code || !duration || !semesters) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if program already exists
        const existingProgram = await Program.findOne({ $or: [{ name }, { code }] });
        if (existingProgram) {
            return res.status(400).json({ message: 'Program already exists with this name or code' });
        }

        // Generate program ID
        const programId = generateProgramId(code);

        // Create program
        const program = new Program({
            program_id: programId,
            name,
            code: code.toUpperCase(),
            duration,
            semesters,
            description,
            status: 'active'
        });
        await program.save();

        res.status(201).json({
            message: 'Program created successfully',
            program: {
                program_id: programId,
                name,
                code: code.toUpperCase(),
                duration,
                semesters
            }
        });
    } catch (error) {
        console.error('Error creating program:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all programs
const getAllPrograms = async (req, res) => {
    try {
        const programs = await Program.find({ status: 'active' });
        res.json({ programs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update program
const updateProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, duration, semesters, description, status } = req.body;

        const program = await Program.findOneAndUpdate(
            { program_id: id },
            { name, code, duration, semesters, description, status },
            { new: true }
        );

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        res.json({ message: 'Program updated successfully', program });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete program
const deleteProgram = async (req, res) => {
    try {
        const { id } = req.params;

        const program = await Program.findOneAndDelete({ program_id: id });

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        res.json({ message: 'Program deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDashboardStats,
    // Faculty management
    createFaculty,
    getAllFaculty,
    getFacultyCredentials,
    updateFacultyStatus,
    deleteFaculty,
    // Student management
    createStudent,
    getAllStudents,
    updateStudent,
    deleteStudent,
    getStudentCredentials,
    // Program management
    createProgram,
    getAllPrograms,
    updateProgram,
    deleteProgram
};
