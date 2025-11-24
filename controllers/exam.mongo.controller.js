const { Exam, ExamSubmission } = require('../models/Exam.mongo');
const { v4: uuidv4 } = require('crypto');

// Create exam (Faculty)
const createExam = async (req, res) => {
  try {
    const { title, description, program, semester, subject, duration, total_marks, start_time, end_time, anti_cheat_enabled, randomize_questions, questions } = req.body;

    const exam = new Exam({
      exam_id: `EXM-${Date.now()}`,
      title,
      description,
      program,
      semester,
      subject,
      faculty_id: req.user.user_id,
      duration,
      total_marks,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      anti_cheat_enabled: anti_cheat_enabled !== false,
      randomize_questions: randomize_questions !== false,
      questions: questions || [],
      status: 'draft'
    });

    await exam.save();

    res.status(201).json({
      message: 'Exam created successfully',
      exam
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ message: 'Failed to create exam', error: error.message });
  }
};

// Add question to exam (Faculty) - Legacy support, but updated for new schema if needed
const addQuestion = async (req, res) => {
  try {
    const { exam_id } = req.params;
    const { question_text, type, options, correct_answer, marks, image } = req.body;

    const exam = await Exam.findOne({ exam_id });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.faculty_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    exam.questions.push({
      question_text,
      type: type || 'radio',
      options: options || [],
      correct_answer,
      marks: marks || 1,
      image
    });

    await exam.save();

    res.status(201).json({
      message: 'Question added successfully',
      exam
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ message: 'Failed to add question', error: error.message });
  }
};

// Upload question image
const uploadQuestionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return the path relative to public
    const filePath = `/uploads/quiz-images/${req.file.filename}`;
    res.json({ filePath });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
};

// Get faculty exams
const getFacultyExams = async (req, res) => {
  try {
    const exams = await Exam.find({ faculty_id: req.user.user_id }).sort({ createdAt: -1 });
    res.json({ exams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Failed to fetch exams' });
  }
};

// Get student exams
const getStudentExams = async (req, res) => {
  try {
    const User = require('../models/User.mongo');
    const student = await User.findOne({ user_id: req.user.user_id });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const exams = await Exam.find({
      program: student.program,
      semester: student.semester,
      status: 'published'
    }).select('-questions.correct_answer').sort({ start_time: -1 });

    res.json({ exams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Failed to fetch exams' });
  }
};

// Get exam details with questions
const getExamDetails = async (req, res) => {
  try {
    const { exam_id } = req.params;
    const exam = await Exam.findOne({ exam_id });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is faculty or student
    if (req.user.role === 'faculty' && exam.faculty_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // For students, hide correct answers and randomize if enabled
    let questions = exam.questions;
    if (req.user.role === 'student') {
      questions = questions.map(q => ({
        _id: q._id,
        question_text: q.question_text,
        type: q.type,
        options: q.options,
        image: q.image,
        marks: q.marks
      }));

      if (exam.randomize_questions) {
        questions = questions.sort(() => Math.random() - 0.5);
      }
    }

    res.json({
      exam: {
        ...exam.toObject(),
        questions
      }
    });
  } catch (error) {
    console.error('Error fetching exam details:', error);
    res.status(500).json({ message: 'Failed to fetch exam details' });
  }
};

// Submit exam (Student)
const submitExam = async (req, res) => {
  try {
    const { exam_id, answers, time_taken, tab_switches } = req.body;

    const exam = await Exam.findOne({ exam_id });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if already submitted
    const existingSubmission = await ExamSubmission.findOne({
      exam_id,
      student_id: req.user.user_id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Exam already submitted' });
    }

    // Calculate score
    let score = 0;
    const answersWithCorrectness = answers.map(ans => {
      const question = exam.questions.id(ans.question_id);
      if (question) {
        // Handle different question types
        if (question.type === 'checkbox') {
          // For checkbox, selected_answer should be an array. 
          // Simple equality check for arrays (assuming sorted or exact match needed)
          const correct = Array.isArray(question.correct_answer) ? question.correct_answer : [question.correct_answer];
          const selected = Array.isArray(ans.selected_answer) ? ans.selected_answer : [ans.selected_answer];

          // Check if arrays have same elements
          const isCorrect = correct.length === selected.length && correct.every(val => selected.includes(val));
          if (isCorrect) score += question.marks;
        } else {
          if (question.correct_answer === ans.selected_answer) {
            score += question.marks;
          }
        }
      }
      return ans;
    });

    const percentage = (score / exam.total_marks) * 100;
    const suspicious_activity = tab_switches > 5;

    const submission = new ExamSubmission({
      submission_id: `SUB-${Date.now()}`,
      exam_id,
      student_id: req.user.user_id,
      answers: answersWithCorrectness,
      score,
      total_marks: exam.total_marks,
      percentage,
      time_taken,
      tab_switches,
      suspicious_activity
    });

    await submission.save();

    res.status(201).json({
      message: 'Exam submitted successfully',
      submission: {
        score,
        total_marks: exam.total_marks,
        percentage,
        show_results: exam.show_results
      }
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ message: 'Failed to submit exam', error: error.message });
  }
};

// Get exam results (Faculty and Student)
const getExamResults = async (req, res) => {
  try {
    const { exam_id } = req.params;

    const exam = await Exam.findOne({ exam_id });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    let query = { exam_id };

    if (req.user.role === 'student') {
      query.student_id = req.user.user_id;

      if (!exam.show_results) {
        return res.status(403).json({ message: 'Results not published yet' });
      }
    } else if (req.user.role === 'faculty' && exam.faculty_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const results = await ExamSubmission.find(query).sort({ percentage: -1 });

    res.json({
      exam,
      results
    });
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({ message: 'Failed to fetch exam results' });
  }
};

// Publish exam
const publishExam = async (req, res) => {
  try {
    const { exam_id } = req.params;

    const exam = await Exam.findOne({ exam_id });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.faculty_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    exam.status = 'published';
    await exam.save();

    res.json({ message: 'Exam published successfully', exam });
  } catch (error) {
    console.error('Error publishing exam:', error);
    res.status(500).json({ message: 'Failed to publish exam' });
  }
};

module.exports = {
  createExam,
  addQuestion,
  getFacultyExams,
  getStudentExams,
  getExamDetails,
  submitExam,
  getExamResults,
  publishExam,
  uploadQuestionImage
};