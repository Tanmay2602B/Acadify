const { createMeetingRoom } = require('../utils/jitsiMeet');
const pool = require('../config/db');

// Schedule a meeting
const scheduleMeeting = async (req, res) => {
  try {
    const { subject, date, startTime, endTime, program, semester } = req.body;
    const facultyId = req.user.user_id;
    
    // Generate room name based on subject and timestamp
    const roomName = `${subject.replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Get faculty name
    const [faculty] = await pool.execute('SELECT name FROM users WHERE user_id = ?', [facultyId]);
    const facultyName = faculty[0]?.name || 'Faculty';
    
    // Create meeting room
    const meeting = createMeetingRoom(roomName, facultyName);
    
    // Save meeting to database
    const query = `
      INSERT INTO meetings (subject, date, start_time, end_time, program, semester, faculty_id, room_name, meeting_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      subject,
      date,
      startTime,
      endTime,
      program,
      semester,
      facultyId,
      meeting.roomName,
      meeting.meetingUrl
    ]);
    
    res.status(201).json({
      message: 'Meeting scheduled successfully',
      meeting: {
        id: result.insertId,
        subject,
        date,
        startTime,
        endTime,
        program,
        semester,
        roomName: meeting.roomName,
        meetingUrl: meeting.meetingUrl
      }
    });
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ message: 'Failed to schedule meeting' });
  }
};

// Get faculty meetings
const getFacultyMeetings = async (req, res) => {
  try {
    const facultyId = req.user.user_id;
    
    const query = 'SELECT * FROM meetings WHERE faculty_id = ? ORDER BY date, start_time';
    const [rows] = await pool.execute(query, [facultyId]);
    
    res.json({ meetings: rows });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
};

// Get student meetings
const getStudentMeetings = async (req, res) => {
  try {
    // Get student's program and semester
    const [studentInfo] = await pool.execute(
      'SELECT program, semester FROM users WHERE user_id = ?', 
      [req.user.user_id]
    );
    
    if (studentInfo.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const { program, semester } = studentInfo[0];
    
    const query = 'SELECT * FROM meetings WHERE program = ? AND semester = ? ORDER BY date, start_time';
    const [rows] = await pool.execute(query, [program, semester]);
    
    res.json({ meetings: rows });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
};

// Join meeting
const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.user_id;
    
    // Get meeting details
    const [meetings] = await pool.execute('SELECT * FROM meetings WHERE id = ?', [meetingId]);
    
    if (meetings.length === 0) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    const meeting = meetings[0];
    
    // Check if user is authorized to join (faculty or student in the same program/semester)
    if (req.user.role === 'faculty' && req.user.user_id !== meeting.faculty_id) {
      return res.status(403).json({ message: 'Not authorized to join this meeting' });
    }
    
    if (req.user.role === 'student') {
      // Get student's program and semester
      const [studentInfo] = await pool.execute(
        'SELECT program, semester FROM users WHERE user_id = ?', 
        [userId]
      );
      
      if (studentInfo.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      const { program, semester } = studentInfo[0];
      
      if (program !== meeting.program || semester !== meeting.semester) {
        return res.status(403).json({ message: 'Not authorized to join this meeting' });
      }
    }
    
    res.json({
      meetingUrl: meeting.meeting_url
    });
  } catch (error) {
    console.error('Error joining meeting:', error);
    res.status(500).json({ message: 'Failed to join meeting' });
  }
};

module.exports = {
  scheduleMeeting,
  getFacultyMeetings,
  getStudentMeetings,
  joinMeeting
};