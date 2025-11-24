/**
 * Test script for credential generator
 * Run with: node test-credentials.js
 */

const {
    generateFacultyId,
    generateFacultyPassword,
    generateStudentId,
    generateStudentPassword,
    generateRollNumber,
    generateProgramId,
    generateAssignmentId,
    generateQuizId
} = require('./utils/credentialGenerator');

console.log('='.repeat(60));
console.log('TESTING CREDENTIAL GENERATOR');
console.log('='.repeat(60));

// Test Faculty Credentials
console.log('\n📚 FACULTY CREDENTIALS:');
console.log('-'.repeat(60));

const facultyName = 'Dr. John Doe';
const facultyDOB = '1985-05-15';

const facultyId = generateFacultyId(facultyName, facultyDOB);
const facultyPassword = generateFacultyPassword(facultyName, facultyDOB);

console.log(`Name: ${facultyName}`);
console.log(`Date of Birth: ${facultyDOB}`);
console.log(`Generated Faculty ID: ${facultyId}`);
console.log(`Generated Password: ${facultyPassword}`);

// Test Student Credentials
console.log('\n🎓 STUDENT CREDENTIALS:');
console.log('-'.repeat(60));

const studentName = 'Jane Smith';
const studentProgram = 'BCA';
const studentSemester = '3';
const studentDOB = '2003-08-20';

const studentId = generateStudentId(studentName, studentProgram, studentSemester, studentDOB);
const studentPassword = generateStudentPassword(studentName, studentProgram, studentSemester);
const rollNumber = generateRollNumber(studentProgram, studentSemester, 1);

console.log(`Name: ${studentName}`);
console.log(`Program: ${studentProgram}`);
console.log(`Semester: ${studentSemester}`);
console.log(`Date of Birth: ${studentDOB}`);
console.log(`Generated Student ID: ${studentId}`);
console.log(`Generated Password: ${studentPassword}`);
console.log(`Generated Roll Number: ${rollNumber}`);

// Test Program ID
console.log('\n📖 PROGRAM ID:');
console.log('-'.repeat(60));

const programCode = 'BCA';
const programId = generateProgramId(programCode);

console.log(`Program Code: ${programCode}`);
console.log(`Generated Program ID: ${programId}`);

// Test Assignment ID
console.log('\n📝 ASSIGNMENT ID:');
console.log('-'.repeat(60));

const assignmentId = generateAssignmentId('BCA', '3');

console.log(`Program: BCA, Semester: 3`);
console.log(`Generated Assignment ID: ${assignmentId}`);

// Test Quiz ID
console.log('\n❓ QUIZ ID:');
console.log('-'.repeat(60));

const quizId = generateQuizId('MCA', '2');

console.log(`Program: MCA, Semester: 2`);
console.log(`Generated Quiz ID: ${quizId}`);

// Test Multiple Students
console.log('\n👥 MULTIPLE STUDENTS (Same Program/Semester):');
console.log('-'.repeat(60));

const students = [
    { name: 'Alice Johnson', dob: '2003-01-15' },
    { name: 'Bob Williams', dob: '2003-03-22' },
    { name: 'Charlie Brown', dob: '2003-07-10' }
];

students.forEach((student, index) => {
    const id = generateStudentId(student.name, 'BCA', '1', student.dob);
    const password = generateStudentPassword(student.name, 'BCA', '1');
    const roll = generateRollNumber('BCA', '1', index + 1);

    console.log(`\nStudent ${index + 1}:`);
    console.log(`  Name: ${student.name}`);
    console.log(`  Student ID: ${id}`);
    console.log(`  Password: ${password}`);
    console.log(`  Roll Number: ${roll}`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ ALL TESTS COMPLETED');
console.log('='.repeat(60));
