# Acadify - Setup and Installation Guide

## Prerequisites
Before setting up Acadify, ensure you have the following installed:
- Node.js (version 14 or higher)
- npm (comes with Node.js)
- MySQL database (local or remote)
- Git (optional, for version control)

## Installation Steps

### 1. Clone or Download the Repository
If you have Git installed:
```bash
git clone <repository-url>
cd acadify
```

If you don't have Git, download the project files and extract them to a folder.

### 2. Install Dependencies
Navigate to the project directory and install all required dependencies:
```bash
cd acadify
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory by copying the example:
```bash
cp .env.example .env
```

Edit the `.env` file and update the following values:
- `DB_HOST`: Your MySQL database host
- `DB_USER`: Your MySQL database username
- `DB_PASSWORD`: Your MySQL database password
- `DB_NAME`: Your MySQL database name
- `JWT_SECRET`: A secure random string for JWT token signing
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `GEMINI_API_KEY`: Your Gemini API key
- `JITSI_APP_ID`: Your Jitsi App ID
- `JITSI_APP_SECRET`: Your Jitsi App Secret

### 4. Set Up the Database
Initialize the database with the schema and sample data:
```bash
npm run init-db
```

This will:
- Create all necessary tables
- Insert sample programs, semesters, and users
- Set up the initial data structure

### 5. Start the Application
To start the application in development mode:
```bash
npm run dev
```

To start the application in production mode:
```bash
npm start
```

The application will be available at `http://localhost:3000` (or your configured PORT).

## Project Structure
```
acadify/
├── config/           # Database configuration and schema files
├── controllers/      # Request handlers for different modules
├── models/           # Data models representing database entities
├── routes/           # API route definitions
├── middlewares/      # Custom middleware functions
├── utils/            # Utility functions and helper modules
├── public/           # Static files and frontend HTML/CSS/JS
│   ├── admin/        # Admin dashboard files
│   ├── faculty/      # Faculty dashboard files
│   ├── student/      # Student dashboard files
│   └── uploads/      # Uploaded files storage
└── views/            # Template files (if using a templating engine)
```

## API Endpoints
The application provides a comprehensive RESTful API. For detailed endpoint documentation, see the README.md file.

## User Roles and Credentials
The sample data includes the following users:

### Admin
- Email: admin@acadify.com
- Password: password123
- User ID: ADM001

### Faculty
- Email: smith@acadify.com
- Password: password123
- User ID: FAC001

- Email: johnson@acadify.com
- Password: password123
- User ID: FAC002

### Students
- Email: john@student.com
- Password: password123
- User ID: STU001

- Email: jane@student.com
- Password: password123
- User ID: STU002

## File Storage
The application uses Cloudinary for file storage:
- Notes and PPTs are stored in the `acadify_uploads` folder
- Assignment submissions are stored in a separate directory

## Video Meetings
Online classes and meetings are conducted using Jitsi Meet:
- Faculty can schedule meetings
- Students can join meetings for their classes
- Secure JWT tokens are used for authentication

## AI Integration
The application integrates with Gemini 2.5 Flash API:
- Students can ask academic questions
- AI provides explanations and learning assistance
- Faculty can use AI for quiz creation

## Security Features
- JWT-based authentication
- Role-based access control
- Secure password hashing with bcrypt
- Input validation with Joi
- Exam session restrictions (no copy/paste, no tab switching)

## Customization
To customize the application:
1. Modify the HTML files in the `public` directory
2. Update CSS styles in the HTML files or add separate CSS files
3. Extend the API by adding new controllers and routes
4. Modify the database schema in `config/schema.sql`

## Deployment
To deploy the application:
1. Set up a MySQL database on your hosting platform
2. Update the `.env` file with production database credentials
3. Set up Cloudinary and other API keys for production
4. Build and deploy the application using your preferred hosting platform

Popular deployment options:
- Heroku
- Vercel
- DigitalOcean
- AWS
- Google Cloud Platform

## Troubleshooting
Common issues and solutions:

### Database Connection Issues
- Verify database credentials in `.env` file
- Ensure MySQL server is running
- Check firewall settings if using a remote database

### File Upload Issues
- Verify Cloudinary credentials in `.env` file
- Check internet connection
- Ensure Cloudinary account has sufficient storage

### API Errors
- Check server logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure all dependencies are installed

### Login Issues
- Verify user credentials
- Check if user exists in the database
- Ensure JWT secret is properly configured

## Support
For issues, questions, or contributions, please:
1. Check the existing documentation
2. Review the code and comments
3. Open an issue on the repository (if available)
4. Contact the development team

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License
This project is licensed under the MIT License. See the LICENSE file for details.