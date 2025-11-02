const bcrypt = require('bcryptjs');

// The new hashed password
const hashedPassword = '$2a$10$RdsOCAwNdpN4QhcpWABIneGn9H8KHwyMgnc05cnIdd/R.ukXfU/y6';
const testPassword = 'password123';

bcrypt.compare(testPassword, hashedPassword, (err, result) => {
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