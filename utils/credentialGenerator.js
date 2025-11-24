/**
 * Utility functions for generating user credentials
 */

/**
 * Generate Faculty ID based on name and date of birth
 * Format: FAC-YYYYMMDD-INITIALS
 * Example: FAC-19900115-JD (for John Doe born on Jan 15, 1990)
 */
function generateFacultyId(name, dateOfBirth) {
    const date = new Date(dateOfBirth);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Get initials from name
    const nameParts = name.trim().split(' ');
    const initials = nameParts.map(part => part[0].toUpperCase()).join('');

    return `FAC-${year}${month}${day}-${initials}`;
}

/**
 * Generate Faculty Password based on name and date of birth
 * Format: FirstName@DDMMYYYY
 * Example: John@15011990 (for John Doe born on Jan 15, 1990)
 */
function generateFacultyPassword(name, dateOfBirth) {
    const date = new Date(dateOfBirth);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    // Get first name
    const firstName = name.trim().split(' ')[0];

    return `${firstName}@${day}${month}${year}`;
}

/**
 * Generate Student ID based on name and class (program + semester)
 * Format: STU-PROGRAM-SEMESTER-YYYYMMDD-INITIALS
 * Example: STU-BCA-3-20050520-JS (for John Smith in BCA 3rd sem, born May 20, 2005)
 */
function generateStudentId(name, program, semester, dateOfBirth) {
    const date = new Date(dateOfBirth || Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Get initials from name
    const nameParts = name.trim().split(' ');
    const initials = nameParts.map(part => part[0].toUpperCase()).join('');

    return `STU-${program.toUpperCase()}-${semester}-${year}${month}${day}-${initials}`;
}

/**
 * Generate Student Password based on name and class
 * Format: FirstName@PROGRAM-SEM
 * Example: John@BCA-3 (for John Smith in BCA 3rd semester)
 */
function generateStudentPassword(name, program, semester) {
    // Get first name
    const firstName = name.trim().split(' ')[0];

    return `${firstName}@${program.toUpperCase()}-${semester}`;
}

/**
 * Generate Roll Number for student
 * Format: PROGRAM-YEAR-SEMESTER-SEQUENCE
 * Example: BCA-2024-3-001
 */
function generateRollNumber(program, semester, sequence = 1) {
    const year = new Date().getFullYear();
    const seqNum = String(sequence).padStart(3, '0');

    return `${program.toUpperCase()}-${year}-${semester}-${seqNum}`;
}

/**
 * Generate Program ID
 * Format: PROG-CODE-TIMESTAMP
 * Example: PROG-BCA-1732345678
 */
function generateProgramId(code) {
    const timestamp = Date.now().toString().slice(-10);
    return `PROG-${code.toUpperCase()}-${timestamp}`;
}

/**
 * Generate Assignment ID
 * Format: ASG-PROGRAM-SEM-TIMESTAMP
 * Example: ASG-BCA-3-1732345678
 */
function generateAssignmentId(program, semester) {
    const timestamp = Date.now().toString().slice(-10);
    return `ASG-${program.toUpperCase()}-${semester}-${timestamp}`;
}

/**
 * Generate Quiz ID
 * Format: QZ-PROGRAM-SEM-TIMESTAMP
 * Example: QZ-BCA-3-1732345678
 */
function generateQuizId(program, semester) {
    const timestamp = Date.now().toString().slice(-10);
    return `QZ-${program.toUpperCase()}-${semester}-${timestamp}`;
}

module.exports = {
    generateFacultyId,
    generateFacultyPassword,
    generateStudentId,
    generateStudentPassword,
    generateRollNumber,
    generateProgramId,
    generateAssignmentId,
    generateQuizId
};
