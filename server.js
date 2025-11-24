const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Load MongoDB connection
const db = require('./config/db.mongo');

// Handle MongoDB connection events
db.on('connected', () => {
  console.log('MongoDB connected successfully');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  // Bypass login and go directly to student dashboard
  res.sendFile(path.join(__dirname, 'public', 'student', 'dashboard.html'));
});

// API Routes
app.use('/api/public', require('./routes/public.mongo.routes'));
app.use('/api/auth', require('./routes/auth.mongo.routes'));
app.use('/api/admin', require('./routes/admin.mongo.routes'));
app.use('/api/admin-enhanced', require('./routes/admin-enhanced.mongo.routes'));
app.use('/api/admin-import', require('./routes/admin-import.mongo.routes'));
app.use('/api/faculty', require('./routes/faculty.mongo.routes'));
app.use('/api/student', require('./routes/student.mongo.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/meetings', require('./routes/meeting.mongo.routes'));
app.use('/api/attendance', require('./routes/attendance.mongo.routes'));
app.use('/api/timetable', require('./routes/timetable.mongo.routes'));
app.use('/api/council', require('./routes/council.mongo.routes'));
app.use('/api/exams', require('./routes/exam.mongo.routes'));
app.use('/api/announcements', require('./routes/announcement.mongo.routes'));
app.use('/api/bulk-students', require('./routes/bulk-student.mongo.routes'));
app.use('/api/reportcards', require('./routes/reportcard.mongo.routes'));
app.use('/api/timetable-generator', require('./routes/timetable-generator.mongo.routes'));
app.use('/api/notifications', require('./routes/notification.mongo.routes'));
app.use('/api/quiz', require('./routes/quiz.mongo.routes'));
app.use('/api/assignments', require('./routes/assignment.mongo.routes'));
app.use('/api/resources', require('./routes/resource.mongo.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});