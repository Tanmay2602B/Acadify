const Timetable = require('../models/Timetable.mongo');

// Create timetable entry (Admin/Faculty)
const createTimetableEntry = async (req, res) => {
  try {
    const { program, semester, academic_year, entries } = req.body;

    // Check if timetable exists for this program/semester
    let timetable = await Timetable.findOne({ program, semester, academic_year });

    if (timetable) {
      // Update existing timetable
      timetable.entries = entries;
      await timetable.save();
    } else {
      // Create new timetable
      timetable = new Timetable({
        timetable_id: `TT-${Date.now()}`,
        program,
        semester,
        academic_year,
        entries
      });
      await timetable.save();
    }

    res.status(201).json({
      message: 'Timetable saved successfully',
      timetable
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
    // Default to current academic year if not specified (simplified)
    const academic_year = '2024-2025'; 

    const timetable = await Timetable.findOne({ program, semester });

    if (!timetable) {
      return res.json({ timetable: [] });
    }

    res.json({ timetable: timetable.entries });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Failed to fetch timetable' });
  }
};

// Get faculty timetable
const getFacultyTimetable = async (req, res) => {
  try {
    const faculty_id = req.user.user_id;
    
    // Find all timetables where this faculty has entries
    const timetables = await Timetable.find({ "entries.faculty_id": faculty_id });
    
    let facultyEntries = [];
    timetables.forEach(tt => {
      const entries = tt.entries.filter(e => e.faculty_id === faculty_id);
      entries.forEach(e => {
        facultyEntries.push({
          ...e.toObject(),
          program: tt.program,
          semester: tt.semester
        });
      });
    });

    res.json({ timetable: facultyEntries });
  } catch (error) {
    console.error('Error fetching faculty timetable:', error);
    res.status(500).json({ message: 'Failed to fetch faculty timetable' });
  }
};

// Update timetable entry
const updateTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params; // This is likely the timetable ID or entry ID? 
    // For simplicity, let's assume we are updating the whole timetable or a specific entry.
    // However, the route is /:id.
    
    // If we are updating a specific entry, we need the timetable ID and entry ID.
    // Let's assume the body contains the updated entry details.
    
    // This part depends on how the frontend sends the update.
    // For now, let's stick to createTimetableEntry which handles upsert.
    
    res.status(501).json({ message: 'Use create/upsert for now' });
  } catch (error) {
    console.error('Error updating timetable entry:', error);
    res.status(500).json({ message: 'Failed to update timetable entry' });
  }
};

// Delete timetable entry
const deleteTimetableEntry = async (req, res) => {
  try {
     // Placeholder
    res.json({ message: 'Timetable entry deleted successfully (placeholder)' });
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