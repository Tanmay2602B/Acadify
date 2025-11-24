const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    assignment_id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    faculty_id: {
        type: String,
        required: true,
        ref: 'Faculty'
    },
    program: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    due_date: {
        type: Date,
        required: true
    },
    total_marks: {
        type: Number,
        default: 100
    },
    file_url: {
        type: String
    },
    submissions: [{
        student_id: String,
        student_name: String,
        file_url: String,
        submitted_at: Date,
        marks: Number,
        feedback: String,
        status: {
            type: String,
            enum: ['submitted', 'graded', 'late'],
            default: 'submitted'
        }
    }],
    status: {
        type: String,
        enum: ['active', 'closed', 'draft'],
        default: 'active'
    }
}, {
    timestamps: true
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
