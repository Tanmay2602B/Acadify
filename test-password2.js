const bcrypt = require('bcryptjs');

// Generate a new hash for 'password123'
const testPassword = 'password123';

bcrypt.genSalt(10, (err, salt) => {
  if (err) {
    console.error('Error generating salt:', err);
    return;
  }
  
  bcrypt.hash(testPassword, salt, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return;
    }
    
    console.log('Generated hash for "password123":', hash);
    
    // Compare with the hash from the database
    const dbHash = '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO';
    console.log('Database hash:', dbHash);
    
    bcrypt.compare(testPassword, dbHash, (err, result) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return;
      }
      
      console.log('Password comparison result:', result);
      if (result) {
        console.log('Password is correct!');
      } else {
        console.log('Password is incorrect!');
      }
    });
  });
});