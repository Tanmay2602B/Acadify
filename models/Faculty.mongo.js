const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    faculty_id: {
        type: String,
        required: true,
        unique: true
    },
    user_id: {
        type: String,
        required: true,
        ref: 'User'
    },
    employee_id: {
        type: String,
        unique: true
    },
    department: {
        type: String,
        required: false
    },
    designation: {
        type: String
    },
    qualification: {
        type: String
    },
    specialization: {
        type: String
    },
    experience_years: {
        type: Number
    },
    phone: String,
    date_of_birth: Date,
    date_of_joining: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['online', 'in-class', 'offline'],
        default: 'offline'
    },
    assigned_lectures: [{
        timetable_id: String,
        subject: String,
        program: String,
        semester: Number,
        day: String,
        time: String
    }],
    teaching_assignments: [{
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
        }
    }],
    active_status: {
        type: String,
        enum: ['active', 'inactive', 'on-leave'],
        default: 'active'
    }
}, {
    timestamps: true
});

const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;
