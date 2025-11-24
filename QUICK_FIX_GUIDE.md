# Acadify - Quick Fix Guide

## Immediate Actions Needed

This guide provides step-by-step instructions to fix all the issues mentioned in your request.

---

## ✅ COMPLETED SO FAR

1. **Created Implementation Plan** (`IMPLEMENTATION_PLAN.md`)
   - Comprehensive breakdown of all fixes needed
   - Priority phases defined
   - Testing checklist included

2. **Created New Models**
   - `Program.mongo.js` - For managing academic programs
   - `Faculty.mongo.js` - Enhanced faculty model with status tracking
   - `Assignment.mongo.js` - For assignment management

3. **Created Utility Functions**
   - `credentialGenerator.js` - Auto-generates IDs and passwords for faculty and students

---

## 🚀 NEXT STEPS TO IMPLEMENT

### Step 1: Update Admin Controller (CRITICAL)

The admin controller needs to be enhanced with:
- Faculty creation with auto-generated credentials
- Student creation with auto-generated credentials  
- Bulk import functionality
- Credential download endpoints
- Program management

**File to update:** `controllers/admin.mongo.controller.js`

### Step 2: Create Enhanced Faculty Controller

Need to add:
- Resource upload/edit/delete
- Assignment creation and grading
- Quiz creation and management
- Results publishing
- Student import for faculty

**File to create/update:** `controllers/faculty.mongo.controller.js`

### Step 3: Update Student Controller

Need to add:
- AI Mentor integration
- Results viewing
- Result download

**File to update:** `controllers/student.mongo.controller.js`

### Step 4: Update Frontend Files

#### Admin Dashboard (`public/admin/dashboard-enhanced.html`)
- Remove Import Hub from sidebar
- Add Program Management section
- Fix Faculty Management section
- Fix Student Management section
- Restructure Timetable section
- Fix Meetings section
- Enhance Reports section

#### Faculty Dashboard (`public/faculty/dashboard-enhanced.html`)
- Add Assignment section to sidebar
- Add Quiz section to sidebar
- Fix Resource Upload
- Fix Meetings section
- Add Results Publishing

#### Student Dashboard (`public/student/dashboard.html`)
- Add AI Mentor automation
- Add Results section

### Step 5: Create Missing Routes

Need to create routes for:
- `/api/admin/faculty/create`
- `/api/admin/faculty/credentials`
- `/api/admin/students/import`
- `/api/admin/students/credentials`
- `/api/admin/programs/*`
- `/api/faculty/assignments/*`
- `/api/faculty/quizzes/*`
- `/api/faculty/results/*`
- `/api/student/ai-chat`
- `/api/student/results`

---

## 📋 PRIORITY FIXES (Do These First)

### Priority 1: Fix Add Faculty/Student Functions

**Current Issue:** Add faculty and add student buttons not working

**Solution:**
1. Update `controllers/admin.mongo.controller.js` to use credential generator
2. Create proper API endpoints in `routes/admin.mongo.routes.js`
3. Update frontend JavaScript to call these endpoints

### Priority 2: Fix Edit/Delete Student

**Current Issue:** Edit and delete buttons not working for students

**Solution:**
1. Implement proper update and delete endpoints
2. Add confirmation dialogs in frontend
3. Refresh data after operations

### Priority 3: Remove Import Hub

**Current Issue:** Import Hub section not in use

**Solution:**
1. Remove from sidebar in `dashboard-enhanced.html`
2. Remove related JavaScript code
3. Keep import functionality within Faculty and Student sections

### Priority 4: Fix Meeting Redirect

**Current Issue:** Clicking meetings redirects to home page

**Solution:**
1. Fix navigation in both admin and faculty dashboards
2. Ensure proper section switching
3. Fix authentication issues

---

## 🔧 TECHNICAL IMPLEMENTATION GUIDE

### Auto-Generate Credentials

**For Faculty:**
```javascript
const { generateFacultyId, generateFacultyPassword } = require('../utils/credentialGenerator');

// In create faculty endpoint
const facultyId = generateFacultyId(name, dateOfBirth);
const password = generateFacultyPassword(name, dateOfBirth);
```

**For Students:**
```javascript
const { generateStudentId, generateStudentPassword } = require('../utils/credentialGenerator');

// In create student endpoint
const studentId = generateStudentId(name, program, semester, dateOfBirth);
const password = generateStudentPassword(name, program, semester);
```

### Download Credentials

Create CSV export functionality:
```javascript
const createCSV = (data) => {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  return [headers, ...rows].join('\n');
};
```

### Faculty Status Tracking

Update faculty status in real-time:
```javascript
// When faculty joins a meeting/class
await Faculty.findOneAndUpdate(
  { faculty_id: facultyId },
  { status: 'in-class' }
);

// When faculty goes offline
await Faculty.findOneAndUpdate(
  { faculty_id: facultyId },
  { status: 'offline' }
);
```

---

## 📊 DATABASE SEEDING

To test the new features, you'll need to seed some data:

```javascript
// Add to seed-mongodb.js
const Program = require('./models/Program.mongo');
const Faculty = require('./models/Faculty.mongo');

// Seed programs
const programs = [
  { program_id: 'PROG-BCA-001', name: 'BCA', code: 'BCA', duration: 3, semesters: 6 },
  { program_id: 'PROG-MCA-001', name: 'MCA', code: 'MCA', duration: 2, semesters: 4 }
];

await Program.insertMany(programs);
```

---

## 🧪 TESTING CHECKLIST

After implementing fixes, test:

- [ ] Can add faculty with auto-generated credentials
- [ ] Can download faculty credentials as CSV
- [ ] Faculty status shows correctly (online/in-class/offline)
- [ ] Can add single student
- [ ] Can import multiple students via CSV
- [ ] Can download student credentials
- [ ] Can edit student details
- [ ] Can delete student with confirmation
- [ ] Import Hub is removed from sidebar
- [ ] Timetable shows program-wise view
- [ ] Meetings section works without redirect
- [ ] Reports show graphs
- [ ] Can export reports to Excel
- [ ] Faculty can upload resources
- [ ] Faculty can create assignments
- [ ] Faculty can create quizzes
- [ ] Students can use AI Mentor
- [ ] Students can view results

---

## 📝 NOTES

- All passwords should be hashed before storage (already handled by User model)
- Keep original passwords in a separate collection for download purposes
- Implement proper error handling for all endpoints
- Add loading states in frontend
- Use toast notifications for user feedback
- Implement proper validation for all forms

---

## 🆘 NEED HELP?

If you encounter issues:
1. Check browser console for errors
2. Check server logs
3. Verify MongoDB connection
4. Ensure all models are properly imported
5. Check route definitions match controller functions

---

## 📞 CONTACT

For questions about implementation, refer to:
- `IMPLEMENTATION_PLAN.md` - Detailed feature breakdown
- `PROJECT_STRUCTURE.md` - Project organization
- `MONGODB_GUIDE.md` - Database setup and usage
