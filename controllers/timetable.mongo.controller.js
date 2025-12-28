const mongoose = require('mongoose');
const Timetable = require('../models/Timetable.mongo');

// Create or Update Timetable
const saveTimetable = async (req, res) => {
  try {
    const { program, semester, section, academic_year, slots } = req.body;

    const timetable_id = `TT-${program}-${semester}-${section}-${academic_year}`;

    let timetable = await Timetable.findOne({ timetable_id });

    if (timetable) {
      // Update existing
      timetable.slots = slots;
      timetable.updated_at = Date.now();
    } else {
      // Create new
      timetable = new Timetable({
        timetable_id,
        program,
        semester,
        section,
        academic_year,
        slots,
        created_by: req.user.user_id,
        status: 'draft'
      });
    }

    await timetable.save();

    res.json({
      message: 'Timetable saved successfully',
      timetable
    });
  } catch (error) {
    console.error('Error saving timetable:', error);
    res.status(500).json({ message: 'Failed to save timetable', error: error.message });
  }
};

// Get Timetable
const getTimetable = async (req, res) => {
  try {
    const { program, semester, section, academic_year } = req.query;

    const query = {};
    if (program) query.program = program;
    if (semester) query.semester = parseInt(semester);
    if (section) query.section = section;
    if (academic_year) query.academic_year = academic_year;

    const timetables = await Timetable.find(query).sort({ created_at: -1 });

    res.json({ timetables });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Failed to fetch timetable' });
  }
};

// Publish Timetable
const publishTimetable = async (req, res) => {
  try {
    const { timetable_id } = req.params;
    console.log('Publish request for timetable ID:', timetable_id);
    console.log('User attempting publish:', req.user.user_id, req.user.role);

    // Check if it's a valid ObjectId, otherwise try finding by custom timetable_id
    const isObjectId = mongoose.Types.ObjectId.isValid(timetable_id);
    const query = isObjectId ? { _id: timetable_id } : { timetable_id };
    console.log('Query being used:', query);

    const timetable = await Timetable.findOne(query);

    if (!timetable) {
      console.log('Timetable not found for ID:', timetable_id);
      return res.status(404).json({ message: 'Timetable not found' });
    }

    timetable.status = 'published';
    await timetable.save();
    console.log('Timetable published successfully');

    res.json({
      message: 'Timetable published successfully',
      timetable
    });
  } catch (error) {
    console.error('Error publishing timetable:', error);
    res.status(500).json({ message: 'Failed to publish timetable' });
  }
};

// Delete Timetable
const deleteTimetable = async (req, res) => {
  try {
    const { timetable_id } = req.params;

    const isObjectId = mongoose.Types.ObjectId.isValid(timetable_id);
    const query = isObjectId ? { _id: timetable_id } : { timetable_id };

    await Timetable.deleteOne(query);

    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ message: 'Failed to delete timetable' });
  }
};

module.exports = {
  saveTimetable,
  getTimetable,
  publishTimetable,
  deleteTimetable
};
