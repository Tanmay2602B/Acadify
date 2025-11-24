# 📁 Acadify Project Structure

## Root Directory
```
acadify/
├── config/                 # Configuration files
│   └── db.mongo.js        # MongoDB connection
│
├── controllers/           # Business logic
│   ├── admin-import.mongo.controller.js
│   ├── admin.mongo.controller.js
│   ├── attendance.mongo.controller.js
│   ├── bulk-student.mongo.controller.js
│   ├── exam.mongo.controller.js
│   ├── faculty.mongo.controller.js
│   ├── meeting.mongo.controller.js
│   ├── quiz.mongo.controller.js
│   ├── reportcard.mongo.controller.js
│   ├── student.mongo.controller.js
│   └── timetable-generator.mongo.controller.js
│
├── middlewares/           # Express middlewares
│   └── auth.js           # JWT authentication
│
├── models/               # MongoDB schemas
│   ├── Attendance.mongo.js
│   ├── Exam.mongo.js
│   ├── Meeting.mongo.js
│   ├── Notification.mongo.js
│   ├── ReportCard.mongo.js
│   ├── Resource.mongo.js
│   ├── Student.mongo.js
│   ├── Timetable.mongo.js
│   └── User.mongo.js
│
├── public/               # Frontend files
│   ├── admin/
│   │   └── dashboard.html
│   ├── faculty/
│   │   └── dashboard-enhanced.html
│   ├── student/
│   │   └── dashboard.html
│   ├── uploads/
│   ├── index.html
│   ├── login.html
│   └── register.html
│
├── routes/               # API routes
│   ├── admin-import.mongo.routes.js
│   ├── admin.mongo.routes.js
│   ├── announcement.mongo.routes.js
│   ├── attendance.mongo.routes.js
│   ├── auth.mongo.routes.js
│   ├── bulk-student.mongo.routes.js
│   ├── council.mongo.routes.js
│   ├── exam.mongo.routes.js
│   ├── faculty.mongo.routes.js
│   ├── meeting.mongo.routes.js
│   ├── notification.mongo.routes.js
│   ├── quiz.mongo.routes.js
│   ├── reportcard.mongo.routes.js
│   ├── student.mongo.routes.js
│   ├── timetable-generator.mongo.routes.js
│   └── timetable.mongo.routes.js
│
├── services/             # Business services
│   └── notificationService.js
│
├── utils/                # Utility functions
│   ├── csvParser.js
│   └── passwordGenerator.js
│
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies
├── seed-mongodb.js      # Database seeding
├── server.js            # Entry point
│
└── Documentation/
    ├── DEPLOYMENT_CHECKLIST.md
    ├── FEATURES.md
    ├── MONGODB_GUIDE.md
    ├── MVP_DOCUMENTATION.md
    ├── QUICK_REFERENCE.txt
    ├── QUICK_START.md
    ├── README.md
    ├── TROUBLESHOOTING.md
    └── UPGRADE_SUMMARY.md
```

## Key Files

### Entry Point
- **server.js** - Main application server

### Configuration
- **.env** - Environment variables (local, not in git)
- **.env.example** - Template for environment variables
- **config/db.mongo.js** - MongoDB connection setup

### Database
- **seed-mongodb.js** - Populate database with sample data
- **models/** - MongoDB schemas using Mongoose

### API
- **routes/** - Express route definitions
- **controllers/** - Business logic for routes
- **middlewares/auth.js** - JWT authentication

### Frontend
- **public/** - Static HTML, CSS, JS files
- **public/login.html** - Login page
- **public/admin/** - Admin dashboard
- **public/faculty/** - Faculty dashboard
- **public/student/** - Student dashboard

### Utilities
- **utils/csvParser.js** - CSV/Excel parsing
- **utils/passwordGenerator.js** - Secure password generation
- **services/notificationService.js** - Notification system

### Sample Data
- **sample-students.csv** - Sample student data for import
- **sample-faculty.csv** - Sample faculty data for import
- **sample-data.json** - Sample JSON data

## Documentation Files

### Essential Docs
1. **README.md** - Project overview and setup
2. **QUICK_START.md** - Quick setup guide
3. **MVP_DOCUMENTATION.md** - Complete MVP documentation

### Reference Docs
4. **FEATURES.md** - Detailed feature documentation
5. **MONGODB_GUIDE.md** - MongoDB Compass guide
6. **TROUBLESHOOTING.md** - Common issues and solutions
7. **QUICK_REFERENCE.txt** - Quick reference guide

### Deployment Docs
8. **DEPLOYMENT_CHECKLIST.md** - Production deployment guide
9. **UPGRADE_SUMMARY.md** - Upgrade history

## npm Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
```

## Environment Variables

Required in `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/acadify
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

Optional:
```env
ENABLE_EMAIL_NOTIFICATIONS=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
JITSI_DOMAIN=meet.jit.si
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
GEMINI_API_KEY=your_gemini_key
```

## API Endpoints

### Authentication
- POST `/api/auth/login`
- POST `/api/auth/register`

### Admin
- POST `/api/admin-import/import/students`
- POST `/api/admin-import/import/faculty`
- GET `/api/admin-import/template/:type`

### Timetable
- POST `/api/timetable-generator/generate`
- GET `/api/timetable-generator/`

### Meetings
- POST `/api/meetings`
- POST `/api/meetings/:id/join`
- POST `/api/meetings/:id/leave`

### Quizzes
- POST `/api/quiz`
- POST `/api/quiz/:id/submit`
- GET `/api/quiz/:id/results`

### Notifications
- GET `/api/notifications`
- GET `/api/notifications/unread-count`
- PUT `/api/notifications/:id/read`

### Report Cards
- POST `/api/reportcards/generate`
- POST `/api/reportcards/bulk-generate`

## Database Collections

1. **users** - User accounts (admin, faculty, students)
2. **students** - Student profiles
3. **exams** - Quizzes and exams
4. **examsubmissions** - Exam submissions
5. **timetables** - Class schedules
6. **meetings** - Online meetings
7. **attendances** - Attendance records
8. **notifications** - User notifications
9. **reportcards** - Student grades
10. **resources** - Learning materials
11. **submissions** - Assignment submissions

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- HTML5
- Tailwind CSS
- Vanilla JavaScript
- Font Awesome icons

### External Services
- Jitsi Meet (video conferencing)
- Cloudinary (file storage)
- Google Gemini (AI chatbot)
- Nodemailer (email notifications)

## Development Workflow

1. **Setup**: `npm install`
2. **Configure**: Copy `.env.example` to `.env` and update
3. **Seed**: `npm run seed`
4. **Start**: `npm start` or `npm run dev`
5. **Test**: Open http://localhost:3000

## Production Deployment

1. Set environment variables
2. Configure MongoDB connection
3. Set strong JWT_SECRET
4. Enable HTTPS
5. Configure email SMTP
6. Set up monitoring
7. Configure backups

---

**Version**: 2.1.0  
**Last Updated**: November 20, 2025
