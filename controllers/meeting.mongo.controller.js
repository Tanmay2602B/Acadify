const Meeting = require('../models/Meeting.mongo');
const Attendance = require('../models/Attendance.mongo');
const User = require('../models/User.mongo');
const { notifyNewMeeting } = require('../services/notificationService');

/**
 * Create a new meeting
 */
const createMeeting = async (req, res) => {
  try {
    const { title, description, program, semester, subject, scheduled_time, duration } = req.body;
    
    // Generate unique Jitsi room name
    const roomName = `acadify-${program}-${semester}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-');
    const jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si';
    const roomUrl = `https://${jitsiDomain}/${roomName}`;
    
    const meeting = new Meeting({
      meeting_id: `MTG-${Date.now()}`,
      title,
      description,
      program,
      semester,
      subject,
      faculty_id: req.user.user_id,
      faculty_name: req.user.name,
      scheduled_time: new Date(scheduled_time),
      duration,
      jitsi_room_name: roomName,
      jitsi_room_url: roomUrl,
      status: 'scheduled',
      auto_attendance: true
    });
    
    await meeting.save();
    
    // Get all students in the program/semester
    const students = await User.find({
      role: 'student',
      program,
      semester
    });
    
    // Send notifications
    if (students.length > 0) {
      const studentIds = students.map(s => s.user_id);
      await notifyNewMeeting(meeting, studentIds);
    }
    
    res.status(201).json({
      message: 'Meeting created successfully',
      meeting
    });
    
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Failed to create meeting', error: error.message });
  }
};

/**
 * Get faculty meetings
 */
const getFacultyMeetings = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { faculty_id: req.user.user_id };
    if (status) query.status = status;
    
    const meetings = await Meeting.find(query).sort({ scheduled_time: -1 });
    
    res.json({ meetings });
    
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
};

/**
 * Get student meetings
 */
const getStudentMeetings = async (req, res) => {
  try {
    const student = await User.findOne({ user_id: req.user.user_id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const meetings = await Meeting.find({
      program: student.program,
      semester: student.semester,
      status: { $in: ['scheduled', 'ongoing'] }
    }).sort({ scheduled_time: 1 });
    
    res.json({ meetings });
    
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
};

/**
 * Join meeting (student)
 */
const joinMeeting = async (req, res) => {
  try {
    const { meeting_id } = req.params;
    
    const meeting = await Meeting.findOne({ meeting_id });
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Check if student is already in participants
    const existingParticipant = meeting.participants.find(
      p => p.user_id === req.user.user_id
    );
    
    if (!existingParticipant) {
      // Add student to participants
      meeting.participants.push({
        user_id: req.user.user_id,
        name: req.user.name,
        joined_at: new Date()
      });
      
      // Update meeting status to ongoing if it's scheduled
      if (meeting.status === 'scheduled') {
        meeting.status = 'ongoing';
      }
      
      await meeting.save();
    }
    
    res.json({
      message: 'Joined meeting successfully',
      meeting: {
        meeting_id: meeting.meeting_id,
        title: meeting.title,
        jitsi_room_url: meeting.jitsi_room_url,
        jitsi_room_name: meeting.jitsi_room_name
      }
    });
    
  } catch (error) {
    console.error('Join meeting error:', error);
    res.status(500).json({ message: 'Failed to join meeting' });
  }
};

/**
 * Leave meeting (student)
 */
const leaveMeeting = async (req, res) => {
  try {
    const { meeting_id } = req.params;
    
    const meeting = await Meeting.findOne({ meeting_id });
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Find participant
    const participant = meeting.participants.find(
      p => p.user_id === req.user.user_id
    );
    
    if (participant && !participant.left_at) {
      participant.left_at = new Date();
      
      // Calculate duration in minutes
      const durationMs = participant.left_at - participant.joined_at;
      participant.duration = Math.floor(durationMs / 60000);
      
      // Mark attendance if duration meets minimum requirement
      if (participant.duration >= meeting.minimum_duration && meeting.auto_attendance) {
        participant.attendance_marked = true;
        
        // Create attendance record
        await markAttendance(meeting, req.user.user_id);
      }
      
      await meeting.save();
    }
    
    res.json({
      message: 'Left meeting successfully',
      duration: participant?.duration,
      attendance_marked: participant?.attendance_marked
    });
    
  } catch (error) {
    console.error('Leave meeting error:', error);
    res.status(500).json({ message: 'Failed to leave meeting' });
  }
};

/**
 * Mark attendance for meeting participant
 */
async function markAttendance(meeting, studentId) {
  try {
    // Check if attendance record exists for this date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let attendance = await Attendance.findOne({
      program: meeting.program,
      semester: meeting.semester,
      subject: meeting.subject,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!attendance) {
      // Create new attendance record
      attendance = new Attendance({
        attendance_id: `ATT-${Date.now()}`,
        program: meeting.program,
        semester: meeting.semester,
        subject: meeting.subject,
        faculty_id: meeting.faculty_id,
        date: new Date(),
        records: []
      });
    }
    
    // Check if student already marked
    const existingRecord = attendance.records.find(r => r.student_id === studentId);
    
    if (!existingRecord) {
      attendance.records.push({
        student_id: studentId,
        status: 'present',
        marked_at: new Date()
      });
      
      await attendance.save();
    }
    
  } catch (error) {
    console.error('Mark attendance error:', error);
  }
}

/**
 * Get meeting details
 */
const getMeetingDetails = async (req, res) => {
  try {
    const { meeting_id } = req.params;
    
    const meeting = await Meeting.findOne({ meeting_id });
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    res.json({ meeting });
    
  } catch (error) {
    console.error('Get meeting details error:', error);
    res.status(500).json({ message: 'Failed to fetch meeting details' });
  }
};

/**
 * End meeting (faculty)
 */
const endMeeting = async (req, res) => {
  try {
    const { meeting_id } = req.params;
    
    const meeting = await Meeting.findOne({ meeting_id });
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    if (meeting.faculty_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    meeting.status = 'completed';
    await meeting.save();
    
    res.json({
      message: 'Meeting ended successfully',
      participants: meeting.participants.length,
      attendance_marked: meeting.participants.filter(p => p.attendance_marked).length
    });
    
  } catch (error) {
    console.error('End meeting error:', error);
    res.status(500).json({ message: 'Failed to end meeting' });
  }
};

module.exports = {
  createMeeting,
  getFacultyMeetings,
  getStudentMeetings,
  joinMeeting,
  leaveMeeting,
  getMeetingDetails,
  endMeeting
};
