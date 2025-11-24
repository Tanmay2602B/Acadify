# Acadify - Comprehensive Fix Implementation Plan

## Overview
This document outlines all the fixes and improvements needed across Admin, Faculty, and Student dashboards.

---

## ADMIN DASHBOARD FIXES

### 1. Faculty Management
- [ ] **Fix Add Faculty Function**
  - Implement working faculty creation endpoint
  - Auto-generate faculty ID based on name and DOB
  - Auto-generate password based on name and DOB
  - Store credentials securely

- [ ] **Faculty Credentials Download**
  - Add download button for all faculty credentials (CSV/Excel)
  - Include: Name, Faculty ID, Password, Email, Department

- [ ] **Faculty Status Display**
  - Show real-time status: "Live in Class" or "Offline"
  - Integrate with meeting/class tracking system
  - Add status indicator in faculty table

### 2. Student Management
- [ ] **Fix Add Student Function**
  - Implement working student creation endpoint
  - Auto-generate student ID based on name and class
  - Auto-generate password based on name and class

- [ ] **Import Multiple Students**
  - Add "Import Students" button
  - Support CSV/Excel file upload
  - Bulk student creation with validation
  - Show import progress and errors

- [ ] **Student Credentials Download**
  - Add download button for student credentials
  - Include: Name, Student ID, Password, Program, Semester

- [ ] **Fix Edit/Delete Student**
  - Implement working edit functionality
  - Fix delete student function
  - Add confirmation dialogs

### 3. Import Hub
- [ ] **Remove Import Hub**
  - Remove from sidebar navigation
  - Remove related code and UI sections

### 4. Timetable Section
- [ ] **Restructure Timetable**
  - Fix spelling errors
  - Organize by Program → Semester
  - BCA: 6 semesters (separate timetables)
  - MCA: 4 semesters (separate timetables)

- [ ] **Timetable Features**
  - Add download option (PDF/Excel)
  - Integrate calendar view
  - Show weekly schedule grid

### 5. Meetings Section
- [ ] **Fix Meeting Redirect Issue**
  - Fix redirect to home page bug
  - Create proper meeting management interface
  - Show scheduled meetings list
  - Add meeting creation/edit/delete

### 6. Reports Section
- [ ] **Program-wise Reports**
  - Add program filter dropdown
  - Add semester filter dropdown
  - Show reports by program and semester

- [ ] **Report Graphs**
  - Add attendance graphs (line/bar charts)
  - Add performance graphs
  - Add program comparison charts

- [ ] **Export Reports**
  - Add Excel export functionality
  - Add PDF export option
  - Fix existing export bugs

### 7. Faculty Assignment
- [ ] **Assign Faculty to Lectures**
  - Create faculty assignment interface
  - Link faculty to timetable entries
  - Show faculty teaching schedule
  - Track faculty progress/workload

### 8. Program Management
- [ ] **Add Program Option**
  - Create "Add Program" interface
  - Add program name, duration, semesters
  - Edit/delete programs
  - Link programs to students/faculty

---

## FACULTY DASHBOARD FIXES

### 1. Student Section
- [ ] **Import Students**
  - Add import students button
  - Sort by program and semester
  - Auto-generate student credentials
  - Display student ID and password

### 2. Resource Upload
- [ ] **Fix Upload Button**
  - Fix resource upload functionality
  - Support multiple file types (PDF, PPT, DOC, etc.)

- [ ] **Add Edit/Delete Buttons**
  - Add edit button for uploaded resources
  - Add delete button with confirmation
  - Show upload date and file size

### 3. Meetings Section
- [ ] **Fix Meeting Redirect**
  - Fix redirect to home issue
  - Fix automatic logout bug
  - Create proper meeting interface
  - Show faculty's scheduled meetings

### 4. Assignment Section
- [ ] **Add Assignment Section to Sidebar**
  - Create assignment management interface
  - Upload assignment feature
  - Check submitted assignments
  - Give marks/grades to students

### 5. Quiz Section
- [ ] **Add Quiz Section to Sidebar**
  - Create quiz management interface
  - Upload quiz with options:
    - Shuffle questions
    - Time limit
    - Scheduled quiz (date/time)
  - Show countdown timer for active quizzes
  - Filter by program and semester
  - Quiz only for selected program/semester

### 6. Results Publishing
- [ ] **Faculty Results Feature**
  - Create results publishing interface
  - Upload student marks
  - Publish results
  - Notify students automatically

---

## STUDENT DASHBOARD FIXES

### 1. AI Mentor
- [ ] **Automate Chat Section**
  - Integrate AI chatbot (OpenAI/Gemini)
  - Add student-related prompts:
    - Study help
    - Assignment guidance
    - Exam preparation
    - Course information
    - Timetable queries

