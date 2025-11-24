const ReportCard = require('../models/ReportCard.mongo');
const { ExamSubmission } = require('../models/Exam.mongo');
const Attendance = require('../models/Attendance.mongo');
const User = require('../models/User.mongo');

// Auto-generate report card
const generateReportCard = async (req, res) => {
  try {
    const { student_id, program, semester, academic_year, subjects } = req.body;
    
    // Validate input
    if (!student_id || !program || !semester || !academic_year || !subjects) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Calculate grades for each subject
    const subjectGrades = [];
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    for (const subject of subjects) {
      const internal = subject.internal_marks || 0;
      const external = subject.external_marks || 0;
      const total = internal + external;
      const maxMarks = subject.max_marks || 100;
      const credits = subject.credits || 4;
      
      // Calculate grade
      const percentage = (total / maxMarks) * 100;
      let grade = 'F';
      let gradePoint = 0;
      
      if (percentage >= 90) { grade = 'A+'; gradePoint = 10; }
      else if (percentage >= 80) { grade = 'A'; gradePoint = 9; }
      else if (percentage >= 70) { grade = 'B+'; gradePoint = 8; }
      else if (percentage >= 60) { grade = 'B'; gradePoint = 7; }
      else if (percentage >= 50) { grade = 'C+'; gradePoint = 6; }
      else if (percentage >= 40) { grade = 'C'; gradePoint = 5; }
      else if (percentage >= 35) { grade = 'D'; gradePoint = 4; }
      
      subjectGrades.push({
        subject: subject.name,
        internal_marks: internal,
        external_marks: external,
        total_marks: total,
        max_marks: maxMarks,
        grade,
        credits
      });
      
      totalMarksObtained += total;
      totalMaxMarks += maxMarks;
      totalCredits += credits;
      totalGradePoints += gradePoint * credits;
    }
    
    // Calculate overall percentage and CGPA
    const percentage = (totalMarksObtained / totalMaxMarks) * 100;
    const sgpa = totalGradePoints / totalCredits;
    
    // Get attendance percentage
    const attendanceRecords = await Attendance.find({
      program,
      semester,
      'records.student_id': student_id
    });
    
    let totalClasses = 0;
    let attendedClasses = 0;
    
    attendanceRecords.forEach(record => {
      const studentRecord = record.records.find(r => r.student_id === student_id);
      if (studentRecord) {
        totalClasses++;
        if (studentRecord.status === 'present' || studentRecord.status === 'late') {
          attendedClasses++;
        }
      }
    });
    
    const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
    
    // Generate remarks
    let remarks = '';
    if (percentage >= 75 && attendancePercentage >= 75) {
      remarks = 'Excellent performance. Keep up the good work!';
    } else if (percentage >= 60 && attendancePercentage >= 75) {
      remarks = 'Good performance. Can improve further.';
    } else if (percentage >= 40) {
      remarks = 'Satisfactory performance. Needs improvement.';
    } else {
      remarks = 'Poor performance. Immediate attention required.';
    }
    
    if (attendancePercentage < 75) {
      remarks += ' Low attendance is a concern.';
    }
    
    // Check if report card already exists
    const existingReport = await ReportCard.findOne({
      student_id,
      program,
      semester,
      academic_year
    });
    
    if (existingReport) {
      // Update existing report
      existingReport.subjects = subjectGrades;
      existingReport.total_marks_obtained = totalMarksObtained;
      existingReport.total_max_marks = totalMaxMarks;
      existingReport.percentage = percentage;
      existingReport.sgpa = sgpa;
      existingReport.attendance_percentage = attendancePercentage;
      existingReport.remarks = remarks;
      existingReport.generated_at = new Date();
      
      await existingReport.save();
      
      return res.json({
        message: 'Report card updated successfully',
        reportCard: existingReport
      });
    }
    
    // Create new report card
    const reportCard = new ReportCard({
      report_id: `RPT-${student_id}-${semester}-${Date.now()}`,
      student_id,
      program,
      semester,
      academic_year,
      subjects: subjectGrades,
      total_marks_obtained: totalMarksObtained,
      total_max_marks: totalMaxMarks,
      percentage,
      sgpa,
      cgpa: sgpa, // For now, CGPA = SGPA (would need all semesters for actual CGPA)
      attendance_percentage: attendancePercentage,
      remarks,
      status: 'draft'
    });
    
    await reportCard.save();
    
    res.status(201).json({
      message: 'Report card generated successfully',
      reportCard
    });
  } catch (error) {
    console.error('Error generating report card:', error);
    res.status(500).json({ message: 'Failed to generate report card', error: error.message });
  }
};

// Bulk generate report cards for a class
const bulkGenerateReportCards = async (req, res) => {
  try {
    const { program, semester, academic_year, students_data } = req.body;
    
    if (!program || !semester || !academic_year || !Array.isArray(students_data)) {
      return res.status(400).json({ message: 'Invalid input data' });
    }
    
    const results = [];
    const errors = [];
    
    for (const studentData of students_data) {
      try {
        const reportCardData = {
          student_id: studentData.student_id,
          program,
          semester,
          academic_year,
          subjects: studentData.subjects
        };
        
        // Call generate function for each student
        const response = await generateReportCard({ body: reportCardData }, { 
          status: () => ({ json: (data) => data }),
          json: (data) => data 
        });
        
        results.push({
          student_id: studentData.student_id,
          success: true
        });
      } catch (error) {
        errors.push({
          student_id: studentData.student_id,
          error: error.message
        });
      }
    }
    
    res.json({
      message: 'Bulk report card generation completed',
      successful: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('Error in bulk generation:', error);
    res.status(500).json({ message: 'Failed to generate report cards', error: error.message });
  }
};

// Get student report card
const getStudentReportCard = async (req, res) => {
  try {
    const { student_id, semester, academic_year } = req.query;
    
    const query = { student_id };
    if (semester) query.semester = semester;
    if (academic_year) query.academic_year = academic_year;
    
    const reportCards = await ReportCard.find(query).sort({ createdAt: -1 });
    
    if (!reportCards || reportCards.length === 0) {
      return res.status(404).json({ message: 'No report cards found' });
    }
    
    res.json({ reportCards });
  } catch (error) {
    console.error('Error fetching report card:', error);
    res.status(500).json({ message: 'Failed to fetch report card' });
  }
};

// Publish report card
const publishReportCard = async (req, res) => {
  try {
    const { report_id } = req.params;
    
    const reportCard = await ReportCard.findOne({ report_id });
    
    if (!reportCard) {
      return res.status(404).json({ message: 'Report card not found' });
    }
    
    reportCard.status = 'published';
    await reportCard.save();
    
    res.json({ message: 'Report card published successfully', reportCard });
  } catch (error) {
    console.error('Error publishing report card:', error);
    res.status(500).json({ message: 'Failed to publish report card' });
  }
};

// Get all report cards (Admin/Faculty)
const getAllReportCards = async (req, res) => {
  try {
    const { program, semester, academic_year, status } = req.query;
    
    const query = {};
    if (program) query.program = program;
    if (semester) query.semester = semester;
    if (academic_year) query.academic_year = academic_year;
    if (status) query.status = status;
    
    const reportCards = await ReportCard.find(query).sort({ createdAt: -1 });
    
    res.json({ reportCards });
  } catch (error) {
    console.error('Error fetching report cards:', error);
    res.status(500).json({ message: 'Failed to fetch report cards' });
  }
};

module.exports = {
  generateReportCard,
  bulkGenerateReportCards,
  getStudentReportCard,
  publishReportCard,
  getAllReportCards
};
