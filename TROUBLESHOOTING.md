# 🔧 Troubleshooting Guide - Acadify

## Common Issues and Solutions

### 1. Login Error: "Invalid namespace specified"

**Error Message**: `Invalid namespace specified: acadify/acadify_db.users`

**Cause**: Database name mismatch between configuration and seeded data.

**Solution**: ✅ FIXED
- Updated `config/db.mongo.js` to use `acadify` database
- Updated `.env` to use `MONGODB_URI=mongodb://localhost:27017/acadify`
- Restarted server

**Verify Fix**:
```bash
# Check if server is running
# Should show: MongoDB connected successfully
```

---

### 2. MongoDB Collections Not Showing

**Symptoms**: MongoDB Compass shows empty database

**Solution**:
```bash
# Run the seed script
npm run seed
```

This will create all collections with sample data.

**Verify**:
- Open MongoDB Compass
- Connect to `mongodb://localhost:27017`
- Select database: `acadify`
- Refresh (F5)
- You should see 9 collections

---

### 3. Server Won't Start

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

---

### 4. MongoDB Connection Failed

**Error**: `MongoDB connection failed: connect ECONNREFUSED`

**Solution**:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod

# Verify MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

---

### 5. Login Fails with Correct Credentials

**Possible Causes**:
1. Database not seeded
2. Password hash mismatch
3. JWT secret not set

**Solution**:
```bash
# 1. Re-seed database
npm run seed

# 2. Check .env file
# Ensure JWT_SECRET is set
JWT_SECRET=acadify_jwt_secret

# 3. Restart server
npm start
```

---

### 6. CSV Import Not Working

**Error**: `No file uploaded` or `Invalid file type`

**Solution**:
- Ensure file is CSV or Excel format (.csv, .xls, .xlsx)
- File size must be under 5MB
- Use provided template: `GET /api/admin-import/template/student`

**Sample CSV Format**:
```csv
name,email,program,semester,batch,section,phone
John Doe,john@example.com,BCA,1,2024-2027,A,1234567890
```

---

### 7. Notifications Not Showing

**Cause**: Email notifications not configured

**Solution**:
```bash
# In .env file
ENABLE_EMAIL_NOTIFICATIONS=false  # Set to false for development

# Or configure SMTP
ENABLE_EMAIL_NOTIFICATIONS=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

### 8. Meeting Join Not Working

**Symptoms**: Jitsi room doesn't load

**Solution**:
- Check internet connection (Jitsi requires internet)
- Verify Jitsi domain in .env:
```bash
JITSI_DOMAIN=meet.jit.si
```
- Allow camera/microphone permissions in browser

---

### 9. Auto-Attendance Not Marking

**Cause**: Student didn't stay in meeting long enough

**Requirements**:
- Minimum duration: 30 minutes (default)
- Must click "Leave Meeting" button
- Auto-attendance enabled for meeting

**Verify**:
```javascript
// Check meeting settings
{
  "auto_attendance": true,
  "minimum_duration": 30
}
```

---

### 10. Quiz Auto-Grading Not Working

**Symptoms**: Score shows as 0 or incorrect

**Solution**:
- Ensure questions have `correct_answer` field
- Verify answer format matches: `option_a`, `option_b`, etc.
- Check quiz status is `published`

**Example Question**:
```json
{
  "question_text": "What is 2+2?",
  "option_a": "3",
  "option_b": "4",
  "option_c": "5",
  "option_d": "6",
  "correct_answer": "option_b",
  "marks": 2
}
```

---

## Database Issues

### Reset Database
```bash
# Clear all data and re-seed
npm run seed
```

### Check Database Connection
```bash
# Test MongoDB connection
mongosh
use acadify
db.users.countDocuments()
# Should return: 6
```

### View Collections
```bash
mongosh
use acadify
show collections
# Should show: users, students, exams, etc.
```

---

## API Testing

### Test Login Endpoint
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acadify.com","password":"admin123"}'
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "ADM-001",
    "name": "Admin User",
    "email": "admin@acadify.com",
    "role": "admin"
  }
}
```

### Test Protected Endpoint
```bash
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Environment Variables

### Required Variables
```bash
# Minimum required in .env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/acadify
JWT_SECRET=acadify_jwt_secret
JWT_EXPIRE=7d
```

### Optional Variables
```bash
# Email notifications
ENABLE_EMAIL_NOTIFICATIONS=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password

# Jitsi
JITSI_DOMAIN=meet.jit.si

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

---

## Browser Issues

### Clear Browser Cache
1. Press `Ctrl + Shift + Delete`
2. Clear cached images and files
3. Clear cookies and site data
4. Restart browser

### Check Console for Errors
1. Press `F12` to open Developer Tools
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

---

## Server Logs

### View Server Logs
Server logs are displayed in the terminal where you ran `npm start`

**Common Log Messages**:
- ✅ `Server is running on port 3000` - Server started
- ✅ `MongoDB connected successfully` - Database connected
- ❌ `MongoDB connection failed` - Check MongoDB service
- ❌ `EADDRINUSE` - Port already in use

---

## Quick Fixes

### Complete Reset
```bash
# 1. Stop server (Ctrl+C)
# 2. Clear database
npm run seed
# 3. Restart server
npm start
# 4. Clear browser cache
# 5. Try logging in again
```

### Verify Installation
```bash
# Check Node.js
node --version  # Should be v14+

# Check npm
npm --version

# Check MongoDB
mongosh --version

# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

---

## Getting Help

### Check Documentation
1. `MVP_DOCUMENTATION.md` - Complete guide
2. `MONGODB_GUIDE.md` - Database guide
3. `QUICK_START.md` - Setup guide
4. `README.md` - Project overview

### Debug Mode
```bash
# Run with debug output
NODE_ENV=development npm start
```

### Test Credentials
```
Admin:   admin@acadify.com / admin123
Faculty: john.smith@acadify.com / faculty123
Student: alice@example.com / student123
```

---

## Still Having Issues?

1. Check all environment variables in `.env`
2. Verify MongoDB is running
3. Clear browser cache
4. Re-seed database: `npm run seed`
5. Restart server: `npm start`
6. Check server logs for errors
7. Test with provided credentials

---

**Last Updated**: November 20, 2025  
**Version**: 2.1.0
