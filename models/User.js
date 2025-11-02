const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

class User {
  // Create a new user
  static async create(userData) {
    const { name, email, role, program, semester } = userData;
    
    // Generate random password
    const password = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate user ID based on role
    let userIdPrefix = '';
    switch (role) {
      case 'admin':
        userIdPrefix = 'ADM';
        break;
      case 'faculty':
        userIdPrefix = 'FAC';
        break;
      case 'student':
        userIdPrefix = 'STU';
        break;
      default:
        userIdPrefix = 'USR';
    }
    
    const userId = userIdPrefix + Date.now().toString().slice(-6);
    
    const query = `
      INSERT INTO users (user_id, name, email, password, role, program, semester) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [userId, name, email, hashedPassword, role, program, semester];
    
    try {
      const [result] = await pool.execute(query, values);
      return { userId, password };
    } catch (error) {
      console.error('Database error in User.create:', error.message);
      throw new Error('Database connection failed. Please check your database configuration.');
    }
  }
  
  // Find user by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = ?';
      const [rows] = await pool.execute(query, [email]);
      return rows[0];
    } catch (error) {
      console.error('Database error in User.findByEmail:', error.message);
      throw new Error('Database connection failed. Please check your database configuration.');
    }
  }
  
  // Find user by ID
  static async findById(userId) {
    try {
      const query = 'SELECT * FROM users WHERE user_id = ?';
      const [rows] = await pool.execute(query, [userId]);
      return rows[0];
    } catch (error) {
      console.error('Database error in User.findById:', error.message);
      throw new Error('Database connection failed. Please check your database configuration.');
    }
  }
  
  // Compare password
  static async comparePassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }
  
  // Generate JWT token
  static generateToken(user) {
    return jwt.sign(
      { id: user.id, user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }
  
  // Get all students
  static async getAllStudents() {
    try {
      const query = 'SELECT user_id, name, email, program, semester FROM users WHERE role = "student"';
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Database error in User.getAllStudents:', error.message);
      throw new Error('Database connection failed. Please check your database configuration.');
    }
  }
  
  // Get all faculty
  static async getAllFaculty() {
    try {
      const query = 'SELECT user_id, name, email FROM users WHERE role = "faculty"';
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Database error in User.getAllFaculty:', error.message);
      throw new Error('Database connection failed. Please check your database configuration.');
    }
  }
}

module.exports = User;