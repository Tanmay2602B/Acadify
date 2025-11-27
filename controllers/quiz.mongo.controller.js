const { Exam, ExamSubmission } = require('../models/Exam.mongo');
const { notifyGradeUpdate } = require('../services/notificationService');

/**
 * Create MCQ quiz with scheduling
 */
const createQuiz = async (req, res) => {
  try {
    const { title, description, program, semester, subject, duration, questions, start_time } = req.body;
    
    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions are required' });
    }
    
    // Validate start_time
    if (!start_time) {
      return res.status(400).json({ message: 'Schedule time is required' });
    }
    
    // Calculate total marks
    const total_marks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    
    // Calculate end time (start_time + duration + 1 hour buffer)
    const startDate = new Date(start_time);
    const endDate = new Date(startDate.getTime() + (duration + 60) * 60 * 1000);
    
    const quiz = new Exam({
      exam_id: `QUIZ-${Date.now()}`,
      title,
      description,
      program,
      semester,
      subject,
      faculty_id: req.user.user_id,
      duration,
      total_marks,
      start_time: startDate,
      end_time: endDate,
      questions,
      anti_cheat_enabled: true,
      randomize_questions: true,
      show_results: false, // Don't show results immediately
      status: 'published'
    });
    
    await quiz.save();
    
    res.status(201).json({
      message: 'Quiz created and scheduled successfully',
      quiz: {
        exam_id: quiz.exam_id,
        title: quiz.title,
        total_marks: quiz.total_marks,
        questions_count: quiz.questions.length,
        start_time: quiz.start_time,
        end_time: quiz.end_time
      }
    });
    
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Failed to create quiz', error: error.message });
  }
};

/**
 * Submit quiz and auto-grade
 */
const submitQuiz = async (req, res) => {
  try {
    const { exam_id, answers, time_taken } = req.body;
    
    const quiz = await Exam.findOne({ exam_id });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if already submitted
    const existingSubmission = await ExamSubmission.findOne({
      exam_id,
      student_id: req.user.user_id
    });
    
    if (existingSubmission) {
      return res.status(400).json({ message: 'Quiz already submitted' });
    }
    
    // Auto-grade
    let score = 0;
    const gradedAnswers = [];
    
    for (const answer of answers) {
      const question = quiz.questions.id(answer.question_id);
      
      if (question) {
        const isCorrect = question.correct_answer === answer.selected_answer;
        
        if (isCorrect) {
          score += question.marks;
        }
        
        gradedAnswers.push({
          question_id: answer.question_id,
          selected_answer: answer.selected_answer,
          correct_answer: question.correct_answer,
          is_correct: isCorrect,
          marks_obtained: isCorrect ? question.marks : 0,
          marks_total: question.marks
        });
      }
    }
    
    const percentage = (score / quiz.total_marks) * 100;
    
    // Determine grade
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C+';
    else if (percentage >= 40) grade = 'C';
    else if (percentage >= 35) grade = 'D';
    
    // Save submission
    const submission = new ExamSubmission({
      submission_id: `SUB-${Date.now()}`,
      exam_id,
      student_id: req.user.user_id,
      answers: gradedAnswers,
      score,
      total_marks: quiz.total_marks,
      percentage,
      grade,
      time_taken,
      tab_switches: 0,
      suspicious_activity: false
    });
    
    await submission.save();
    
    // Send notification
    await notifyGradeUpdate(req.user.user_id, {
      subject: quiz.subject,
      score,
      total: quiz.total_marks,
      grade
    });
    
    res.status(201).json({
      message: 'Quiz submitted and graded successfully',
      result: {
        score,
        total_marks: quiz.total_marks,
        percentage: percentage.toFixed(2),
        grade,
        answers: gradedAnswers,
        time_taken
      }
    });
    
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
  }
};

/**
 * Get quiz results (faculty)
 */
