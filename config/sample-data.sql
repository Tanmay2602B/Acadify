-- Sample data for Acadify LRM System

-- Insert sample programs
INSERT INTO programs (name, duration) VALUES 
('BCA', 3),
('MCA', 2),
('BBA', 3),
('MBA', 2);

-- Insert sample semesters
INSERT INTO semesters (name, program_id) VALUES 
('1st Semester', 1),
('2nd Semester', 1),
('3rd Semester', 1),
('4th Semester', 1),
('5th Semester', 1),
('6th Semester', 1),
('1st Semester', 2),
('2nd Semester', 2),
('3rd Semester', 2),
('4th Semester', 2),
('1st Semester', 3),
('2nd Semester', 3),
('3rd Semester', 3),
('4th Semester', 3),
('5th Semester', 3),
('6th Semester', 3),
('1st Semester', 4),
('2nd Semester', 4),
('3rd Semester', 4),
('4th Semester', 4);

-- Insert sample admin user
INSERT INTO users (user_id, name, email, password, role) VALUES 
('ADM001', 'Admin User', 'admin@acadify.com', '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', 'admin');

-- Insert sample faculty users
INSERT INTO users (user_id, name, email, password, role) VALUES 
('FAC001', 'Dr. Smith', 'smith@acadify.com', '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', 'faculty'),
('FAC002', 'Prof. Johnson', 'johnson@acadify.com', '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', 'faculty');

-- Insert sample student users
INSERT INTO users (user_id, name, email, password, role, program, semester) VALUES 
('STU001', 'John Doe', 'john@student.com', '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', 'student', 'BCA', '1st Semester'),
('STU002', 'Jane Smith', 'jane@student.com', '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', 'student', 'BCA', '1st Semester'),
('STU003', 'Robert Johnson', 'robert@student.com', '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', 'student', 'MCA', '1st Semester');

-- Insert sample subjects
INSERT INTO subjects (name, code, program_id, semester_id, faculty_id) VALUES 
('Introduction to Programming', 'BCA101', 1, 1, 'FAC001'),
('Mathematics', 'BCA102', 1, 1, 'FAC002'),
('Data Structures', 'BCA201', 1, 2, 'FAC001');

-- Insert sample resources
INSERT INTO resources (title, description, type, program, semester, subject_id, uploaded_by) VALUES 
('Programming Basics Notes', 'Introduction to programming concepts', 'note', 'BCA', '1st Semester', 1, 'FAC001'),
('Mathematics PPT', 'Basic mathematics for BCA students', 'ppt', 'BCA', '1st Semester', 2, 'FAC002'),
('Data Structures Assignment', 'Assignment on data structures', 'assignment', 'BCA', '2nd Semester', 3, 'FAC001');

-- Insert sample announcements
INSERT INTO announcements (title, content, program, semester, posted_by) VALUES 
('Exam Schedule', 'Final exams will be held from December 15-25', 'BCA', '1st Semester', 'ADM001'),
('Library Hours', 'Library will be open extended hours during exam week', 'BCA', '1st Semester', 'ADM001');

-- Insert sample timetable entries
INSERT INTO timetable (day, start_time, end_time, subject_id, faculty_id, program, semester, room) VALUES 
('Monday', '10:00:00', '11:00:00', 1, 'FAC001', 'BCA', '1st Semester', 'Room 201'),
('Tuesday', '14:00:00', '15:00:00', 2, 'FAC002', 'BCA', '1st Semester', 'Room 105'),
('Wednesday', '11:00:00', '12:00:00', 1, 'FAC001', 'BCA', '1st Semester', 'Room 201');

-- Insert sample student council members
INSERT INTO student_council (role, student_id, start_date, end_date) VALUES 
('President', 'STU001', '2025-10-01', '2026-09-30'),
('Vice President', 'STU002', '2025-10-01', '2026-09-30');

-- Note: Password for all users is 'password123' (hashed)