const { Exam, ExamSubmission } = require('../models/Exam.mongo');
const { notifyGradeUpdate } = require('../services/notificationService');

/**
 * Create MCQ quiz
 */
const createQuiz = async (req, res) => {
  try {
    const { title, description, program, semester, subject, duration, questions } = req.body;
    
    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions are required' });
    }
    
    // Calculate total marks
    const total_marks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    
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
      start_time: new Date(),
      end_time: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      questions,
      anti_cheat_enabled: true,
      randomize_questions: true,
      show_results: true,
      status: 'published'
    });
    
    await quiz.save();
    
    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: {
        exam_id: quiz.exam_id,
        title: quiz.title,
        total_marks: quiz.total_marks,
        questions_count: quiz.questions.length
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

module.exports = {
  createQuiz,
  submitQuiz,
  getQuizResults,
  getStudentQuizResult
};
