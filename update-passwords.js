const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'acadify_db',
});

const password = 'password123';

bcrypt.genSalt(10, (err, salt) => {
  if (err) {
    console.error('Error generating salt:', err);
    return;
  }
  
  bcrypt.hash(password, salt, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return;
    }
    
    console.log('Generated hash for "password123":', hash);
    
    // Connect to the database
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
      }
      
      console.log('Connected to the database');
      
      // Update all users with the new hash
      const query = 'UPDATE users SET password = ?';
      connection.query(query, [hash], (err, results) => {
        if (err) {
          console.error('Error updating passwords:', err);
          connection.end();
          return;
        }
        
        console.log('Passwords updated successfully for all users');
        connection.end();
      });
    });
  });
});