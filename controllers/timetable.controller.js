const pool = require('../config/db');

// Create timetable entry (Admin/Faculty)
const createTimetableEntry = async (req, res) => {
  try {
    const { day, startTime, endTime, subjectId, facultyId, program, semester, room } = req.body;
    
    const query = `
      INSERT INTO timetable (day, start_time, end_time, subject_id, faculty_id, program, semester, room) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      day,
      startTime,
      endTime,
      subjectId,
      facultyId,
      program,
      semester,
      room
    ]);
    
    res.status(201).json({
      message: 'Timetable entry created successfully',
      timetableEntry: {
        id: result.insertId,
        day,
        startTime,
        endTime,
        subjectId,
        facultyId,
        program,
        semester,
        room
      }
    });
  } catch (error) {
    console.error('Error creating timetable entry:', error);
    res.status(500).json({ message: 'Failed to create timetable entry' });
  }
};

// Get timetable for a program and semester
const getTimetable = async (req, res) => {
  try {
    const { program, semester } = req.params;
    
    const query = `
      SELECT t.*, s.name as subject_name, u.name as faculty_name
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      JOIN users u ON t.faculty_id = u.user_id
      WHERE t.program = ? AND t.semester = ?
      ORDER BY FIELD(t.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), t.start_time
    `;
    
    const [rows] = await pool.execute(query, [program, semester]);
    
    res.json({ timetable: rows });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Failed to fetch timetable' });
  }
};

// Get faculty timetable
const getFacultyTimetable = async (req, res) => {
  try {
    const facultyId = req.user.user_id;
    
    const query = `
      SELECT t.*, s.name as subject_name, p.name as program_name
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      JOIN programs p ON t.program = p.name
      WHERE t.faculty_id = ?
      ORDER BY FIELD(t.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), t.start_time
    `;
    
    const [rows] = await pool.execute(query, [facultyId]);
    
    res.json({ timetable: rows });
  } catch (error) {
    console.error('Error fetching faculty timetable:', error);
    res.status(500).json({ message: 'Failed to fetch faculty timetable' });
  }
};

// Update timetable entry
const updateTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, startTime, endTime, subjectId, facultyId, program, semester, room } = req.body;
    
    const query = `
      UPDATE timetable 
      SET day = ?, start_time = ?, end_time = ?, subject_id = ?, faculty_id = ?, program = ?, semester = ?, room = ?
      WHERE id = ?
    `;
    
    await pool.execute(query, [
      day,
      startTime,
      endTime,
      subjectId,
      facultyId,
      program,
      semester,
      room,
      id
    ]);
    
    res.json({ message: 'Timetable entry updated successfully' });
  } catch (error) {
    console.error('Error updating timetable entry:', error);
    res.status(500).json({ message: 'Failed to update timetable entry' });
  }
};

// Delete timetable entry
const deleteTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM timetable WHERE id = ?';
    await pool.execute(query, [id]);
    
    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable entry:', error);
    res.status(500).json({ message: 'Failed to delete timetable entry' });
  }
};

module.exports = {
  createTimetableEntry,
  getTimetable,
  getFacultyTimetable,
  updateTimetableEntry,
  deleteTimetableEntry
};