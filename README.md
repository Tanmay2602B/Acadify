# 🎓 Acadify - Learning Resource Management System

> A comprehensive, modern Learning Resource Management System with automatic features including ID/password generation, timetable creation, attendance tracking, notifications, and MCQ auto-grading.

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/yourusername/acadify)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D4.4-green.svg)](https://www.mongodb.com)

---

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based authentication with role-based access control
- Auto-generated secure passwords (12 characters)
- Bcrypt password hashing
- Protected API routes

### 📊 Admin Features
- **CSV/Excel Import**: Bulk upload students and faculty
- **Auto ID Generation**: Unique IDs for all users
- **Auto Password Generation**: Secure random passwords
- **User Management**: Create, update, delete users
- **System Analytics**: Dashboard with statistics

### 👨‍🏫 Faculty Features
- **Auto-Generated Timetable**: Smart conflict-free scheduling
- **Meeting Management**: Create meetings with Jitsi integration
- **Auto-Attendance**: Marks attendance based on meeting duration
- **MCQ Auto-Grading**: Create quizzes with automatic grading
- **Report Card Generator**: Auto-generate grades with SGPA/CGPA
- **Resource Upload**: Upload notes, PPTs, assignments
- **Notification System**: Auto-notify students

### 👨‍🎓 Student Features
- **View Timetable**: See class schedules
- **Join Meetings**: Embedded Jitsi video conferencing
- **Take Quizzes**: Auto-graded MCQ exams
- **View Grades**: Access report cards
- **Notifications**: Real-time updates
- **Submit Assignments**: Upload files

### 🤖 Automatic Features
- ✅ Auto ID/Password Generation
- ✅ Auto-Generated Timetable
- ✅ Auto-Attendance via Meeting Joins
- ✅ Auto-Notifications (In-app + Email)
- ✅ MCQ Auto-Grading
- ✅ Auto-Generated Report Cards

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/acadify.git
cd acadify

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your settings

# 4. Start MongoDB
# Windows: net start MongoDB
# macOS/Linux: sudo systemctl start mongod

# 5. Seed the database
npm run seed

# 6. Start the server
npm start
```

### Access the Application
- **URL**: http://localhost:3000
- **Login**: http://localhost:3000/login.html

### Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@acadify.com | admin123 |
| Faculty | john.smith@acadify.com | faculty123 |
| Student | alice@example.com | student123 |

---

## 📚 Documentation

### Essential Guides
- **[QUICK_START.md](QUICK_START.md)** - Quick setup guide
- **[MVP_DOCUMENTATION.md](MVP_DOCUMENTATION.md)** - Complete MVP documentation
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Project structure

### Reference Guides
- **[FEATURES.md](FEATURES.md)** - Detailed feature documentation
- **[MONGODB_GUIDE.md](MONGODB_GUIDE.md)** - MongoDB Compass guide
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[QUICK_REFERENCE.txt](QUICK_REFERENCE.txt)** - Quick reference

### Deployment
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Production deployment guide

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** - Markup
- **Tailwind CSS** - Styling
- **JavaScript** - Interactivity
- **Font Awesome** - Icons

### External Services
- **Jitsi Meet** - Video conferencing
- **Cloudinary** - File storage (optional)
- **Google Gemini** - AI chatbot (optional)
- **Nodemailer** - Email notifications (optional)

---

## 📋 API Endpoints

### Authentication
```
POST   /api/auth/login          # User login
POST   /api/auth/register       # User registration
```

### Admin - CSV Import
```
POST   /api/admin-import/import/students        # Upload CSV
POST   /api/admin-import/import/students/confirm # Save students
GET    /api/admin-import/template/:type         # Download template
```

### Timetable Generator
```
POST   /api/timetable-generator/generate  # Auto-generate timetable
GET    /api/timetable-generator/          # Get timetable
```

### Meetings (Auto-Attendance)
```
POST   /api/meetings              # Create meeting (faculty)
POST   /api/meetings/:id/join     # Join meeting (student)
POST   /api/meetings/:id/leave    # Leave meeting (auto-marks attendance)
GET    /api/meetings/faculty      # Get faculty meetings
GET    /api/meetings/student      # Get student meetings
```

### Quizzes (Auto-Grading)
```
POST   /api/quiz                  # Create quiz (faculty)
POST   /api/quiz/:id/submit       # Submit quiz (student, auto-grades)
GET    /api/quiz/:id/results      # Get results (faculty)
```

### Notifications
```
GET    /api/notifications                # Get all notifications
GET    /api/notifications/unread-count   # Get unread count
PUT    /api/notifications/:id/read       # Mark as read
PUT    /api/notifications/read-all       # Mark all as read
```

### Report Cards
```
POST   /api/reportcards/generate         # Generate report card
POST   /api/reportcards/bulk-generate    # Bulk generate
PUT    /api/reportcards/:id/publish      # Publish report card
GET    /api/reportcards/student          # Get student reports
```

---

## 🗄️ Database Collections

1. **users** - User accounts (admin, faculty, students)
2. **students** - Student profiles with details
3. **exams** - Quizzes and exams
4. **examsubmissions** - Exam submissions with grades
5. **timetables** - Class schedules
6. **meetings** - Online meetings with participants
7. **attendances** - Attendance records
8. **notifications** - User notifications
9. **reportcards** - Student grades and SGPA
10. **resources** - Learning materials
11. **submissions** - Assignment submissions

---

## 🎨 UI/UX Features

- **Glassmorphism Theme**: Blue → Purple gradients
- **Responsive Design**: Mobile-first approach
- **Touch-Friendly**: Optimized for touch devices
- **Smooth Animations**: Transitions and hover effects
- **Modern Cards**: Rounded corners with shadows
- **Notification Bell**: Real-time unread count
- **Loading States**: Spinner animations

---

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcryptjs (10 rounds)
- Role-based access control
- Auto-generated secure passwords
- Input validation and sanitization
- Protected API routes
- CORS configuration
- Environment variable protection

---

## 📦 npm Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
```

---

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/acadify

# JWT
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRE=7d

# Email (Optional)
ENABLE_EMAIL_NOTIFICATIONS=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Jitsi (Optional)
JITSI_DOMAIN=meet.jit.si

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini AI (Optional)
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🧪 Testing

### Sample Data Files
- `sample-students.csv` - 10 sample students
- `sample-faculty.csv` - 8 sample faculty
- `sample-data.json` - JSON test data

### Test CSV Import
1. Login as admin
2. Navigate to Students section
3. Click "Bulk Upload Students"
4. Upload `sample-students.csv`
5. Review preview and confirm

### Test Auto-Attendance
1. Login as faculty
2. Create a meeting
3. Login as student
4. Join the meeting
5. Stay for 30+ minutes
6. Leave meeting
7. Check attendance - should be marked automatically

### Test Auto-Grading
1. Login as faculty
2. Create a quiz with MCQ questions
3. Login as student
4. Take the quiz
5. Submit answers
6. View auto-graded results immediately

---

## 🚀 Deployment

### Production Checklist
- [ ] Set strong `JWT_SECRET`
- [ ] Configure production MongoDB URI
- [ ] Enable HTTPS
- [ ] Set up email SMTP
- [ ] Configure Cloudinary
- [ ] Set `NODE_ENV=production`
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure backups

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for detailed guide.

---

## 📊 Project Statistics

- **Models**: 11 MongoDB schemas
- **Controllers**: 11 business logic controllers
- **Routes**: 15 API route files
- **Utilities**: 3 helper modules
- **Services**: 1 notification service
- **Documentation**: 9 comprehensive guides
- **Sample Files**: 3 test data files

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Support

For support and questions:
- 📧 Email: support@acadify.com
- 📚 Documentation: See docs folder
- 🐛 Issues: Open an issue on GitHub

---

## 🎯 Roadmap

### Upcoming Features
- [ ] CSV file upload for students
- [ ] Email notifications
- [ ] PDF export for report cards
- [ ] Analytics dashboard
- [ ] Real-time notifications
- [ ] Chat system
- [ ] Mobile app
- [ ] Attendance QR codes
- [ ] Parent portal
- [ ] Fee management

---

## 🙏 Acknowledgments

- Tailwind CSS for the amazing utility-first CSS framework
- Font Awesome for the comprehensive icon library
- MongoDB for the flexible database solution
- Jitsi Meet for video conferencing
- Google Gemini for AI capabilities

---

## 📈 Version History

- **v2.1.0** (2025-11-20) - MVP with all automatic features
- **v2.0.0** (2025-11-20) - Major upgrade with enhanced UI/UX
- **v1.0.0** (2025-10-31) - Initial release

---

<div align="center">

**Made with ❤️ for Education**

[Documentation](MVP_DOCUMENTATION.md) • [Quick Start](QUICK_START.md) • [Features](FEATURES.md) • [Troubleshooting](TROUBLESHOOTING.md)

</div>
