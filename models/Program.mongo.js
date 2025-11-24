const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
    program_id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    duration: {
        type: Number,
        required: true,
        comment: 'Duration in years'
    },
    semesters: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

const Program = mongoose.model('Program', programSchema);

module.exports = Program;