const getQuizResults = async (req, res) => {
  try {
    const { exam_id } = req.params;
    
    const quiz = await Exam.findOne({ exam_id });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    if (quiz.faculty_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const submissions = await ExamSubmission.find({ exam_id }).sort({ percentage: -1 });
    
    // Get student details
    const User = require('../models/User.mongo');
    const results = await Promise.all(
      submissions.map(async (sub) => {
        const student = await User.findOne({ user_id: sub.student_id });
        return {
          student_id: sub.student_id,
          student_name: student?.name || 'Unknown',
          score: sub.score,
          total_marks: sub.total_marks,
          percentage: sub.percentage,
          grade: sub.grade,
          time_taken: sub.time_taken,
          submitted_at: sub.submitted_at
        };
      })
    );
    
    // Calculate statistics
    const stats = {
      total_submissions: submissions.length,
      average_score: submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length || 0,
      highest_score: submissions[0]?.percentage || 0,
      lowest_score: submissions[submissions.length - 1]?.percentage || 0,
      pass_rate: (submissions.filter(s => s.percentage >= 40).length / submissions.length * 100) || 0
    };
    
    res.json({
      quiz: {
        title: quiz.title,
        subject: quiz.subject,
        total_marks: quiz.total_marks
      },
      stats,
      results
    });
    
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz results' });
  }
};

/**
 * Get student quiz result
 */
const getStudentQuizResult = async (req, res) => {
  try {
    const { exam_id } = req.params;
    
    const submission = await ExamSubmission.findOne({
      exam_id,
      student_id: req.user.user_id
    });
    
    if (!submission) {
      return res.status(404).json({ message: 'No submission found' });
    }
    
    const quiz = await Exam.findOne({ exam_id });
    
    res.json({
      quiz: {
        title: quiz.title,
        subject: quiz.subject
      },
      result: {
        score: submission.score,
        total_marks: submission.total_marks,
        percentage: submission.percentage,
        grade: submission.grade,
        answers: submission.answers,
        submitted_at: submission.submitted_at
      }
    });
    
  } catch (error) {
    console.error('Get student quiz result error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz result' });
  }
};

/**
 * Get available quizzes for student
 */
const getAvailableQuizzes = async (req, res) => {
  try {
    const User = require('../models/User.mongo');
    const student = await User.findOne({ user_id: req.user.user_id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Find quizzes for student's program and semester
    const quizzes = await Exam.find({
      program: student.program,
      semester: student.semester,
      status: 'published'
    }).sort({ start_time: -1 });
    
    // Check which quizzes student has already submitted
    const submissions = await ExamSubmission.find({
      student_id: req.user.user_id
    });
    
    const submittedExamIds = submissions.map(s => s.exam_id);
    
    // Format quiz data with status
    const now = new Date();
    const formattedQuizzes = quizzes.map(quiz => {
      const isSubmitted = submittedExamIds.includes(quiz.exam_id);
      const isScheduled = new Date(quiz.start_time) > now;
      const isExpired = new Date(quiz.end_time) < now;
      const isActive = !isScheduled && !isExpired;
      
      let status = 'active';
      if (isSubmitted) status = 'submitted';
      else if (isScheduled) status = 'scheduled';
      else if (isExpired) status = 'expired';
      
      return {
        exam_id: quiz.exam_id,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        duration: quiz.duration,
        total_marks: quiz.total_marks,
        questions_count: quiz.questions.length,
        start_time: quiz.start_time,
        end_time: quiz.end_time,
        status,
        is_submitted: isSubmitted,
        is_scheduled: isScheduled,
        is_active: isActive,
        is_expired: isExpired
      };
    });
    
    res.json({ quizzes: formattedQuizzes });
    
  } catch (error) {
    console.error('Get available quizzes error:', error);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
};

/**
 * Get quiz for taking (with questions)
 */
const getQuizForTaking = async (req, res) => {
  try {
    const { exam_id } = req.params;
    
    const quiz = await Exam.findOne({ exam_id, status: 'published' });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if already submitted
    const existingSubmission = await ExamSubmission.findOne({
      exam_id,
      student_id: req.user.user_id
    });
    
    if (existingSubmission) {
      return res.status(400).json({ message: 'Quiz already submitted' });
    }
    
    // Check if quiz is active
    const now = new Date();
    if (new Date(quiz.start_time) > now) {
      return res.status(400).json({ message: 'Quiz has not started yet' });
    }
    
    if (new Date(quiz.end_time) < now) {
      return res.status(400).json({ message: 'Quiz has expired' });
    }
    
    // Randomize questions if enabled
    let questions = quiz.questions.map(q => ({
      _id: q._id,
      type: q.type,
      question_text: q.question_text,
      options: q.options,
      marks: q.marks
    }));
    
    if (quiz.randomize_questions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }
    
    res.json({
      exam_id: quiz.exam_id,
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      duration: quiz.duration,
      total_marks: quiz.total_marks,
      start_time: quiz.start_time,
      end_time: quiz.end_time,
      anti_cheat_enabled: quiz.anti_cheat_enabled,
      questions
    });
    
  } catch (error) {
    console.error('Get quiz for taking error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz' });
  }
};

module.exports = {
  createQuiz,
  submitQuiz,
  getQuizResults,
  getStudentQuizResult,
  getAvailableQuizzes,
  getQuizForTaking
};
