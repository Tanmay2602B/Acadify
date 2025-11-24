# 🗄️ MongoDB Compass Guide - Acadify

## ✅ Collections Created

After running `npm run seed`, the following collections are now visible in MongoDB Compass:

### 1. **users** Collection
- **Count**: 6 documents (1 admin, 2 faculty, 3 students)
- **Fields**: user_id, name, email, password (hashed), role, program, semester
- **Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "user_id": "STU-001",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "$2a$10$...",
  "role": "student",
  "program": "BCA",
  "semester": "1",
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### 2. **students** Collection
- **Count**: 3 documents
- **Fields**: student_id, user_id, roll_number, enrollment_number, program, semester, batch, section, phone, status
- **Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "student_id": "S-STU-001",
  "user_id": "STU-001",
  "roll_number": "BCA1001",
  "enrollment_number": "EN2024001",
  "program": "BCA",
  "semester": "1",
  "batch": "2024-2027",
  "section": "A",
  "phone": "9876543210",
  "status": "active"
}
```

### 3. **exams** Collection
- **Count**: 1 document (quiz with 5 MCQ questions)
- **Fields**: exam_id, title, program, semester, subject, faculty_id, duration, total_marks, questions[], status
- **Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "exam_id": "QUIZ-001",
  "title": "Programming Quiz 1",
  "program": "BCA",
  "semester": "1",
  "subject": "Programming in C",
  "faculty_id": "FAC-001",
  "duration": 30,
  "total_marks": 10,
  "questions": [
    {
      "question_text": "What is the correct syntax...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "correct_answer": "option_b",
      "marks": 2
    }
  ],
  "status": "published"
}
```

### 4. **timetables** Collection
- **Count**: 1 document
- **Fields**: timetable_id, program, semester, academic_year, entries[], is_active
- **Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "timetable_id": "TT-BCA-1-2024",
  "program": "BCA",
  "semester": "1",
  "academic_year": "2024-2025",
  "entries": [
    {
      "day": "Monday",
      "start_time": "09:00",
      "end_time": "10:00",
      "subject": "Programming in C",
      "faculty_name": "Dr. John Smith",
      "room": "Room 101",
      "type": "lecture"
    }
  ],
  "is_active": true
}
```

### 5. **meetings** Collection
- **Count**: 1 document
- **Fields**: meeting_id, title, program, semester, subject, faculty_id, scheduled_time, jitsi_room_url, status, participants[]
- **Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "meeting_id": "MTG-001",
  "title": "Programming Lecture",
  "program": "BCA",
  "semester": "1",
  "subject": "Programming in C",
  "faculty_id": "FAC-001",
  "scheduled_time": ISODate("..."),
  "duration": 60,
  "jitsi_room_url": "https://meet.jit.si/acadify-bca-1-programming",
  "status": "scheduled",
  "auto_attendance": true,
  "participants": []
}
```

### 6. **attendances** Collection
- **Count**: 1 document
- **Fields**: attendance_id, program, semester, subject, faculty_id, date, records[]
- **Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "attendance_id": "ATT-001",
  "program": "BCA",
  "semester": "1",
  "subject": "Programming in C",
  "faculty_id": "FAC-001",
  "date": ISODate("..."),
  "records": [
    {
      "student_id": "STU-001",
      "status": "present",
      "marked_at": ISODate("...")
    }
  ]
}
```

### 7. **notifications** Collection
- **Count**: 2 documents
- **Fields**: notification_id, recipient_id, recipient_role, type, title, message, is_read, priority
- **Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "notification_id": "NOT-001",
  "recipient_id": "STU-001",
  "recipient_role": "student",
  "type": "meeting",
  "title": "New Meeting Scheduled",
  "message": "A new meeting has been scheduled...",
  "is_read": false,
  "priority": "high",
  "createdAt": ISODate("...")
}
```

### 8. **reportcards** Collection
- **Count**: 1 document
- **Fields**: report_id, student_id, program, semester, subjects[], total_marks_obtained, percentage, sgpa, cgpa, status
- **Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "report_id": "RPT-STU-001-1-2024",
  "student_id": "STU-001",
  "program": "BCA",
  "semester": "1",
  "subjects": [
    {
      "subject": "Programming in C",
      "internal_marks": 18,
      "external_marks": 75,
      "total_marks": 93,
      "grade": "A+",
      "credits": 4
    }
  ],
  "percentage": 96.5,
  "sgpa": 10,
  "status": "published"
}
```

### 9. **resources** Collection
- **Count**: 1 document
- **Fields**: resource_id, title, description, type, program, semester, subject, faculty_id, file_url
- **Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "resource_id": "RES-001",
  "title": "Introduction to C Programming",
  "type": "notes",
  "program": "BCA",
  "semester": "1",
  "subject": "Programming in C",
  "faculty_id": "FAC-001",
  "file_url": "https://example.com/notes.pdf",
  "is_active": true
}
```

---

## 🔍 How to View in MongoDB Compass

1. **Open MongoDB Compass**
2. **Connect** to `mongodb://localhost:27017`
3. **Select Database**: `acadify`
4. **View Collections**: You should see all 9 collections listed
5. **Click on any collection** to view documents

---

## 🔑 Test Login Credentials

Use these credentials to test the application:

### Admin
- **Email**: admin@acadify.com
- **Password**: admin123
- **Role**: Full system access

### Faculty
- **Email**: john.smith@acadify.com
- **Password**: faculty123
- **Role**: Create meetings, quizzes, mark attendance

### Student
- **Email**: alice@example.com
- **Password**: student123
- **Role**: Join meetings, take quizzes, view grades

---

## 🔄 Re-seeding the Database

If you need to reset the database with fresh data:

```bash
npm run seed
```

This will:
1. Clear all existing data
2. Create fresh seed data
3. Display summary of created records

---

## 📊 Useful MongoDB Compass Queries

### Find all students in BCA Semester 1
```javascript
{ "program": "BCA", "semester": "1" }
```

### Find unread notifications for a student
```javascript
{ "recipient_id": "STU-001", "is_read": false }
```

### Find published quizzes
```javascript
{ "status": "published" }
```

### Find scheduled meetings
```javascript
{ "status": "scheduled" }
```

### Find present attendance records
```javascript
{ "records.status": "present" }
```

---

## 🛠️ Troubleshooting

### Collections not showing?
1. Refresh MongoDB Compass (F5)
2. Disconnect and reconnect
3. Run `npm run seed` again

### Connection refused?
1. Check if MongoDB service is running
   - Windows: `net start MongoDB`
   - macOS/Linux: `sudo systemctl start mongod`
2. Verify connection string in `.env`

### Data not updating?
1. Check server logs for errors
2. Verify API endpoints are working
3. Check authentication tokens

---

## 📈 Collection Statistics

After seeding, you should see:

| Collection | Documents | Purpose |
|------------|-----------|---------|
| users | 6 | User accounts (admin, faculty, students) |
| students | 3 | Student profiles with details |
| exams | 1 | Quizzes and exams |
| timetables | 1 | Class schedules |
| meetings | 1 | Online meetings |
| attendances | 1 | Attendance records |
| notifications | 2 | User notifications |
| reportcards | 1 | Student grades |
| resources | 1 | Learning materials |

**Total Documents**: 17

---

## 🎯 Next Steps

1. ✅ Verify all collections are visible in MongoDB Compass
2. ✅ Test login with provided credentials
3. ✅ Explore the data structure
4. ✅ Test API endpoints with the seeded data
5. ✅ Import more students using CSV import feature

---

**Last Updated**: November 20, 2025  
**Database**: acadify  
**MongoDB Version**: 4.4+
