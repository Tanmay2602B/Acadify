const crypto = require('crypto');

/**
 * Generate a secure random password
 * @param {number} length - Length of password (default: 12)
 * @returns {string} - Generated password
 */
function generateSecurePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const randomBytes = crypto.randomBytes(length);
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
}

/**
 * Generate user ID based on role and timestamp
 * @param {string} role - User role (admin, faculty, student)
 * @returns {string} - Generated user ID
 */
function generateUserId(role) {
  const prefix = {
    admin: 'ADM',
    faculty: 'FAC',
    student: 'STU'
  };
  
  const timestamp = Date.now();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  
  return `${prefix[role]}-${timestamp}-${random}`;
}

module.exports = {
  generateSecurePassword,
  generateUserId
};
