const mongoose = require('mongoose');
const Resource = require('../models/Resource.mongo');
const User = require('../models/User.mongo');

const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Submit Assignment (Student)
const submitAssignment = async (req, res) => {
    try {
        console.log('Submit assignment request received');

        const { resourceId, comments } = req.body;
        const studentId = req.user.user_id || req.user.id;
        const studentName = req.user.name;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (!resourceId) {
            return res.status(400).json({ message: 'Resource ID is required' });
        }

        // Find the resource (assignment)
        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (resource.type !== 'assignment') {
            return res.status(400).json({ message: 'This resource is not an assignment' });
        }

        // Upload to Cloudinary
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'assignments',
                        resource_type: 'auto',
                        public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary Upload Error:', error);
                            return reject(error);
                        }
                        resolve(result);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            });
        };

        console.log('Uploading to Cloudinary...');
        const result = await uploadToCloudinary();
        const fileUrl = result.secure_url;
        console.log('Cloudinary upload successful:', fileUrl);

        // Check if already submitted
        if (!resource.submissions) {
            resource.submissions = [];
        }

        const existingSubmission = resource.submissions.find(
            s => s.student_id === studentId
        );

        if (existingSubmission) {
            // Update existing submission
            existingSubmission.file_url = fileUrl;
            existingSubmission.submitted_at = new Date();
            existingSubmission.comments = comments;
            existingSubmission.status = 'submitted';
        } else {
            // Add new submission
            resource.submissions.push({
                student_id: studentId,
                student_name: studentName,
                file_url: fileUrl,
                submitted_at: new Date(),
                comments: comments,
                status: 'submitted'
            });
        }

        // Mark submissions as modified to ensure it saves
        resource.markModified('submissions');
        await resource.save();

        res.status(201).json({
            message: 'Assignment submitted successfully',
            submission: existingSubmission || resource.submissions[resource.submissions.length - 1]
        });
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ message: 'Failed to submit assignment', error: error.message });
    }
};

// Get Submissions for an Assignment (Faculty)
const getAssignmentSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        console.log('=== GET SUBMISSIONS DEBUG ===');
        console.log('Fetching submissions for resource:', assignmentId);

        const resource = await Resource.findById(assignmentId).lean();

        if (!resource) {
            console.log('❌ Assignment not found:', assignmentId);
            return res.status(404).json({ message: 'Assignment not found' });
        }

        console.log('✅ Resource found:', resource.title);
        console.log('📋 Raw submissions from DB:', JSON.stringify(resource.submissions, null, 2));
        console.log('📊 Submission count:', resource.submissions?.length || 0);

        if (resource.submissions && resource.submissions.length > 0) {
            console.log('👥 Students who submitted:');
            resource.submissions.forEach((sub, idx) => {
                console.log(`  ${idx + 1}. ${sub.student_name} (${sub.student_id}) - ${sub.status}`);
            });
        } else {
            console.log('⚠️ NO SUBMISSIONS FOUND IN DATABASE');
        }

        res.json({ submissions: resource.submissions || [] });
    } catch (error) {
        console.error('❌ Error fetching submissions:', error);
        res.status(500).json({ message: 'Failed to fetch submissions' });
    }
};

// Grade Submission (Faculty)
const gradeSubmission = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { studentId, marks, feedback } = req.body;

        if (marks === undefined || marks === null) {
            return res.status(400).json({ message: 'Marks are required' });
        }

        const resource = await Resource.findById(assignmentId);

        if (!resource) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (!resource.submissions) {
            return res.status(404).json({ message: 'No submissions found' });
        }

        const submission = resource.submissions.find(
            s => s.student_id === studentId
        );

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found for this student' });
        }

        // Update submission with grade
        submission.marks = marks;
        submission.feedback = feedback;
        submission.status = 'graded';

        await resource.save();

        res.json({
            message: 'Grade submitted successfully',
            submission
        });
    } catch (error) {
        console.error('Error grading submission:', error);
        res.status(500).json({ message: 'Failed to grade submission', error: error.message });
    }
};

// Legacy functions (kept for compatibility)
const uploadAssignment = async (req, res) => {
    res.status(501).json({ message: 'Use /api/resources/upload instead' });
};

const getFacultyAssignments = async (req, res) => {
    res.status(501).json({ message: 'Use /api/resources/faculty instead' });
};

const getStudentAssignments = async (req, res) => {
    res.status(501).json({ message: 'Use /api/resources/student instead' });
};

module.exports = {
    uploadAssignment,
    submitAssignment,
    getFacultyAssignments,
    getStudentAssignments,
    getAssignmentSubmissions,
    gradeSubmission
};
