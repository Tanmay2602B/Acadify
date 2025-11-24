# 🚀 Acadify Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/acadify
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 4. Initialize Database (Optional)
```bash
npm run init-mongo-db
```

### 5. Start the Server
```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

### 6. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## Default Login Credentials

After running the init script, you can use these default credentials:

### Admin
- Email: `admin@acadify.com`
- Password: `admin123`

### Faculty
- Email: `faculty@acadify.com`
- Password: `faculty123`

### Student
- Email: `student@acadify.com`
- Password: `student123`

## Testing New Features

### 1. Bulk Student Upload
```bash
# Login as Faculty
# Navigate to Students section
# Click "Bulk Upload Students"
# Use this sample JSON:
```
```json
[
  {
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "roll_number": "2024001",
    "program": "BCA",
    "semester": "1",
    "phone": "1234567890"
  },
  {
    "name": "Bob Smith",
    "email": "bob@example.com",
    "roll_number": "2024002",
    "program": "BCA",
    "semester": "1",
    "phone": "0987654321"
  }
]
```

### 2. Auto-Generate Timetable
```bash
# API Endpoint: POST /api/timetable-generator/generate
# Sample Request Body:
```
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
      "name": "Mathematics",
      "periods_per_week": 3,
      "type": "lecture"
    },
    {
      "name": "Computer Lab",
      "periods_per_week": 2,
      "type": "lab"
    }
  ],
  "faculty_assignments": [
    {
      "subject": "Programming in C",
      "faculty_id": "FAC-001",
      "faculty_name": "Dr. Smith"
    }
  ]
}
```

### 3. Generate Report Card
```bash
# API Endpoint: POST /api/reportcards/generate
# Sample Request Body:
```
```json
{
  "student_id": "STU-2024001",
  "program": "BCA",
  "semester": "1",
  "academic_year": "2024-2025",
  "subjects": [
    {
      "name": "Programming in C",
      "internal_marks": 18,
      "external_marks": 75,
      "max_marks": 100,
      "credits": 4
    },
    {
      "name": "Mathematics",
      "internal_marks": 20,
      "external_marks": 80,
      "max_marks": 100,
      "credits": 4
    }
  ]
}
```

### 4. Create Secure Exam
```bash
# API Endpoint: POST /api/exams/
# Sample Request Body:
```
```json
{
  "title": "Mid-Term Exam - Programming",
  "description": "Mid-term examination for Programming in C",
  "program": "BCA",
  "semester": "1",
  "subject": "Programming in C",
  "duration": 60,
  "total_marks": 50,
  "start_time": "2025-01-15T10:00:00Z",
  "end_time": "2025-01-15T11:00:00Z",
  "anti_cheat_enabled": true,
  "randomize_questions": true
}
```

## API Testing with cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"faculty@acadify.com","password":"faculty123"}'
```

### Bulk Upload Students
```bash
curl -X POST http://localhost:3000/api/bulk-students/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"students":[{"name":"Test Student","email":"test@example.com","roll_number":"2024999","program":"BCA","semester":"1"}]}'
```

### Get All Students
```bash
curl -X GET http://localhost:3000/api/bulk-students/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# Windows: net start MongoDB
# macOS/Linux: sudo systemctl start mongod
```

### Port Already in Use
```bash
# Change PORT in .env file to a different port
PORT=3001
```

### JWT Secret Error
```bash
# Make sure JWT_SECRET is set in .env file
JWT_SECRET=your_secret_key_at_least_32_characters_long
```

### Module Not Found Error
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

### Watch for Changes
```bash
npm run dev
```

### Check Logs
The server logs all requests and errors to the console.

### Database GUI Tools
- MongoDB Compass (Recommended)
- Robo 3T
- Studio 3T

### API Testing Tools
- Postman
- Insomnia
- Thunder Client (VS Code Extension)

## Next Steps

1. ✅ Complete the setup
2. ✅ Test login functionality
3. ✅ Try bulk student upload
4. ✅ Generate a timetable
5. ✅ Create an exam
6. ✅ Generate report cards
7. 🎨 Customize the UI
8. 📧 Setup email notifications
9. 🔒 Configure SSL/HTTPS
10. 🚀 Deploy to production

## Support

If you encounter any issues:
1. Check the console logs
2. Verify MongoDB is running
3. Ensure all environment variables are set
4. Check the UPGRADE_SUMMARY.md for detailed feature documentation

## Useful Commands

```bash
# Start server
npm start

# Development mode
npm run dev

# Initialize database
npm run init-mongo-db

# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"
```

---

Happy coding! 🎉
