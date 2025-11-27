const xlsx = require('xlsx');

/**
 * Parse CSV/Excel file and return data
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileType - File type (csv or xlsx)
 * @returns {Array} - Parsed data
 */
function parseFile(fileBuffer, fileType) {
  try {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    return data;
  } catch (error) {
    throw new Error(`Failed to parse file: ${error.message}`);
  }
}

/**
 * Validate student data
 * @param {Array} data - Student data array
 * @returns {Object} - Validation result with valid and invalid records
 */
function validateStudentData(data) {
  const valid = [];
  const invalid = [];

  data.forEach((row, index) => {
    const errors = [];

    // Required fields
    if (!row.name || String(row.name).trim() === '') {
      errors.push('Name is required');
    }
    if (!row.email || !isValidEmail(row.email)) {
      errors.push('Valid email is required');
    }
    if (!row.program || String(row.program).trim() === '') {
      errors.push('Program is required');
    }
    if (!row.semester) {
      errors.push('Semester is required');
    }

    if (errors.length > 0) {
      invalid.push({
        row: index + 2, // +2 because Excel rows start at 1 and header is row 1
        data: row,
        errors
      });
    } else {
      valid.push(row);
    }
  });

  return { valid, invalid };
}

/**
 * Validate faculty data
 * @param {Array} data - Faculty data array
 * @returns {Object} - Validation result
 */
function validateFacultyData(data) {
  const valid = [];
  const invalid = [];

  data.forEach((row, index) => {
    const errors = [];

    if (!row.name || String(row.name).trim() === '') {
      errors.push('Name is required');
    }
    if (!row.email || !isValidEmail(row.email)) {
      errors.push('Valid email is required');
    }
    if (!row.department || String(row.department).trim() === '') {
      errors.push('Department is required');
    }

    if (errors.length > 0) {
      invalid.push({
        row: index + 2,
        data: row,
        errors
      });
    } else {
      valid.push(row);
    }
  });

  return { valid, invalid };
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} - Is valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate sample CSV template
 * @param {string} type - Type of template (student or faculty)
 * @returns {string} - CSV content
 */
function generateTemplate(type) {
  if (type === 'student') {
    return `name,email,program,semester,batch,section,phone,parent_phone,address,date_of_birth,blood_group
John Doe,john@example.com,BCA,1,2024-2027,A,1234567890,0987654321,123 Main St,2005-01-15,O+
Jane Smith,jane@example.com,BCA,1,2024-2027,A,2345678901,1098765432,456 Oak Ave,2005-03-20,A+`;
  } else if (type === 'faculty') {
    return `name,email,department,designation,phone,specialization
Dr. John Smith,drjohn@example.com,Computer Science,Professor,1234567890,Artificial Intelligence
Prof. Jane Doe,profjane@example.com,Mathematics,Associate Professor,2345678901,Applied Mathematics`;
  }

  return '';
}

module.exports = {
  parseFile,
  validateStudentData,
  validateFacultyData,
  generateTemplate
};
