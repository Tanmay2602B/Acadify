const mongoose = require('mongoose');
const Resource = require('../models/Resource.mongo');
const User = require('../models/User.mongo');

// Submit Assignment (Student)
const submitAssignment = async (req, res) => {
    try {
        console.log('Submit assignment request received');
        console.log('Body:', req.body);
        console.log('File:', req.file);
        console.log('User:', req.user);

        const { resourceId, comments } = req.body;
        const studentId = req.user.user_id || req.user.id;
        const studentName = req.user.name;

        console.log('=== SUBMIT ASSIGNMENT DEBUG ===');
        console.log('Resource ID from request:', resourceId);
        console.log('Student ID:', studentId);
        console.log('Student Name:', studentName);
        console.log('File:', req.file ? req.file.filename : 'NO FILE');

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (!resourceId) {
            return res.status(400).json({ message: 'Resource ID is required' });
        }

        // Find the resource (assignment)
        console.log('Searching for resource with ID:', resourceId);
        const resource = await Resource.findById(resourceId);
        console.log('Resource found?', !!resource);

        if (!resource) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (resource.type !== 'assignment') {
            return res.status(400).json({ message: 'This resource is not an assignment' });
        }

        // Check if already submitted
        if (!resource.submissions) {
            resource.submissions = [];
            console.log('Initialized submissions array');
        }

        console.log('Current submissions count:', resource.submissions.length);

        const existingSubmission = resource.submissions.find(
            s => s.student_id === studentId
        );

        const fileUrl = `/uploads/assignments/${req.file.filename}`;

        if (existingSubmission) {
            console.log('Updating existing submission for student:', studentId);
            // Update existing submission
            existingSubmission.file_url = fileUrl;
            existingSubmission.submitted_at = new Date();
            existingSubmission.comments = comments;
            existingSubmission.status = 'submitted';
        } else {
            console.log('Adding new submission for student:', studentId);
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

        console.log('📝 Submissions before save:', resource.submissions.length);
        console.log('📄 Full submissions array:', JSON.stringify(resource.submissions, null, 2));
        
        // Mark submissions as modified to ensure it saves
        resource.markModified('submissions');
        
        console.log('💾 Saving resource...');
        const saveResult = await resource.save();
        console.log('✅ Save result:', saveResult ? 'SUCCESS' : 'FAILED');
        
        // Verify it was saved by fetching again
        console.log('🔍 Verifying save by fetching resource again...');
        const savedResource = await Resource.findById(resourceId).lean();
        console.log('📊 Submissions after save (verified):', savedResource.submissions?.length || 0);
        console.log('📄 Verified submissions:', JSON.stringify(savedResource.submissions, null, 2));
        
        if (savedResource.submissions && savedResource.submissions.length > 0) {
            console.log('✅ SUBMISSION SAVED SUCCESSFULLY');
            console.log('👤 Latest submission:', savedResource.submissions[savedResource.submissions.length - 1]);
        } else {
            console.log('❌ WARNING: Submissions array is empty after save!');
        }

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
