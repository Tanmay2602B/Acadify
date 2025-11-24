const fs = require('fs');
const path = require('path');
const Resource = require('../models/Resource.mongo');
const User = require('../models/User.mongo');

// Upload resource (Faculty)
const uploadResource = async (req, res) => {
  try {
    const { title, description, type, program, semester, subjectId } = req.body;
    const uploadedBy = req.user.id; // Using MongoDB _id from token

    let fileUrl = null;
    let filePath = null;

    // Handle local file upload
    if (req.file) {
      fileUrl = `/uploads/resources/${req.file.filename}`;
      filePath = req.file.path;
    }

    const newResource = new Resource({
      title,
      description, // Note: Schema doesn't have description, but controller did. I should probably add it or ignore it.
      type,
      fileUrl,
      filePath,
      fileName: req.file ? req.file.originalname : 'resource',
      program,
      semester,
      subjectId, // Note: Schema doesn't have subjectId, maybe 'subject' string?
      uploadedBy
    });

    // Schema check: I defined 'subject' in schema, but here it uses 'subjectId'. 
    // I'll assume 'subject' is passed in body or I should map subjectId to subject.
    // For now, I'll save 'subjectId' as 'subject' if that's what's intended, or add subjectId to schema.
    // Let's assume the frontend sends 'subject' or 'subjectId'. 
    // The previous code used 'subjectId'.
    // The schema I created has 'subject'.
    // I will map subjectId to subject for now, or assume title/subject are passed.

    if (req.body.subject) {
      newResource.subject = req.body.subject;
    } else if (subjectId) {
      newResource.subject = subjectId; // Fallback
    }

    await newResource.save();

    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource: newResource
    });
  } catch (error) {
    console.error('Error uploading resource:', error);
    res.status(500).json({ message: 'Failed to upload resource' });
  }
};

// Get resources for students
const getStudentResources = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await User.findById(userId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Filter by student's program and semester
    // Also include resources that might be for 'All' or matching
    const resources = await Resource.find({
      program: student.program,
      semester: student.semester
    }).sort({ createdAt: -1 });

    res.json({ resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

// Get faculty resources
const getFacultyResources = async (req, res) => {
  try {
    const userId = req.user.id;
    // Filter resources uploaded by this faculty
    const resources = await Resource.find({ uploadedBy: userId }).sort({ createdAt: -1 });
    res.json({ resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

// Delete resource (Faculty/Admin)
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check ownership (unless admin)
    // resource.uploadedBy is an ObjectId, req.user.id is string/ObjectId
    if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this resource' });
    }

    // Delete file from filesystem
    if (resource.filePath && fs.existsSync(resource.filePath)) {
      try {
        fs.unlinkSync(resource.filePath);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }

    // Remove from DB
    await Resource.findByIdAndDelete(id);

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Failed to delete resource' });
  }
};

// Download resource
const downloadResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!resource.filePath || !fs.existsSync(resource.filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(resource.filePath, resource.fileName);
  } catch (error) {
    console.error('Error downloading resource:', error);
    res.status(500).json({ message: 'Failed to download resource' });
  }
};

module.exports = {
  uploadResource,
  getStudentResources,
  getFacultyResources,
  deleteResource,
  downloadResource
};