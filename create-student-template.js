// Script to create a proper Excel template for student upload
const xlsx = require('xlsx');

function createStudentTemplate() {
    // Define template data with examples
    const templateData = [
        {
            name: 'John Doe',
            email: 'john.doe@example.com',
            program: 'BCA',
            semester: 3,
            roll_number: 'BCA001',
            enrollment_number: 'EN2024001',
            batch: '2024',
            section: 'A',
            phone: '1234567890',
            parent_phone: '0987654321',
            address: '123 Main St, City',
            date_of_birth: '2000-01-15',
            blood_group: 'O+'
        },
        {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            program: 'BCA',
            semester: 3,
            roll_number: 'BCA002',
            enrollment_number: 'EN2024002',
            batch: '2024',
            section: 'A',
            phone: '2345678901',
            parent_phone: '1098765432',
            address: '456 Oak Ave, Town',
            date_of_birth: '2000-03-20',
            blood_group: 'A+'
        },
        {
            name: 'Bob Wilson',
            email: 'bob.wilson@example.com',
            program: 'MCA',
            semester: 2,
            roll_number: 'MCA001',
            enrollment_number: 'EN2024003',
            batch: '2024',
            section: 'B',
            phone: '3456789012',
            parent_phone: '2109876543',
            address: '789 Pine Rd, Village',
            date_of_birth: '1999-07-10',
            blood_group: 'B+'
        }
    ];
    
    // Create workbook
    const wb = xlsx.utils.book_new();
    
    // Create worksheet from data
    const ws = xlsx.utils.json_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
        { wch: 20 }, // name
        { wch: 30 }, // email
        { wch: 10 }, // program
        { wch: 10 }, // semester
        { wch: 15 }, // roll_number
        { wch: 20 }, // enrollment_number
        { wch: 10 }, // batch
        { wch: 10 }, // section
        { wch: 15 }, // phone
        { wch: 15 }, // parent_phone
        { wch: 30 }, // address
        { wch: 15 }, // date_of_birth
        { wch: 12 }  // blood_group
    ];
    
    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(wb, ws, 'Students');
    
    // Create instructions sheet
    const instructions = [
        { Field: 'name', Required: 'YES', Format: 'Text', Example: 'John Doe', Notes: 'Full name of student' },
        { Field: 'email', Required: 'YES', Format: 'Email', Example: 'john@example.com', Notes: 'Must be unique and valid' },
        { Field: 'program', Required: 'YES', Format: 'Text', Example: 'BCA, MCA, BSc', Notes: 'Program code' },
        { Field: 'semester', Required: 'YES', Format: 'Number', Example: '1, 2, 3, 4, 5, 6', Notes: 'Just the number' },
        { Field: 'roll_number', Required: 'NO', Format: 'Text', Example: 'BCA001', Notes: 'Student roll number' },
        { Field: 'enrollment_number', Required: 'NO', Format: 'Text', Example: 'EN2024001', Notes: 'Enrollment ID' },
        { Field: 'batch', Required: 'NO', Format: 'Text', Example: '2024', Notes: 'Batch year' },
        { Field: 'section', Required: 'NO', Format: 'Text', Example: 'A, B, C', Notes: 'Section name' },
        { Field: 'phone', Required: 'NO', Format: 'Text', Example: '1234567890', Notes: 'Student phone' },
        { Field: 'parent_phone', Required: 'NO', Format: 'Text', Example: '0987654321', Notes: 'Parent contact' },
        { Field: 'address', Required: 'NO', Format: 'Text', Example: '123 Main St', Notes: 'Full address' },
        { Field: 'date_of_birth', Required: 'NO', Format: 'Date', Example: '2000-01-15', Notes: 'YYYY-MM-DD format' },
        { Field: 'blood_group', Required: 'NO', Format: 'Text', Example: 'O+, A+, B+', Notes: 'Blood group' }
    ];
    
    const wsInstructions = xlsx.utils.json_to_sheet(instructions);
    wsInstructions['!cols'] = [
        { wch: 20 },
        { wch: 10 },
        { wch: 15 },
        { wch: 25 },
        { wch: 40 }
    ];
    xlsx.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
    
    // Write file
    xlsx.writeFile(wb, 'student-upload-template.xlsx');
    
    console.log('✅ Template created: student-upload-template.xlsx');
    console.log('\nTemplate includes:');
    console.log('  - Students sheet with 3 example rows');
    console.log('  - Instructions sheet with field descriptions');
    console.log('\nRequired fields: name, email, program, semester');
    console.log('Optional fields: roll_number, enrollment_number, batch, section, phone, etc.');
}

createStudentTemplate();
