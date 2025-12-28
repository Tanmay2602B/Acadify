# Upload Functionality Testing Guide

## 🎯 Test Accounts Created

### Student Account
- **Email**: `teststudent@acadify.com`
- **Password**: `password123`
- **Role**: Student
- **User ID**: STU001
- **Program**: BCA
- **Semester**: 3

### Faculty Account
- **Email**: `testfaculty@acadify.com`
- **Password**: `password123`
- **Role**: Faculty
- **User ID**: FAC001
- **Department**: Computer Science

## 🧪 Testing Steps

### 1. Test Faculty Resource Upload

1. **Login as Faculty**:
   - Go to: `http://localhost:3000/login.html`
   - Email: `testfaculty@acadify.com`
   - Password: `password123`

2. **Navigate to Resources**:
   - Click on "Resources" in the sidebar
   - Click "Upload Resource" button

3. **Upload a Resource**:
   - **Title**: "Test Programming Notes"
   - **Description**: "Sample notes for testing upload"
   - **Program**: BCA
   - **Semester**: 3
   - **Subject**: "Programming in C"
   - **Type**: Notes
   - **File**: Upload any PDF/DOC file (max 10MB)
   - Click "Upload Resource"

4. **Expected Result**:
   - ✅ Success message appears
   - ✅ File uploaded to Cloudinary
   - ✅ Resource appears in the resources list
   - ✅ Download link works

### 2. Test Assignment Upload (Faculty)

1. **Upload an Assignment**:
   - **Title**: "Programming Assignment 1"
   - **Description**: "Write a C program for sorting"
   - **Program**: BCA
   - **Semester**: 3
   - **Subject**: "Programming in C"
   - **Type**: Assignment
   - **Start Date**: Today's date
   - **Due Date**: 7 days from today
   - **Late Submission**: Yes
   - **File**: Upload assignment PDF
   - Click "Upload Resource"

2. **Expected Result**:
   - ✅ Assignment created successfully
   - ✅ Shows in resources with assignment badge
   - ✅ Due date and submission info visible

### 3. Test Student Assignment Submission

1. **Login as Student**:
   - Go to: `http://localhost:3000/login.html`
   - Email: `teststudent@acadify.com`
   - Password: `password123`

2. **Navigate to Resources**:
   - Click on "Resources" in the sidebar
   - Find the assignment uploaded by faculty

3. **Submit Assignment**:
   - Click "Submit" button on the assignment
   - **File**: Upload your solution (PDF/DOC/ZIP)
   - **Comments**: "Here is my solution"
   - Click "Submit Assignment"

4. **Expected Result**:
   - ✅ Success message appears
   - ✅ File uploaded to Cloudinary
   - ✅ Submission recorded in database
   - ✅ Assignment shows as submitted

### 4. Test Faculty View Submissions

1. **Back to Faculty Dashboard**:
   - Login as faculty again
   - Go to Resources section
   - Find the assignment you created
   - Click "View Submissions"

2. **Expected Result**:
   - ✅ Student submission appears
   - ✅ Download link works
   - ✅ Can grade the submission
   - ✅ Submission details are correct

## 📁 Supported File Types

### For Resources:
- **Documents**: PDF, DOC, DOCX, TXT
- **Presentations**: PPT, PPTX
- **Images**: JPG, JPEG, PNG
- **Archives**: ZIP, RAR
- **Max Size**: 10MB

### For Assignments:
- Same as above
- Commonly used: PDF, DOC, DOCX, ZIP

## 🔍 What to Check

### Upload Success Indicators:
- ✅ Success toast notification
- ✅ File appears in Cloudinary (check URL works)
- ✅ Resource/submission appears in database
- ✅ Download functionality works
- ✅ Proper metadata saved (title, type, dates, etc.)

### Error Handling:
- ❌ File too large (>10MB) - should show error
- ❌ Unsupported file type - should show error
- ❌ Missing required fields - should show validation error
- ❌ Network issues - should show appropriate error

## 🐛 Troubleshooting

### If Upload Fails:
1. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Check Server Logs**:
   - Look at the terminal running the server
   - Check for error messages

3. **Common Issues**:
   - **401 Unauthorized**: Login again, token may have expired
   - **400 Bad Request**: Check file type and size
   - **500 Server Error**: Check Cloudinary credentials

### Server Status Check:
```bash
# Make sure server is running
npm start

# Should show:
# Server is running on port 3000
# MongoDB connected successfully
```

## 📊 Test Results Template

### Faculty Upload Test:
- [ ] Login successful
- [ ] Upload modal opens
- [ ] Form validation works
- [ ] File upload successful
- [ ] Resource appears in list
- [ ] Download works

### Student Submission Test:
- [ ] Login successful
- [ ] Assignment visible
- [ ] Submit modal opens
- [ ] File upload successful
- [ ] Submission recorded
- [ ] Faculty can view submission

### Error Handling Test:
- [ ] Large file rejected
- [ ] Invalid file type rejected
- [ ] Missing fields validated
- [ ] Network errors handled

## 🎉 Success Criteria

The upload functionality is working correctly if:
1. ✅ Faculty can upload resources without errors
2. ✅ Students can submit assignments without errors
3. ✅ Files are stored in Cloudinary (URLs work)
4. ✅ Database records are created correctly
5. ✅ Download functionality works
6. ✅ Error handling works as expected
7. ✅ UI shows appropriate feedback messages

## 📞 Support

If you encounter any issues during testing:
1. Check this guide first
2. Look at browser console for errors
3. Check server terminal for error logs
4. Verify file meets requirements (size, type)
5. Try logging out and back in

The upload functionality has been completely fixed and should work flawlessly with these test accounts!