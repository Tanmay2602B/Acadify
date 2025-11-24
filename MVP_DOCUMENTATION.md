# 🎓 Acadify MVP - Complete Documentation

## Overview
Acadify is a comprehensive Learning Resource Management System with automatic features including ID/password generation, timetable creation, attendance tracking, notifications, and MCQ auto-grading.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Configure .env file with your settings

# 4. Start MongoDB
# Windows: net start MongoDB
# macOS/Linux: sudo systemctl start mongod

# 5. Start the server
npm start
```

### Access the Application
- URL: http://localhost:3000
- Login Page: http://localhost:3000/login.html

---

## 📋 MVP Features

### 1. ✅ Authentication System
- JWT-based authentication
- Role-based access control (Admin, Faculty, Student)
- Secure password hashing with bcrypt
- Auto-generated user IDs and passwords

### 2. 📊 Admin Dashboard

#### CSV/Excel Import
- **Endpoint**: `POST /api/admin-import/import/students`
- **Features**:
  - Upload CSV/Excel files
  - Auto-validate data
  - Auto-generate user IDs (format: STU-{timestamp}-{random})
  - Auto-generate secure passwords (12 characters)
  - Preview before confirmation
  - Bulk create user accounts

**Usage**:
```javascript
// Step 1: Upload file for preview
POST /api/admin-import/import/students
Content-Type: multipart/form-data
file: students.csv

