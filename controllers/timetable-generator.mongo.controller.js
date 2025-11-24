const Timetable = require('../models/Timetable.mongo');

// Auto-generate timetable
const generateTimetable = async (req, res) => {
  try {
    const { program, semester, academic_year, subjects, faculty_assignments, preferences } = req.body;
    
    // Validate input
    if (!program || !semester || !academic_year || !subjects || !Array.isArray(subjects)) {
      return res.status(400).json({ message: 'Invalid input data' });
    }
    
    // Days and time slots
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:15', end: '12:15' },
      { start: '12:15', end: '13:15' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' }
    ];
    
    const entries = [];
    const facultySchedule = {}; // Track faculty availability
    const roomSchedule = {}; // Track room availability
    
    // Initialize tracking
    days.forEach(day => {
      facultySchedule[day] = {};
      roomSchedule[day] = {};
      timeSlots.forEach(slot => {
        facultySchedule[day][slot.start] = new Set();
        roomSchedule[day][slot.start] = new Set();
      });
    });
    
    // Distribute subjects across the week
    let subjectIndex = 0;
    let dayIndex = 0;
    let slotIndex = 0;
    
    // Calculate total periods needed
    const totalPeriodsNeeded = subjects.reduce((sum, sub) => sum + (sub.periods_per_week || 3), 0);
    
    // Generate timetable entries
    for (const subject of subjects) {
      const periodsPerWeek = subject.periods_per_week || 3;
      const faculty = faculty_assignments?.find(f => f.subject === subject.name);
      
      for (let period = 0; period < periodsPerWeek; period++) {
        // Find next available slot
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
          const day = days[dayIndex % days.length];
          const slot = timeSlots[slotIndex % timeSlots.length];
          const slotKey = slot.start;
          
          // Check if faculty is available
          const facultyAvailable = !faculty?.faculty_id || 
            !facultySchedule[day][slotKey].has(faculty.faculty_id);
          
          // Assign room (simple room assignment)
          const room = `Room ${101 + (entries.length % 10)}`;
          const roomAvailable = !roomSchedule[day][slotKey].has(room);
          
          if (facultyAvailable && roomAvailable) {
            // Add entry
            entries.push({
              day,
              start_time: slot.start,
              end_time: slot.end,
              subject: subject.name,
              faculty_id: faculty?.faculty_id || '',
              faculty_name: faculty?.faculty_name || 'TBA',
              room,
              type: subject.type || 'lecture'
            });
            
            // Mark faculty and room as occupied
            if (faculty?.faculty_id) {
              facultySchedule[day][slotKey].add(faculty.faculty_id);
            }
            roomSchedule[day][slotKey].add(room);
            
            placed = true;
          }
          
          // Move to next slot
          slotIndex++;
          if (slotIndex % timeSlots.length === 0) {
            dayIndex++;
          }
          
          attempts++;
        }
        
        if (!placed) {
          console.warn(`Could not place ${subject.name} period ${period + 1}`);
        }
      }
    }
    
    // Add breaks
    days.forEach(day => {
      entries.push({
        day,
        start_time: '11:00',
        end_time: '11:15',
        subject: 'Break',
        room: '-',
        type: 'break'
      });
      entries.push({
        day,
        start_time: '13:15',
        end_time: '14:00',
        subject: 'Lunch Break',
        room: '-',
        type: 'break'
      });
    });
    
    // Sort entries by day and time
    const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    entries.sort((a, b) => {
      if (dayOrder[a.day] !== dayOrder[b.day]) {
        return dayOrder[a.day] - dayOrder[b.day];
      }
      return a.start_time.localeCompare(b.start_time);
    });
    
    // Check if timetable already exists
    const existingTimetable = await Timetable.findOne({
      program,
      semester,
      academic_year,
      is_active: true
    });
    
    if (existingTimetable) {
      // Deactivate old timetable
      existingTimetable.is_active = false;
      await existingTimetable.save();
    }
    
    // Create new timetable
    const timetable = new Timetable({
      timetable_id: `TT-${program}-${semester}-${Date.now()}`,
      program,
      semester,
      academic_year,
      entries,
      is_active: true
    });
    
    await timetable.save();
    
    res.status(201).json({
      message: 'Timetable generated successfully',
      timetable
    });
  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({ message: 'Failed to generate timetable', error: error.message });
  }
};

// Get timetable
const getTimetable = async (req, res) => {
  try {
    const { program, semester } = req.query;
    
    const query = { is_active: true };
    if (program) query.program = program;
    if (semester) query.semester = semester;
    
    const timetable = await Timetable.findOne(query).sort({ createdAt: -1 });
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    res.json({ timetable });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Failed to fetch timetable' });
  }
};

// Update timetable entry
const updateTimetableEntry = async (req, res) => {
  try {
    const { timetable_id, entry_id } = req.params;
    const updates = req.body;
    
    const timetable = await Timetable.findOne({ timetable_id });
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    const entry = timetable.entries.id(entry_id);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    
    Object.assign(entry, updates);
    await timetable.save();
    
    res.json({ message: 'Timetable entry updated successfully', timetable });
  } catch (error) {
    console.error('Error updating timetable:', error);
    res.status(500).json({ message: 'Failed to update timetable' });
  }
};

module.exports = {
  generateTimetable,
  getTimetable,
  updateTimetableEntry
};
