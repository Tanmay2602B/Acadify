const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Resource = require('../models/Resource.mongo');
const User = require('../models/User.mongo');

// Upload resource (Faculty)
const uploadResource = async (req, res) => {
  try {
    console.log('Upload resource request received');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('User:', req.user);

    const { title, description, type, program, semester, subject, startDate, dueDate, lateSubmission } = req.body;
    
    // Get user ID - try both id and user_id from token
    const uploadedBy = req.user.id || req.user.user_id;
    
    if (!uploadedBy) {
      console.error('No user ID found in token');
      return res.status(401).json({ message: 'User authentication failed' });
    }
    
    console.log('Uploaded by:', uploadedBy);

    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!title || !type || !program || !semester || !subject) {
      console.error('Missing required fields');
      return res.status(400).json({ message: 'Missing required fields: title, type, program, semester, subject' });
    }

    const fileUrl = `/uploads/resources/${req.file.filename}`;
    const filePath = req.file.path;

    console.log('File URL:', fileUrl);
    console.log('File Path:', filePath);

    // Convert uploadedBy to ObjectId if it's a string
    let uploadedByObjectId;
    try {
      uploadedByObjectId = mongoose.Types.ObjectId.isValid(uploadedBy) 
        ? new mongoose.Types.ObjectId(uploadedBy) 
        : uploadedBy;
    } catch (err) {
      console.error('Error converting uploadedBy to ObjectId:', err);
      uploadedByObjectId = uploadedBy;
    }

    const resourceData = {
      title,
      description,
      type,
      fileUrl,
      filePath,
      fileName: req.file.originalname,
      program,
      semester,
      subject,
      uploadedBy: uploadedByObjectId
    };

    // Add assignment-specific fields if type is assignment
    if (type === 'assignment') {
      if (!startDate || !dueDate) {
        console.error('Missing assignment dates');
        return res.status(400).json({ message: 'Start date and due date are required for assignments' });
      }
      
      resourceData.startDate = new Date(startDate);
      resourceData.dueDate = new Date(dueDate);
      resourceData.lateSubmission = lateSubmission || 'no';
      
      console.log('Assignment dates:', { startDate: resourceData.startDate, dueDate: resourceData.dueDate });
    }

    console.log('Creating resource with data:', resourceData);

    const newResource = new Resource(resourceData);
    await newResource.save();

    console.log('Resource saved successfully:', newResource._id);

    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource: newResource
    });
  } catch (error) {
    console.error('Error uploading resource:', error);
    res.status(500).json({ message: 'Failed to upload resource', error: error.message });
  }
};

// Get resources for students
const getStudentResources = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;
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
    const userId = req.user.id || req.user.user_id;
    console.log('Fetching resources for user:', userId);
    
    // Filter resources uploaded by this faculty
    const resources = await Resource.find({ uploadedBy: userId }).sort({ createdAt: -1 });
    console.log('Found resources:', resources.length);
    
    // Log submission counts for assignments
    resources.forEach(r => {
      if (r.type === 'assignment') {
        console.log(`Assignment "${r.title}" has ${r.submissions?.length || 0} submissions`);
      }
    });
    
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
    const userId = req.user.id || req.user.user_id;
    
    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check ownership (unless admin)
    // resource.uploadedBy is an ObjectId, userId is string/ObjectId
    if (resource.uploadedBy.toString() !== userId.toString() && req.user.role !== 'admin') {
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