### 2. Results Section
- [ ] **Add Results Section**
  - Create results viewing interface
  - Student fills details (program, semester, roll number)
  - Display academic results
  - Show report card
  - Download result as PDF

---

## TECHNICAL IMPLEMENTATION DETAILS

### Backend APIs Needed

#### Admin APIs
- `POST /api/faculty/create` - Create faculty with auto-generated credentials
- `GET /api/faculty/credentials` - Download all faculty credentials
- `GET /api/faculty/status/:id` - Get faculty live status
- `POST /api/students/import` - Bulk import students
- `GET /api/students/credentials` - Download student credentials
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/programs/create` - Create new program
- `GET /api/programs` - List all programs
- `POST /api/timetable/assign-faculty` - Assign faculty to lectures
- `GET /api/reports/program/:program/semester/:semester` - Get program-wise reports

#### Faculty APIs
- `POST /api/faculty/resources/upload` - Upload resource
- `PUT /api/faculty/resources/:id` - Edit resource
- `DELETE /api/faculty/resources/:id` - Delete resource
- `POST /api/faculty/assignments/create` - Create assignment
- `GET /api/faculty/assignments/:id/submissions` - Get submissions
- `POST /api/faculty/assignments/:id/grade` - Grade assignment
- `POST /api/faculty/quizzes/create` - Create quiz
- `GET /api/faculty/quizzes/:id/results` - Get quiz results
- `POST /api/faculty/results/publish` - Publish results

#### Student APIs
- `POST /api/ai/chat` - AI mentor chat
- `GET /api/students/results` - Get student results
- `GET /api/students/results/download` - Download result PDF

### Database Models Needed

#### Faculty Model Updates
```javascript
{
  faculty_id: String (auto-generated),
  password: String (auto-generated, hashed),
  status: { type: String, enum: ['online', 'in-class', 'offline'] },
  assigned_lectures: [{ timetable_id, subject, program, semester }]
}
```

#### Program Model
```javascript
{
  program_id: String,
  name: String,
  duration: Number,
  semesters: Number,
  created_at: Date
}
```

#### Assignment Model
```javascript
{
  assignment_id: String,
  title: String,
  description: String,
  faculty_id: String,
  program: String,
  semester: Number,
  due_date: Date,
  submissions: [{
    student_id: String,
    file_url: String,
    submitted_at: Date,
    marks: Number,
    feedback: String
  }]
}
```

#### Quiz Model Updates
```javascript
{
  quiz_id: String,
  title: String,
  faculty_id: String,
  program: String,
  semester: Number,
  scheduled_at: Date,
  duration: Number,
  shuffle_questions: Boolean,
  questions: Array
}
```

---

## PRIORITY ORDER

### Phase 1 (Critical Fixes)
1. Fix Add Faculty/Student functions
2. Fix Edit/Delete Student
3. Fix Meeting redirect issues
4. Remove Import Hub

### Phase 2 (Core Features)
1. Auto-generate credentials (Faculty & Student)
2. Import multiple students
3. Download credentials
4. Restructure Timetable

### Phase 3 (Enhanced Features)
1. Faculty status display
2. Assignment section (Faculty)
3. Quiz section (Faculty)
4. Results section (Student)
5. AI Mentor automation

### Phase 4 (Advanced Features)
1. Program management
2. Faculty assignment to lectures
3. Reports with graphs
4. Export functionality

---

## TESTING CHECKLIST

- [ ] Admin can add faculty with auto-generated credentials
- [ ] Admin can download faculty credentials
- [ ] Admin can see faculty live status
- [ ] Admin can add single student
- [ ] Admin can import multiple students
- [ ] Admin can download student credentials
- [ ] Admin can edit student details
- [ ] Admin can delete student
- [ ] Import Hub is removed
- [ ] Timetable shows program-wise semesters
- [ ] Timetable can be downloaded
- [ ] Meeting section works without redirect
- [ ] Reports show program/semester filters
- [ ] Reports display graphs
- [ ] Reports can be exported
- [ ] Faculty can be assigned to lectures
- [ ] Programs can be added/edited
- [ ] Faculty can import students
- [ ] Faculty can upload resources
- [ ] Faculty can edit/delete resources
- [ ] Faculty meeting section works
- [ ] Faculty can create assignments
- [ ] Faculty can grade assignments
- [ ] Faculty can create quizzes
- [ ] Faculty can schedule quizzes
- [ ] Faculty can publish results
- [ ] Student AI Mentor is automated
- [ ] Student can view results
- [ ] Student can download results

---

## NOTES

- All credential generation should follow a consistent pattern
- Passwords should be hashed before storage
- All downloads should support CSV and Excel formats
- All delete operations should have confirmation dialogs
- Real-time status updates should use WebSocket or polling
- AI Mentor should have rate limiting
- All forms should have proper validation
- Error messages should be user-friendly
