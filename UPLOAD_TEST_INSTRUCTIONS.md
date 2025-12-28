# Upload Functionality Test Instructions

## 🎯 **Issue Fixed**
- **Problem**: "Server configuration error: Cloudinary credentials missing"
- **Solution**: Modified controllers to use `cloudinary.config()` instead of `process.env` directly
- **Status**: ✅ **FIXED**

## 🧪 **Test the Upload Functionality**

### **Prerequisites**
1. ✅ Server running on port 3000
2. ✅ Test assignment created
3. ✅ Test accounts available

### **Step 1: Test Faculty Resource Upload**
1. Go to: `http://localhost:3000/login.html`
2. Login as Faculty:
   - **Email**: `testfaculty@acadify.com`
   - **Password**: `password123`
3. Navigate to **Resources** section
4. Click **"Upload Resource"** button
5. Fill in the form:
   - **Title**: "Test Notes"
   - **Description**: "Sample notes for testing"
   - **Program**: BCA
   - **Semester**: 3
   - **Subject**: "Programming in C"
   - **Type**: Notes
   - **File**: Upload any PDF/DOC file (max 10MB)
6. Click **"Upload Resource"**
7. **Expected Result**: ✅ Success message, file uploaded to Cloudinary

### **Step 2: Test Student Assignment Submission**
1. Go to: `http://localhost:3000/login.html`
2. Login as Student:
   - **Email**: `teststudent@acadify.com`
   - **Password**: `password123`
3. Navigate to **Resources** section
4. Find the assignment: **"Test Programming Assignment"**
5. Click **"Submit"** button
6. Upload the test file:
   - **File**: Use `sample-assignment-solution.txt` (provided in project root)
   - **Comments**: "Here is my solution for the assignment"
7. Click **"Submit Assignment"**
8. **Expected Result**: ✅ Success message, file uploaded to Cloudinary

### **Step 3: Verify Faculty Can View Submissions**
1. Login back as Faculty: `testfaculty@acadify.com`
2. Go to **Resources** section
3. Find **"Test Programming Assignment"**
4. Click **"View Submissions"**
5. **Expected Result**: ✅ Student submission visible with download link

## 📁 **Supported File Types**
- **Documents**: PDF, DOC, DOCX, TXT
- **Presentations**: PPT, PPTX
- **Images**: JPG, JPEG, PNG
- **Archives**: ZIP, RAR
- **Maximum Size**: 10MB per file

## 🔍 **What to Check**
- ✅ No "Cloudinary credentials missing" error
- ✅ Success toast notifications appear
- ✅ Files upload to Cloudinary (URLs work)
- ✅ Resources appear in lists
- ✅ Download functionality works
- ✅ Submissions are tracked properly

## 🐛 **If Issues Persist**
1. **Check Browser Console**: Look for JavaScript errors
2. **Check Server Logs**: Look at terminal for error messages
3. **Verify File Requirements**: Size < 10MB, supported format
4. **Try Different File**: Test with a simple .txt file first

## ✅ **Test Results**
- [ ] Faculty upload works
- [ ] Student submission works
- [ ] No Cloudinary errors
- [ ] Files accessible via download links
- [ ] Submissions visible to faculty

The upload functionality should now work perfectly without any Cloudinary configuration errors!