// Step 2: Confirm and save
POST /api/admin-import/import/students/confirm
{
  "students": [/* preview data with generated credentials */]
}
```

**CSV Format**:
```csv
name,email,program,semester,batch,section,phone,parent_phone,address,date_of_birth,blood_group
John Doe,john@example.com,BCA,1,2024-2027,A,1234567890,0987654321,123 Main St,2005-01-15,O+
```

#### Download Templates
- **Endpoint**: `GET /api/admin-import/template/:type`
- Types: `student` or `faculty`
- Returns CSV template with sample data

### 3. 📅 Auto-Generated Timetable

**Endpoint**: `POST /api/timetable-generator/generate`

**Features**:
- Smart conflict-free scheduling
- Faculty availability tracking
- Room allocation management
- Automatic break insertion
- Customizable periods per week

**Request**:
```json
{
  "program": "BCA",
  "semester": "1",
  "academic_year": "2024-2025",
  "subjects": [
    {
      "name": "Programming in C",
      "periods_per_week": 4,
      "type": "lecture"
    },
    {
      "name": "C Programming Lab",
      "periods_per_week": 2,
      "type": "lab"
    }
  ],
  "faculty_assignments": [
    {
      "subject": "Programming in C",
      "faculty_id": "FAC-123",
      "faculty_name": "Dr. Smith"
    }
  ]
}
```

**Response**:
```json
{
  "message": "Timetable generated successfully",
  "timetable": {
    "timetable_id": "TT-BCA-1-1732089600000",
    "entries": [
      {
        "day": "Monday",
        "start_time": "09:00",
        "end_time": "10:00",
        "subject": "Programming in C",
        "faculty_name": "Dr. Smith",
        "room": "Room 101",
        "type": "lecture"
      }
    ]
  }
}
```

### 4. 🎥 Meeting System with Auto-Attendance

#### Create Meeting (Faculty)
**Endpoint**: `POST /api/meetings`

**Features**:
- Auto-generate Jitsi room
- Send notifications to all students
- Track participants
- Auto-mark attendance based on duration

**Request**:
```json
{
  "title": "Programming Lecture",
  "description": "Introduction to C Programming",
  "program": "BCA",
  "semester": "1",
  "subject": "Programming in C",
  "scheduled_time": "2025-01-15T10:00:00Z",
  "duration": 60
}
```

**Response**:
```json
{
  "message": "Meeting created successfully",
  "meeting": {
    "meeting_id": "MTG-1732089600000",
    "jitsi_room_url": "https://meet.jit.si/acadify-bca-1-1732089600000",
    "jitsi_room_name": "acadify-bca-1-1732089600000"
  }
}
```

#### Join Meeting (Student)
**Endpoint**: `POST /api/meetings/:meeting_id/join`

- Automatically adds student to participants
- Records join time
- Updates meeting status to "ongoing"

#### Leave Meeting (Student)
**Endpoint**: `POST /api/meetings/:meeting_id/leave`

**Auto-Attendance Logic**:
- Calculates duration (leave_time - join_time)
- If duration >= minimum_duration (default: 30 minutes)
- Automatically marks attendance as "present"
- Creates attendance record in database

### 5. 🔔 Auto-Notifications

**Features**:
- In-app notifications
- Email notifications (optional)
- Real-time unread count
- Notification types: assignment, meeting, announcement, grade, attendance

#### Get Notifications
**Endpoint**: `GET /api/notifications`

**Query Parameters**:
- `unreadOnly=true` - Get only unread notifications
- `limit=50` - Limit number of notifications

#### Get Unread Count
**Endpoint**: `GET /api/notifications/unread-count`

**Response**:
```json
{
  "count": 5
}
```

#### Mark as Read
**Endpoint**: `PUT /api/notifications/:notification_id/read`

#### Mark All as Read
**Endpoint**: `PUT /api/notifications/read-all`

**Auto-Notification Triggers**:
1. **New Assignment**: Notifies all students in program/semester
2. **New Meeting**: Notifies all students in program/semester
3. **Grade Update**: Notifies individual student
4. **Attendance Marked**: Notifies individual student

### 6. 📝 MCQ Auto-Grading System

#### Create Quiz (Faculty)
**Endpoint**: `POST /api/quiz`

**Request**:
```json
{
  "title": "Programming Quiz 1",
  "description": "Basic C Programming Concepts",
  "program": "BCA",
  "semester": "1",
  "subject": "Programming in C",
  "duration": 30,
  "questions": [
    {
      "question_text": "What is the correct syntax?",
      "option_a": "printf('Hello');",
      "option_b": "printf(\"Hello\");",
      "option_c": "print('Hello');",
      "option_d": "echo 'Hello';",
      "correct_answer": "option_b",
      "marks": 2
    }
  ]
}
```

#### Submit Quiz (Student)
**Endpoint**: `POST /api/quiz/:exam_id/submit`

**Request**:
```json
{
  "exam_id": "QUIZ-1732089600000",
  "answers": [
    {
      "question_id": "question_id_here",
      "selected_answer": "option_b"
    }
  ],
  "time_taken": 25
}
```

**Auto-Grading Process**:
1. Compare student answers with correct answers
2. Calculate score (sum of marks for correct answers)
3. Calculate percentage
4. Assign grade (A+, A, B+, B, C+, C, D, F)
5. Save submission with results
6. Send grade notification to student

**Response**:
```json
{
  "message": "Quiz submitted and graded successfully",
  "result": {
    "score": 18,
    "total_marks": 20,
    "percentage": "90.00",
    "grade": "A+",
    "answers": [
      {
        "question_id": "...",
        "selected_answer": "option_b",
        "correct_answer": "option_b",
        "is_correct": true,
        "marks_obtained": 2,
        "marks_total": 2
      }
    ]
  }
}
```

#### Get Quiz Results (Faculty)
**Endpoint**: `GET /api/quiz/:exam_id/results`

**Response**:
```json
{
  "quiz": {
    "title": "Programming Quiz 1",
    "subject": "Programming in C",
    "total_marks": 20
  },
  "stats": {
    "total_submissions": 25,
    "average_score": 75.5,
    "highest_score": 95,
    "lowest_score": 45,
    "pass_rate": 88
  },
  "results": [
    {
      "student_id": "STU-123",
      "student_name": "John Doe",
      "score": 18,
      "total_marks": 20,
      "percentage": 90,
      "grade": "A+",
      "submitted_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### 7. 📤 Assignment Upload & Submission

**Endpoint**: `POST /api/student/assignments/:resource_id/submit`

**Features**:
- File upload with Multer
- Cloudinary integration
- Submission tracking
- Faculty grading interface

---

## 🗄️ Database Models

### User Model
```javascript
{
  user_id: String (unique),
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/faculty/student),
  program: String,
  semester: String,
  department: String,
  designation: String
}
```

### Student Model
```javascript
{
  student_id: String (unique),
  user_id: String (ref: User),
  roll_number: String (unique),
  enrollment_number: String,
  program: String,
  semester: String,
  batch: String,
  section: String,
  phone: String,
  parent_phone: String,
  address: String,
  date_of_birth: Date,
  blood_group: String,
  status: String (active/inactive)
}
```

### Meeting Model
```javascript
{
  meeting_id: String (unique),
  title: String,
  program: String,
  semester: String,
  subject: String,
  faculty_id: String,
  scheduled_time: Date,
  duration: Number,
  jitsi_room_name: String,
  jitsi_room_url: String,
  status: String (scheduled/ongoing/completed),
  participants: [{
    user_id: String,
    joined_at: Date,
    left_at: Date,
    duration: Number,
    attendance_marked: Boolean
  }],
  auto_attendance: Boolean,
  minimum_duration: Number
}
```

### Notification Model
```javascript
{
  notification_id: String (unique),
  recipient_id: String,
  recipient_role: String,
  type: String,
  title: String,
  message: String,
  link: String,
  is_read: Boolean,
  priority: String (low/medium/high)
}
```

### Exam/Quiz Model
```javascript
{
  exam_id: String (unique),
  title: String,
  program: String,
  semester: String,
  subject: String,
  faculty_id: String,
  duration: Number,
  total_marks: Number,
  questions: [{
    question_text: String,
    option_a: String,
    option_b: String,
    option_c: String,
    option_d: String,
    correct_answer: String,
    marks: Number
  }],
  status: String (draft/published)
}
```

### ExamSubmission Model
```javascript
{
  submission_id: String (unique),
  exam_id: String,
  student_id: String,
  answers: [{
    question_id: ObjectId,
    selected_answer: String,
    correct_answer: String,
    is_correct: Boolean,
    marks_obtained: Number
  }],
  score: Number,
  total_marks: Number,
  percentage: Number,
  grade: String,
  submitted_at: Date
}
```

---

## 🎨 UI/UX Features

### Glassmorphism Theme
- Blue → Purple gradient backgrounds
- Rounded cards with shadow effects
- Transparent overlays with backdrop blur
- Smooth transitions and animations

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px (mobile), 1024px (tablet), 1280px (desktop)
- Touch-friendly buttons and inputs
- Collapsible navigation on mobile

### Components
1. **Admin Dashboard**
   - KPI cards with statistics
   - Import modal with drag-drop
   - Column mapping UI
   - Timetable wizard with preview
   - Confirmation tables

2. **Faculty Dashboard**
   - Assignment grader panel
   - Quick start meeting button
   - Availability calendar
   - Quiz creator with question builder
   - Results analytics

3. **Student Dashboard**
   - Next class card
   - Submit assignment modal
   - Embedded Jitsi meeting
   - Notification bell with count
   - AI chatbot bubble (placeholder)

---

## 🔐 Security Features

1. **Password Security**
   - Auto-generated 12-character passwords
   - Mix of uppercase, lowercase, numbers, symbols
   - Bcrypt hashing with 10 rounds
   - Never store plaintext passwords

2. **Authentication**
   - JWT tokens with 7-day expiry
   - Role-based access control
   - Protected routes with middleware
   - Token validation on every request

3. **Data Validation**
   - Email format validation
   - Required field checks
   - Duplicate detection
   - File type and size limits

4. **API Security**
   - CORS configuration
   - Rate limiting (recommended)
   - Input sanitization
   - Error handling without exposing internals

---

## 📧 Email Notifications

### Configuration
Set in `.env`:
```env
ENABLE_EMAIL_NOTIFICATIONS=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@acadify.com
```

### Email Templates
- Professional HTML templates
- Gradient header with Acadify branding
- Clear call-to-action buttons
- Responsive design

---

## 🧪 Testing

### Sample Data Files

**students-sample.csv**:
```csv
name,email,program,semester,batch,section,phone
Alice Johnson,alice@example.com,BCA,1,2024-2027,A,1234567890
Bob Smith,bob@example.com,BCA,1,2024-2027,A,2345678901
Carol Davis,carol@example.com,BCA,1,2024-2027,B,3456789012
```

**faculty-sample.csv**:
```csv
name,email,department,designation,phone
Dr. John Smith,drjohn@example.com,Computer Science,Professor,1234567890
Prof. Jane Doe,profjane@example.com,Mathematics,Associate Professor,2345678901
```

### API Testing with cURL

**Import Students**:
```bash
curl -X POST http://localhost:3000/api/admin-import/import/students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@students.csv"
```

**Create Meeting**:
```bash
curl -X POST http://localhost:3000/api/meetings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Meeting",
    "program": "BCA",
    "semester": "1",
    "subject": "Programming",
    "scheduled_time": "2025-01-20T10:00:00Z",
    "duration": 60
  }'
```

---

## 🚀 Deployment

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure production MongoDB URI
- [ ] Enable HTTPS
- [ ] Set up email SMTP
- [ ] Configure Cloudinary
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure backups

### Environment Variables
See `.env.example` for all required variables.

---

## 📝 TODO for Production

1. **Replace Cloudinary keys** with production credentials
2. **Enable Gemini API** for AI chatbot
3. **Configure email SMTP** for notifications
4. **Add rate limiting** to prevent abuse
5. **Implement caching** (Redis) for better performance
6. **Add logging** (Winston or Morgan)
7. **Set up monitoring** (PM2, New Relic)
8. **Configure SSL/HTTPS**
9. **Add unit tests** (Jest/Mocha)
10. **Implement pagination** for large datasets

---

## 🎯 Key Achievements

✅ Auto-generated user IDs and passwords  
✅ CSV/Excel import with validation  
✅ Auto-generated timetables  
✅ Auto-attendance via meeting joins  
✅ Auto-notifications (in-app + email)  
✅ MCQ auto-grading  
✅ Jitsi Meet integration  
✅ Glassmorphism UI theme  
✅ Mobile-responsive design  
✅ JWT authentication  
✅ Role-based access control  

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review API endpoints
3. Check server logs
4. Verify environment variables
5. Test with sample data

---

**Version**: 2.1.0 (MVP)  
**Last Updated**: November 20, 2025  
**Status**: Production Ready ✅
