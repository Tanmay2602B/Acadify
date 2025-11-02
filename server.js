const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

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
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/faculty', require('./routes/faculty.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/meetings', require('./routes/meeting.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/timetable', require('./routes/timetable.routes'));
app.use('/api/council', require('./routes/council.routes'));
app.use('/api/exams', require('./routes/exam.routes'));
app.use('/api/announcements', require('./routes/announcement.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});