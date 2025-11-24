// Mock database for assignments and submissions
let assignmentsDB = [];
let submissionsDB = [];

// Upload Assignment (Faculty)
const uploadAssignment = async (req, res) => {
    try {
        const { title, subject, program, semester, dueDate, description } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const newAssignment = {
            id: Date.now().toString(),
            title,
            subject,
            program,
            semester,
            dueDate,
            description,
            filePath: `/uploads/assignments/${file.filename}`,
            fileName: file.originalname,
            uploadedAt: new Date(),
            status: 'Active'
        };

        assignmentsDB.push(newAssignment);

        res.status(201).json({
            message: 'Assignment uploaded successfully',
            assignment: newAssignment
        });
    } catch (error) {
        console.error('Error uploading assignment:', error);
        res.status(500).json({ message: 'Failed to upload assignment' });
    }
};

// Submit Assignment (Student)
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.body;
        const file = req.file;
        const studentId = req.user.user_id;
        const studentName = req.user.name;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const newSubmission = {
            id: Date.now().toString(),
            assignmentId,
            studentId,
            studentName,
            filePath: `/uploads/assignments/${file.filename}`, // Storing in same folder for simplicity
            fileName: file.originalname,
            submittedAt: new Date(),
            status: 'Submitted'
        };

        submissionsDB.push(newSubmission);

        res.status(201).json({
            message: 'Assignment submitted successfully',
            submission: newSubmission
        });
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ message: 'Failed to submit assignment' });
    }
};

// Get Assignments (Faculty)
const getFacultyAssignments = async (req, res) => {
    try {
        res.json({ assignments: assignmentsDB });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Failed to fetch assignments' });
    }
};

// Get Assignments (Student)
const getStudentAssignments = async (req, res) => {
    try {
        // Enrich assignments with submission status
        const studentId = req.user.user_id;
        const enrichedAssignments = assignmentsDB.map(assignment => {
            const submission = submissionsDB.find(s => s.assignmentId === assignment.id && s.studentId === studentId);
            return {
                ...assignment,
                status: submission ? 'Submitted' : 'Pending',
                submissionDate: submission ? submission.submittedAt : null
            };
        });
        res.json({ assignments: enrichedAssignments });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Failed to fetch assignments' });
    }
};

// Get Submissions for an Assignment (Faculty)
const getAssignmentSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const submissions = submissionsDB.filter(s => s.assignmentId === assignmentId);
        res.json({ submissions });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Failed to fetch submissions' });
    }
};

module.exports = {
    uploadAssignment,
    submitAssignment,
    getFacultyAssignments,
    getStudentAssignments,
    getAssignmentSubmissions
};
