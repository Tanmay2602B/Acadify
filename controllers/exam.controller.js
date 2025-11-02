const pool = require('../config/db');

// Create exam (Faculty)
const createExam = async (req, res) => {
  try {
    const { title, description, subjectId, program, semester, examDate, startTime, endTime, duration, totalMarks } = req.body;
    const createdBy = req.user.user_id;
    
    const query = `
      INSERT INTO exams (title, description, subject_id, program, semester, exam_date, start_time, end_time, duration, total_marks, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      title,
      description,
      subjectId,
      program,
      semester,
      examDate,
      startTime,
      endTime,
      duration,
      totalMarks,
      createdBy
    ]);
    
    res.status(201).json({
      message: 'Exam created successfully',
      exam: {
        id: result.insertId,
        title,
        description,
        subjectId,
        program,
        semester,
        examDate,
        startTime,
        endTime,
        duration,
        totalMarks
      }
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ message: 'Failed to create exam' });
  }
};

// Add question to exam (Faculty)
const addQuestion = async (req, res) => {
  try {
    const { examId } = req.params;
    const { question, optionA, optionB, optionC, optionD, correctAnswer, marks } = req.body;
    
    // Verify that the faculty owns this exam
    const [exams] = await pool.execute(
      'SELECT * FROM exams WHERE id = ? AND created_by = ?', 
      [examId, req.user.user_id]
    );
    
    if (exams.length === 0) {
      return res.status(403).json({ message: 'Not authorized to add questions to this exam' });
    }
    
    const query = `
      INSERT INTO exam_questions (exam_id, question, option_a, option_b, option_c, option_d, correct_answer, marks) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      examId,
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      marks
    ]);
    
    res.status(201).json({
      message: 'Question added successfully',
      question: {
        id: result.insertId,
        examId,
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        marks
      }
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ message: 'Failed to add question' });
  }
};

// Get faculty exams
const getFacultyExams = async (req, res) => {
  try {
    const query = 'SELECT * FROM exams WHERE created_by = ? ORDER BY exam_date DESC';
    const [rows] = await pool.execute(query, [req.user.user_id]);
    
    res.json({ exams: rows });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Failed to fetch exams' });
  }
};

// Get exam details with questions
const getExamDetails = async (req, res) => {
  try {
    const { examId } = req.params;
    
    // Get exam details
    const [exams] = await pool.execute('SELECT * FROM exams WHERE id = ?', [examId]);
    
    if (exams.length === 0) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    const exam = exams[0];
    
    // Check if user is authorized to view this exam
    if (req.user.role === 'student') {
      // Students can only view exams for their program and semester
      const [studentInfo] = await pool.execute(
        'SELECT program, semester FROM users WHERE user_id = ?', 
        [req.user.user_id]
      );
      
      if (studentInfo.length === 0 || 
          studentInfo[0].program !== exam.program || 
          studentInfo[0].semester !== exam.semester) {
        return res.status(403).json({ message: 'Not authorized to view this exam' });
      }
    } else if (req.user.role === 'faculty') {
      // Faculty can only view their own exams
      if (exam.created_by !== req.user.user_id) {
        return res.status(403).json({ message: 'Not authorized to view this exam' });
      }
    }
    
    // Get exam questions
    const [questions] = await pool.execute('SELECT * FROM exam_questions WHERE exam_id = ?', [examId]);
    
    res.json({
      exam,
      questions
    });
  } catch (error) {
    console.error('Error fetching exam details:', error);
    res.status(500).json({ message: 'Failed to fetch exam details' });
  }
};

// Submit exam (Student)
const submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body; // { questionId: selectedOption }
    const studentId = req.user.user_id;
    
    // Get exam details
    const [exams] = await pool.execute('SELECT * FROM exams WHERE id = ?', [examId]);
    
    if (exams.length === 0) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    const exam = exams[0];
    
    // Check if student is authorized to submit this exam
    const [studentInfo] = await pool.execute(
      'SELECT program, semester FROM users WHERE user_id = ?', 
      [studentId]
    );
    
    if (studentInfo.length === 0 || 
        studentInfo[0].program !== exam.program || 
        studentInfo[0].semester !== exam.semester) {
      return res.status(403).json({ message: 'Not authorized to submit this exam' });
    }
    
    // Check if student has already submitted
    const [existing] = await pool.execute(
      'SELECT * FROM exam_submissions WHERE exam_id = ? AND student_id = ?', 
      [examId, studentId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Exam already submitted' });
    }
    
    // Calculate score
    const [questions] = await pool.execute('SELECT * FROM exam_questions WHERE exam_id = ?', [examId]);
    let score = 0;
    
    questions.forEach(question => {
      if (answers[question.id] && answers[question.id] === question.correct_answer) {
        score += question.marks;
      }
    });
    
    // Save submission
    const query = 'INSERT INTO exam_submissions (exam_id, student_id, answers, score) VALUES (?, ?, ?, ?)';
    await pool.execute(query, [examId, studentId, JSON.stringify(answers), score]);
    
    res.status(201).json({
      message: 'Exam submitted successfully',
      score,
      totalMarks: exam.total_marks
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ message: 'Failed to submit exam' });
  }
};

// Get exam results (Faculty and Student)
const getExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    
    // Get exam details
    const [exams] = await pool.execute('SELECT * FROM exams WHERE id = ?', [examId]);
    
    if (exams.length === 0) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    const exam = exams[0];
    
    // Check authorization
    if (req.user.role === 'student') {
      // Students can only view their own results
      const [submissions] = await pool.execute(
        'SELECT * FROM exam_submissions WHERE exam_id = ? AND student_id = ?', 
        [examId, req.user.user_id]
      );
      
      if (submissions.length === 0) {
        return res.status(404).json({ message: 'No results found' });
      }
      
      res.json({
        exam: {
          title: exam.title,
          totalMarks: exam.total_marks
        },
        result: {
          score: submissions[0].score,
          submittedAt: submissions[0].submitted_at
        }
      });
    } else if (req.user.role === 'faculty') {
      // Faculty can view all results for their exams
      if (exam.created_by !== req.user.user_id) {
        return res.status(403).json({ message: 'Not authorized to view these results' });
      }
      
      // Get all submissions for this exam
      const [submissions] = await pool.execute(`
        SELECT es.*, u.name as student_name
        FROM exam_submissions es
        JOIN users u ON es.student_id = u.user_id
        WHERE es.exam_id = ?
        ORDER BY es.score DESC
      `, [examId]);
      
      res.json({
        exam: {
          title: exam.title,
          totalMarks: exam.total_marks
        },
        results: submissions
      });
    }
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({ message: 'Failed to fetch exam results' });
  }
};

module.exports = {
  createExam,
  addQuestion,
  getFacultyExams,
  getExamDetails,
  submitExam,
  getExamResults
};