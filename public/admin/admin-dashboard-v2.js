// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || user.role !== 'admin') {
    window.location.href = '../login.html';
}

document.getElementById('userName').textContent = user.name;

// Global variables
let allStudents = [];
let allFaculty = [];
let allPrograms = [];
let allResults = [];
let selectedFile = null;

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = '../login.html';
    }
});

// Mobile menu toggle
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
});

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.currentTarget.dataset.section;
        showSection(section);

        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.remove('sidebar-active');
        });
        e.currentTarget.classList.add('sidebar-active');

        if (window.innerWidth < 1024) {
            document.getElementById('sidebar').classList.remove('active');
        }
    });
});

// Show section
function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionName + 'Section').classList.remove('hidden');

    if (sectionName === 'dashboard') loadDashboardData();
    if (sectionName === 'students') loadStudents();
    if (sectionName === 'faculty') loadFaculty();
    if (sectionName === 'programs') {
        updateProgramCount();
        loadPrograms();
    }
    if (sectionName === 'results') loadResults();
    if (sectionName === 'reports') populateReportFilters();
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Modal functions
function showBulkUploadModal() {
    document.getElementById('bulkUploadModal').classList.remove('hidden');
}

function showAddProgramModal() {
    document.getElementById('addProgramModal').classList.remove('hidden');
}

function showAddStudentModal() {
    populateProgramFilters(); // Populate programs before showing modal
    document.getElementById('addStudentModal').classList.remove('hidden');
}

function showAddFacultyModal() {
    document.getElementById('addFacultyModal').classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const studentsRes = await fetch('/api/bulk-students/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (studentsRes.ok) {
            const data = await studentsRes.json();
            document.getElementById('totalStudents').textContent = data.students?.length || 0;
        }

        const facultyRes = await fetch('/api/admin/faculty', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (facultyRes.ok) {
            const data = await facultyRes.json();
            document.getElementById('totalFaculty').textContent = (data.faculty || data.users || []).length;
        }

        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        document.getElementById('totalPrograms').textContent = programs.length;
        document.getElementById('totalCourses').textContent = programs.reduce((sum, p) => sum + (p.semesters || 0), 0);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load students - RESTRUCTURED
async function loadStudents() {
    const tbody = document.getElementById('studentsTableBody');

    if (!tbody) {
        console.error('❌ Table body element not found!');
        return;
    }

    try {
        console.log('🔄 Loading students...');
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">Loading students...</td></tr>';

        const response = await fetch('/api/bulk-students/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        allStudents = data.students || [];

        console.log(`✅ Loaded ${allStudents.length} students from API`);

        if (allStudents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No students found</td></tr>';
            return;
        }

        // Build HTML string
        let html = '';
        for (let i = 0; i < allStudents.length; i++) {
            const s = allStudents[i];
            html += `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-user text-blue-600"></i>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${s.name || 'N/A'}</div>
                                <div class="text-sm text-gray-500">${s.roll_number || 'N/A'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${s.email || 'N/A'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            ${s.program || 'N/A'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Semester ${s.semester || 'N/A'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="viewStudentCredentials('${s.student_id || s.user_id}')" class="text-green-600 hover:text-green-900 mr-3" title="View ID & Password">
                            <i class="fas fa-key"></i>
                        </button>
                        <button onclick="editStudent('${s.student_id || s.user_id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteStudent('${s.student_id || s.user_id}')" class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }

        // Set HTML all at once
        tbody.innerHTML = html;

        // Verify
        const rowCount = tbody.querySelectorAll('tr').length;
        console.log(`✅ Displayed ${rowCount} rows in table`);

        if (rowCount !== allStudents.length) {
            console.warn(`⚠️ Mismatch: Expected ${allStudents.length} but got ${rowCount} rows`);
        }

        populateProgramFilters();
        showToast(`Loaded ${allStudents.length} students`, 'success');

    } catch (error) {
        console.error('❌ Error loading students:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Error: ${error.message}</td></tr>`;
        showToast('Failed to load students', 'error');
    }
}

// Display students - RESTRUCTURED
function displayStudents(students) {
    const tbody = document.getElementById('studentsTableBody');

    if (!tbody) {
        console.error('❌ Table body not found!');
        return;
    }

    console.log(`📋 Displaying ${students.length} students...`);

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No students found</td></tr>';
        return;
    }

    // Build HTML string
    let html = '';
    for (let i = 0; i < students.length; i++) {
        const s = students[i];
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-blue-600"></i>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${s.name || 'N/A'}</div>
                            <div class="text-sm text-gray-500">${s.roll_number || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${s.email || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        ${s.program || 'N/A'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Semester ${s.semester || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="viewStudentCredentials('${s.student_id || s.user_id}')" class="text-green-600 hover:text-green-900 mr-3" title="View ID & Password">
                        <i class="fas fa-key"></i>
                    </button>
                    <button onclick="editStudent('${s.student_id || s.user_id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteStudent('${s.student_id || s.user_id}')" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    tbody.innerHTML = html;

    const rowCount = tbody.querySelectorAll('tr').length;
    console.log(`✅ Displayed ${rowCount} rows`);
}

// Apply student filters
function applyStudentFilters() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const programFilter = document.getElementById('studentProgramFilter').value;
    const semesterFilter = document.getElementById('studentSemesterFilter').value;

    let filtered = allStudents;

    if (searchTerm) {
        filtered = filtered.filter(s =>
            s.name?.toLowerCase().includes(searchTerm) ||
            s.email?.toLowerCase().includes(searchTerm) ||
            s.roll_number?.toLowerCase().includes(searchTerm)
        );
    }

    if (programFilter) {
        filtered = filtered.filter(s => s.program === programFilter);
    }

    if (semesterFilter) {
        filtered = filtered.filter(s => s.semester === parseInt(semesterFilter));
    }

    displayStudents(filtered);
}

// Bulk upload functionality
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
    ];

    if (!validTypes.includes(file.type)) {
        showToast('Please select a valid Excel or CSV file', 'error');
        return;
    }

    selectedFile = file;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = (file.size / 1024).toFixed(2) + ' KB';
    document.getElementById('fileInfo').classList.remove('hidden');
    document.getElementById('uploadBtn').disabled = false;
}

function clearFile() {
    selectedFile = null;
    fileInput.value = '';
    document.getElementById('fileInfo').classList.add('hidden');
    document.getElementById('uploadBtn').disabled = true;
}

async function uploadBulkStudents() {
    if (!selectedFile) {
        showToast('Please select a file first', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        // Step 1: Upload and parse file
        showToast('Uploading file...', 'info');
        const response = await fetch('/api/bulk-students/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            showToast(error.message || 'Upload failed', 'error');
            return;
        }

        const data = await response.json();
        const studentsToImport = data.preview || [];

        if (studentsToImport.length === 0) {
            showToast('No valid students found in file', 'error');
            return;
        }

        // Step 2: Confirm and save students to database
        showToast(`Saving ${studentsToImport.length} students...`, 'info');
        const confirmResponse = await fetch('/api/bulk-students/confirm', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ students: studentsToImport })
        });

        if (confirmResponse.ok) {
            const result = await confirmResponse.json();

            // Log detailed results
            console.log('=== BULK UPLOAD RESULTS ===');
            console.log('Total:', result.total);
            console.log('Successful:', result.successful);
            console.log('Failed:', result.failed);

            if (result.errors && result.errors.length > 0) {
                console.log('\n❌ Failed Students:');
                result.errors.forEach((err, idx) => {
                    console.log(`${idx + 1}. Email: ${err.email}`);
                    console.log(`   Error: ${err.error}`);
                });
            }

            if (result.results && result.results.length > 0) {
                console.log('\n✅ Successfully Added:');
                result.results.forEach((student, idx) => {
                    console.log(`${idx + 1}. ${student.name} (${student.email})`);
                    console.log(`   User ID: ${student.user_id}`);
                    console.log(`   Password: ${student.password}`);
                });

                // Auto-download credentials as CSV
                downloadCredentials(result.results);
            }

            showToast(`Successfully added ${result.successful} students! ${result.failed > 0 ? `(${result.failed} failed - check console)` : 'Credentials downloaded!'}`, result.failed > 0 ? 'warning' : 'success');

            hideModal('bulkUploadModal');
            clearFile();
            loadStudents();
            loadDashboardData();
        } else {
            const error = await confirmResponse.json();
            console.error('Confirm error:', error);
            showToast(error.message || 'Failed to save students', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Error uploading file', 'error');
    }
}

// Download student credentials as CSV
function downloadCredentials(students) {
    if (!students || students.length === 0) return;

    // Create CSV content
    let csvContent = 'Name,Email,User ID,Password,Program,Semester\n';
    students.forEach(student => {
        csvContent += `"${student.name}","${student.email}","${student.user_id}","${student.password}","${student.program || ''}","${student.semester || ''}"\n`;
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-credentials-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    console.log('📥 Credentials downloaded as CSV');
}

function downloadTemplate() {
    const csvContent = 'name,email,roll_number,program,semester\n' +
        'John Doe,john@example.com,BCA001,BCA,1\n' +
        'Jane Smith,jane@example.com,BCA002,BCA,1';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Program Management
async function loadPrograms() {
    try {
        // Load from backend API
        const response = await fetch('/api/admin-enhanced/programs/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            allPrograms = data.programs || [];

            // Also save to localStorage for offline access
            localStorage.setItem('programs', JSON.stringify(allPrograms));
        } else {
            // Fallback to localStorage if API fails
            const stored = localStorage.getItem('programs');
            allPrograms = stored ? JSON.parse(stored) : [];
        }

        if (!Array.isArray(allPrograms)) {
            allPrograms = [];
        }

        displayPrograms(allPrograms);
        populateProgramFilters();
    } catch (error) {
        console.error('Error loading programs:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem('programs');
        allPrograms = stored ? JSON.parse(stored) : [];
        displayPrograms(allPrograms);
    }
}

function displayPrograms(programs) {
    const container = document.getElementById('programsList');

    if (!container) {
        return;
    }

    if (!programs || programs.length === 0) {
        container.innerHTML = `
            <div class="col-span-3 text-center py-12">
                <i class="fas fa-graduation-cap text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-xl">No programs added yet</p>
                <p class="text-gray-400 text-sm mt-2">Click "Add Program" to create your first program</p>
            </div>
        `;
        return;
    }

    // Build HTML for each program
    const programsHTML = [];
    for (let i = 0; i < programs.length; i++) {
        const program = programs[i];

        const html = `
            <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${program.name || 'Unnamed Program'}</h3>
                        <span class="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                            ${program.code || 'N/A'}
                        </span>
                    </div>
                    <button onclick="deleteProgram(${i})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                
                <div class="space-y-2 text-sm text-gray-600 mb-4">
                    <div class="flex items-center">
                        <i class="fas fa-clock w-5 text-purple-600"></i>
                        <span class="ml-2">${program.duration || 0} Years</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-layer-group w-5 text-purple-600"></i>
                        <span class="ml-2">${program.semesters || 0} Semesters</span>
                    </div>
                    ${program.department ? `
                    <div class="flex items-center">
                        <i class="fas fa-building w-5 text-purple-600"></i>
                        <span class="ml-2">${program.department}</span>
                    </div>
                    ` : ''}
                </div>
                
                ${program.description ? `
                <p class="text-sm text-gray-600 mb-4">${program.description}</p>
                ` : ''}
                
                <div class="flex gap-2">
                    <button onclick="viewProgramDetails(${i})" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition">
                        <i class="fas fa-eye mr-2"></i>View Details
                    </button>
                </div>
            </div>
        `;
        programsHTML.push(html);
    }

    container.innerHTML = programsHTML.join('');
}

document.getElementById('addProgramForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const programData = {
        name: document.getElementById('programName').value,
        code: document.getElementById('programCode').value,
        duration: parseInt(document.getElementById('programDuration').value),
        totalSemesters: parseInt(document.getElementById('programSemesters').value),
        department: document.getElementById('programDepartment').value,
        description: document.getElementById('programDescription').value,
        status: 'active'
    };

    try {
        // Save to backend
        const response = await fetch('/api/admin-enhanced/programs/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: programData.name,
                code: programData.code,
                duration: programData.duration,
                semesters: programData.totalSemesters,
                description: programData.description
            })
        });

        if (response.ok) {
            const data = await response.json();

            // Also save to localStorage
            const programs = JSON.parse(localStorage.getItem('programs') || '[]');
            programs.push(data.program || programData);
            localStorage.setItem('programs', JSON.stringify(programs));

            showToast('Program added successfully! Available in all dashboards.', 'success');
            hideModal('addProgramModal');
            document.getElementById('addProgramForm').reset();
            loadPrograms();
            loadDashboardData();
            populateProgramFilters();
        } else {
            const error = await response.json();
            showToast('Error: ' + (error.message || 'Failed to add program'), 'error');
        }
    } catch (error) {
        console.error('Error adding program:', error);
        showToast('Error adding program. Please try again.', 'error');
    }
});

async function deleteProgram(index) {
    if (!confirm('Are you sure you want to delete this program? This will affect all faculty and students using this program.')) return;

    const program = allPrograms[index];
    if (!program || !program.program_id) {
        showToast('Error: Program ID not found', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/admin-enhanced/programs/${program.program_id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showToast('Program deleted successfully! All dashboards will update.', 'success');
            loadPrograms();
            loadDashboardData();
        } else {
            const error = await response.json();
            showToast('Error: ' + (error.message || 'Failed to delete program'), 'error');
        }
    } catch (error) {
        console.error('Error deleting program:', error);
        showToast('Error deleting program. Please try again.', 'error');
    }
}

function viewProgramDetails(index) {
    const programs = JSON.parse(localStorage.getItem('programs') || '[]');
    const program = programs[index];
    alert(`Program: ${program.name}\nCode: ${program.code}\nDuration: ${program.duration} Years\nSemesters: ${program.semesters}\nDepartment: ${program.department || 'N/A'}\nDescription: ${program.description || 'N/A'}`);
}

// Results Management
function loadResults() {
    allResults = JSON.parse(localStorage.getItem('results') || '[]');
    displayPublishedResults(allResults);
    populateResultsFilters();
}

function displayPublishedResults(results) {
    const container = document.getElementById('publishedResultsList');

    if (results.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No results published yet</p>';
        return;
    }

    container.innerHTML = results.map((result, index) => `
        <div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-semibold text-gray-800">${result.program} - Semester ${result.semester}</h4>
                    <p class="text-sm text-gray-600">${result.examType} | ${result.year}</p>
                    <p class="text-xs text-gray-500 mt-1">Published: ${new Date(result.publishedAt).toLocaleDateString()}</p>
                </div>
                <button onclick="deleteResult(${index})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

document.getElementById('publishResultsForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const resultData = {
        program: document.getElementById('resultProgram').value,
        semester: document.getElementById('resultSemester').value,
        examType: document.getElementById('resultExamType').value,
        year: document.getElementById('resultYear').value,
        publishedAt: new Date().toISOString(),
        publishedBy: user.name
    };

    const results = JSON.parse(localStorage.getItem('results') || '[]');
    results.unshift(resultData);
    localStorage.setItem('results', JSON.stringify(results));

    showToast('Results published successfully!', 'success');
    document.getElementById('publishResultsForm').reset();
    loadResults();
});

function deleteResult(index) {
    if (!confirm('Are you sure you want to delete this result?')) return;

    const results = JSON.parse(localStorage.getItem('results') || '[]');
    results.splice(index, 1);
    localStorage.setItem('results', JSON.stringify(results));

    showToast('Result deleted successfully!', 'success');
    loadResults();
}

function filterResults() {
    const program = document.getElementById('resultsFilterProgram').value;
    const semester = document.getElementById('resultsFilterSemester').value;

    let filtered = allResults;

    if (program) {
        filtered = filtered.filter(r => r.program === program);
    }

    if (semester) {
        filtered = filtered.filter(r => r.semester === semester);
    }

    const container = document.getElementById('resultsTable');

    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No results found</p>';
        return;
    }

    container.innerHTML = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${filtered.map(result => `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${result.program}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Semester ${result.semester}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${result.examType}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${result.year}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(result.publishedAt).toLocaleDateString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Faculty Management
async function loadFaculty() {
    try {
        const response = await fetch('/api/admin/faculty', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            allFaculty = data.faculty || data.users || [];
            displayFaculty(allFaculty);
        } else {
            console.error('Failed to load faculty:', response.status);
            displayFaculty([]);
        }
    } catch (error) {
        console.error('Error loading faculty:', error);
        displayFaculty([]);
    }
}

function displayFaculty(faculty) {
    const tbody = document.getElementById('facultyTableBody');

    if (faculty.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No faculty found</td></tr>';
        return;
    }

    tbody.innerHTML = faculty.map(f => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-user-tie text-green-600"></i>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${f.name || 'N/A'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${f.email || 'N/A'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    ${f.department || 'N/A'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="manageSubjects('${f.user_id}')" class="text-purple-600 hover:text-purple-900 mr-3" title="Manage Subjects">
                    <i class="fas fa-book"></i>
                </button>
                <button onclick="viewFacultyCredentials('${f.faculty_id || f.user_id}')" class="text-green-600 hover:text-green-900 mr-3" title="View ID & Password">
                    <i class="fas fa-key"></i>
                </button>
                <button onclick="editFaculty('${f.user_id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteFaculty('${f.user_id}')" class="text-red-500 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Reports
function generateReport(type) {
    showToast(`Generating ${type} report...`, 'success');

    let data = [];
    let filename = '';
    let headers = [];

    switch (type) {
        case 'students':
            data = allStudents;
            filename = 'all_students_report.csv';
            headers = ['Name', 'Email', 'Roll Number', 'Program', 'Semester', 'Status'];
            break;
        case 'faculty':
            data = allFaculty;
            filename = 'all_faculty_report.csv';
            headers = ['Name', 'Email', 'Department', 'Designation'];
            break;
        case 'programs':
            data = JSON.parse(localStorage.getItem('programs') || '[]');
            filename = 'all_programs_report.csv';
            headers = ['Name', 'Code', 'Duration', 'Semesters', 'Department'];
            break;
        default:
            showToast('Report type not implemented yet', 'error');
            return;
    }

    downloadCSVReport(data, headers, filename, type);
}

function generateFilteredReport() {
    const program = document.getElementById('reportProgramFilter').value;
    const semester = document.getElementById('reportSemesterFilter').value;
    const reportType = document.getElementById('reportTypeSelect').value;

    if (!reportType) {
        showToast('Please select a report type', 'error');
        return;
    }

    let data = [];
    let filename = '';
    let headers = [];
    let filterDesc = [];

    if (program) filterDesc.push(program);
    if (semester) filterDesc.push(`Sem${semester}`);

    const filterSuffix = filterDesc.length > 0 ? '_' + filterDesc.join('_') : '';

    switch (reportType) {
        case 'students':
            data = allStudents.filter(s => {
                if (program && s.program !== program) return false;
                if (semester && s.semester !== parseInt(semester)) return false;
                return true;
            });
            filename = `students_report${filterSuffix}.csv`;
            headers = ['Name', 'Email', 'Roll Number', 'Program', 'Semester', 'Status'];
            break;

        case 'faculty':
            data = allFaculty.filter(f => {
                if (program && f.department !== program) return false;
                return true;
            });
            filename = `faculty_report${filterSuffix}.csv`;
            headers = ['Name', 'Email', 'Department', 'Designation'];
            break;

        case 'attendance':
            data = allStudents.filter(s => {
                if (program && s.program !== program) return false;
                if (semester && s.semester !== parseInt(semester)) return false;
                return true;
            });
            filename = `attendance_report${filterSuffix}.csv`;
            headers = ['Name', 'Roll Number', 'Program', 'Semester', 'Attendance %'];
            break;

        case 'results':
            const results = JSON.parse(localStorage.getItem('results') || '[]');
            data = results.filter(r => {
                if (program && r.program !== program) return false;
                if (semester && r.semester !== semester) return false;
                return true;
            });
            filename = `results_report${filterSuffix}.csv`;
            headers = ['Program', 'Semester', 'Exam Type', 'Year', 'Published Date'];
            break;

        case 'programs':
            const programs = JSON.parse(localStorage.getItem('programs') || '[]');
            data = programs.filter(p => {
                if (program && p.code !== program) return false;
                return true;
            });
            filename = `programs_report${filterSuffix}.csv`;
            headers = ['Name', 'Code', 'Duration', 'Semesters', 'Department'];
            break;
    }

    if (data.length === 0) {
        showToast('No data found for selected filters', 'error');
        return;
    }

    showToast(`Generating ${reportType} report with filters...`, 'success');
    downloadCSVReport(data, headers, filename, reportType);
}

function downloadCSVReport(data, headers, filename, type) {
    let csvContent = headers.join(',') + '\n';

    data.forEach(item => {
        let row = [];
        switch (type) {
            case 'students':
                row = [
                    item.name || '',
                    item.email || '',
                    item.roll_number || item.rollNumber || '',
                    item.program || '',
                    item.semester || '',
                    'Active'
                ];
                break;
            case 'faculty':
                row = [
                    item.name || '',
                    item.email || '',
                    item.department || 'N/A',
                    item.designation || 'N/A'
                ];
                break;
            case 'attendance':
                row = [
                    item.name || '',
                    item.roll_number || item.rollNumber || '',
                    item.program || '',
                    item.semester || '',
                    '85%' // Placeholder
                ];
                break;
            case 'results':
                row = [
                    item.program || '',
                    item.semester || '',
                    item.examType || '',
                    item.year || '',
                    new Date(item.publishedAt).toLocaleDateString()
                ];
                break;
            case 'programs':
                row = [
                    item.name || '',
                    item.code || '',
                    item.duration || '',
                    item.semesters || '',
                    item.department || ''
                ];
                break;
        }
        csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast(`Report downloaded: ${filename}`, 'success');
}

function clearReportFilters() {
    document.getElementById('reportProgramFilter').value = '';
    document.getElementById('reportSemesterFilter').value = '';
    document.getElementById('reportTypeSelect').value = '';
    showToast('Filters cleared', 'success');
}

// Export students (all)
function exportStudents() {
    const csv = 'Name,Email,Roll Number,Program,Semester,Status\n' +
        allStudents.map(s =>
            `${s.name},${s.email},${s.roll_number || s.rollNumber},${s.program},${s.semester},Active`
        ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_students_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    showToast(`Exported ${allStudents.length} students successfully!`, 'success');
}

// Export filtered students
function exportFilteredStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const programFilter = document.getElementById('studentProgramFilter').value;
    const semesterFilter = document.getElementById('studentSemesterFilter').value;

    // Apply same filters as display
    let filtered = allStudents;

    if (searchTerm) {
        filtered = filtered.filter(s =>
            s.name?.toLowerCase().includes(searchTerm) ||
            s.email?.toLowerCase().includes(searchTerm) ||
            s.roll_number?.toLowerCase().includes(searchTerm)
        );
    }

    if (programFilter) {
        filtered = filtered.filter(s => s.program === programFilter);
    }

    if (semesterFilter) {
        filtered = filtered.filter(s => s.semester === parseInt(semesterFilter));
    }

    if (filtered.length === 0) {
        showToast('No students match the current filters', 'error');
        return;
    }

    // Build filename with filters
    let filenameParts = ['students'];
    if (programFilter) filenameParts.push(programFilter);
    if (semesterFilter) filenameParts.push(`Sem${semesterFilter}`);
    if (searchTerm) filenameParts.push('filtered');
    const filename = filenameParts.join('_') + '.csv';

    // Generate CSV
    const csv = 'Name,Email,Roll Number,Program,Semester,Status\n' +
        filtered.map(s =>
            `${s.name},${s.email},${s.roll_number || s.rollNumber},${s.program},${s.semester},Active`
        ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    // Show success message with details
    let filterDesc = [];
    if (programFilter) filterDesc.push(programFilter);
    if (semesterFilter) filterDesc.push(`Semester ${semesterFilter}`);
    if (searchTerm) filterDesc.push(`Search: "${searchTerm}"`);

    const filterText = filterDesc.length > 0 ? ` (${filterDesc.join(', ')})` : '';
    showToast(`Exported ${filtered.length} students${filterText}`, 'success');
}

// Populate filters
function populateProgramFilters() {
    // Use allPrograms loaded from API
    const programs = allPrograms || [];

    const filters = [
        document.getElementById('studentProgramFilter'),
        document.getElementById('resultProgram'),
        document.getElementById('resultsFilterProgram'),
        document.getElementById('studentProgram')
    ];

    filters.forEach(filter => {
        if (filter) {
            const currentValue = filter.value;
            const options = filter.querySelectorAll('option:not(:first-child)');
            options.forEach(opt => opt.remove());

            // Add each program as an option
            programs.forEach(program => {
                const option = document.createElement('option');
                option.value = program.code;
                option.textContent = program.name || program.code;
                filter.appendChild(option);
            });

            filter.value = currentValue;
        }
    });
}

function populateResultsFilters() {
    const programs = [...new Set(allResults.map(r => r.program))];
    const filter = document.getElementById('resultsFilterProgram');

    if (filter) {
        const options = filter.querySelectorAll('option:not(:first-child)');
        options.forEach(opt => opt.remove());

        programs.forEach(program => {
            const option = document.createElement('option');
            option.value = program;
            option.textContent = program;
            filter.appendChild(option);
        });
    }
}

// Force load programs on initialization
function initializePrograms() {
    const stored = localStorage.getItem('programs');
    if (stored) {
        try {
            const programs = JSON.parse(stored);
            // Programs loaded successfully
        } catch (e) {
            console.error('Error parsing programs:', e);
        }
    }
}

// Initialize
initializePrograms();
loadDashboardData();
populateProgramFilters(); // Populate program filters on page load

// Add/Edit Student Form Handler
document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const isEditMode = form.dataset.editMode === 'true';
    const studentId = form.dataset.studentId;

    const studentData = {
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        roll_number: document.getElementById('studentRoll').value,
        program: document.getElementById('studentProgram').value,
        semester: parseInt(document.getElementById('studentSemester').value)
    };

    try {
        let response;

        if (isEditMode) {
            // Update existing student
            response = await fetch(`/api/bulk-students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(studentData)
            });
        } else {
            // Add new student
            response = await fetch('/api/bulk-students/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ students: [studentData] })
            });
        }

        if (response.ok) {
            const data = await response.json();

            // Show credentials only for new students
            if (!isEditMode && data.results && data.results.length > 0) {
                const result = data.results[0];
                alert(`Student added successfully!\n\nCredentials:\nUser ID: ${result.user_id}\nEmail: ${studentData.email}\nPassword: ${result.password}\n\nPlease save these credentials!`);
            }

            showToast(isEditMode ? 'Student updated successfully!' : 'Student added successfully!', 'success');
            hideModal('addStudentModal');
            loadStudents();
            loadDashboardData();
        } else {
            const error = await response.json();
            showToast(error.message || `Failed to ${isEditMode ? 'update' : 'add'} student`, 'error');
        }
    } catch (error) {
        console.error(`Error ${isEditMode ? 'updating' : 'adding'} student:`, error);
        showToast(`Error ${isEditMode ? 'updating' : 'adding'} student`, 'error');
    }
});

// Add/Edit Faculty Form Handler
document.getElementById('addFacultyForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const isEditMode = form.dataset.editMode === 'true';
    const userId = form.dataset.userId;

    const facultyData = {
        name: document.getElementById('facultyName').value,
        email: document.getElementById('facultyEmail').value,
        role: 'faculty',
        department: document.getElementById('facultyDepartment').value,
        designation: document.getElementById('facultyDesignation').value
    };

    try {
        let response;

        if (isEditMode) {
            // Update existing faculty
            response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(facultyData)
            });
        } else {
            // Add new faculty
            response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(facultyData)
            });
        }

        if (response.ok) {
            const data = await response.json();

            // Show credentials only for new faculty
            if (!isEditMode && data.generatedCredentials) {
                alert(`Faculty added successfully!\n\nCredentials:\nUser ID: ${data.generatedCredentials.userId}\nEmail: ${facultyData.email}\nPassword: ${data.generatedCredentials.password}\n\nPlease save these credentials!`);
            }

            showToast(isEditMode ? 'Faculty updated successfully!' : 'Faculty added successfully!', 'success');
            hideModal('addFacultyModal');
            loadFaculty();
            loadDashboardData();
        } else {
            const error = await response.json();
            showToast(error.message || `Failed to ${isEditMode ? 'update' : 'add'} faculty`, 'error');
        }
    } catch (error) {
        console.error(`Error ${isEditMode ? 'updating' : 'adding'} faculty:`, error);
        showToast(`Error ${isEditMode ? 'updating' : 'adding'} faculty`, 'error');
    }
});

// Edit Student
function editStudent(studentId) {
    const student = allStudents.find(s => s.student_id === studentId);
    if (!student) {
        showToast('Student not found', 'error');
        return;
    }

    // Populate form with student data
    document.getElementById('studentName').value = student.name || '';
    document.getElementById('studentEmail').value = student.email || '';
    document.getElementById('studentRoll').value = student.roll_number || student.rollNumber || '';
    document.getElementById('studentProgram').value = student.program || '';
    document.getElementById('studentSemester').value = student.semester || '';
    document.getElementById('studentPhone').value = student.phone || '';

    // Change form to edit mode
    const form = document.getElementById('addStudentForm');
    form.dataset.editMode = 'true';
    form.dataset.studentId = studentId;

    // Change button text
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Update Student';

    // Show modal
    showAddStudentModal();
}

// Edit Faculty
function editFaculty(userId) {
    const faculty = allFaculty.find(f => f.user_id === userId);
    if (!faculty) {
        showToast('Faculty not found', 'error');
        return;
    }

    // Populate form with faculty data
    document.getElementById('facultyName').value = faculty.name || '';
    document.getElementById('facultyEmail').value = faculty.email || '';
    document.getElementById('facultyDepartment').value = faculty.department || '';
    document.getElementById('facultyDesignation').value = faculty.designation || '';
    document.getElementById('facultyPhone').value = faculty.phone || '';

    // Change form to edit mode
    const form = document.getElementById('addFacultyForm');
    form.dataset.editMode = 'true';
    form.dataset.userId = faculty.user_id; // Use user_id (not _id) for updates

    // Change button text
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Update Faculty';

    // Show modal
    showAddFacultyModal();
}

// Delete Student
async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
        const response = await fetch(`/api/bulk-students/${studentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showToast('Student deleted successfully!', 'success');
            loadStudents();
            loadDashboardData();
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to delete student', 'error');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showToast('Error deleting student', 'error');
    }
}

// Delete Faculty
async function deleteFaculty(userId) {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showToast('Faculty deleted successfully!', 'success');
            loadFaculty();
            loadDashboardData();
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to delete faculty', 'error');
        }
    } catch (error) {
        console.error('Error deleting faculty:', error);
        showToast('Error deleting faculty', 'error');
    }
}

// Reset form when modal is closed
function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');

    // Reset forms
    if (modalId === 'addStudentModal') {
        const form = document.getElementById('addStudentForm');
        form.reset();
        delete form.dataset.editMode;
        delete form.dataset.studentId;
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Add Student';
    }

    if (modalId === 'addFacultyModal') {
        const form = document.getElementById('addFacultyForm');
        form.reset();
        delete form.dataset.editMode;
        delete form.dataset.userId;
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Add Faculty';
    }
}


// Debug function to check localStorage
function checkProgramsInStorage() {
    const programs = localStorage.getItem('programs');
    console.log('=== CHECKING PROGRAMS IN STORAGE ===');
    console.log('Raw localStorage programs:', programs);

    if (programs) {
        try {
            const parsed = JSON.parse(programs);
            console.log('Parsed programs:', parsed);
            console.log('Number of programs:', parsed.length);

            // Update count in UI
            const countElement = document.getElementById('programCount');
            if (countElement) {
                countElement.textContent = parsed.length;
            }

            // Log each program
            parsed.forEach((p, i) => {
                console.log(`Program ${i + 1}:`, p.name, '(' + p.code + ')');
            });

            // Show alert with summary
            alert(`Found ${parsed.length} programs in storage:\n\n` +
                parsed.map((p, i) => `${i + 1}. ${p.name} (${p.code})`).join('\n'));

            // Force reload display
            loadPrograms();
        } catch (e) {
            console.error('Error parsing programs:', e);
            alert('Error: Programs data is corrupted!');
        }
    } else {
        console.log('No programs in localStorage');
        alert('No programs found in storage!');
    }
    console.log('=== END CHECK ===');
}

// Update program count when section loads
function updateProgramCount() {
    const countElement = document.getElementById('programCount');
    if (countElement) {
        countElement.textContent = allPrograms.length;
    }
}

// Call on page load
window.addEventListener('load', () => {
    checkProgramsInStorage();
    updateProgramCount();
});


// Populate report filters
function populateReportFilters() {
    const programs = JSON.parse(localStorage.getItem('programs') || '[]');
    const programCodes = programs.map(p => p.code);

    const filter = document.getElementById('reportProgramFilter');
    if (filter) {
        const options = filter.querySelectorAll('option:not(:first-child)');
        options.forEach(opt => opt.remove());

        programCodes.forEach(code => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = code;
            filter.appendChild(option);
        });
    }
}


// View Student Credentials
async function viewStudentCredentials(studentId) {
    try {
        const response = await fetch('/api/admin-enhanced/students/credentials', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Student credentials data:', data); // Debug
            const student = data.credentials.find(s => s.student_id === studentId);

            if (student) {
                const passwordId = 'studentPassword_' + Date.now();
                const credentialInfo = `
                    <div style="text-align: left; padding: 20px;">
                        <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">Student Credentials</h3>
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                            <p style="margin: 8px 0;"><strong>Name:</strong> ${student.name}</p>
                            <p style="margin: 8px 0;"><strong>Student ID:</strong> ${student.student_id}</p>
                            <p style="margin: 8px 0;"><strong>Roll Number:</strong> ${student.roll_number}</p>
                            <p style="margin: 8px 0;"><strong>Email:</strong> ${student.email}</p>
                            <p style="margin: 8px 0;"><strong>Program:</strong> ${student.program}</p>
                            <p style="margin: 8px 0;"><strong>Semester:</strong> ${student.semester}</p>
                        </div>
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 2px solid #f59e0b;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="flex: 1;">
                                    <p style="margin: 8px 0;">
                                        <strong style="color: #92400e;">Password:</strong> 
                                        <span id="${passwordId}" style="font-family: monospace; font-size: 16px; color: #92400e;">••••••••</span>
                                    </p>
                                </div>
                                <button onclick="togglePassword('${passwordId}', '${student.password}')" 
                                        style="background: #f59e0b; color: white; padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; margin-left: 10px;">
                                    <i class="fas fa-eye"></i> Show
                                </button>
                            </div>
                        </div>
                        <p style="margin-top: 15px; font-size: 12px; color: #6b7280;">
                            <i class="fas fa-info-circle"></i> Keep this information secure. Student can use these credentials to login.
                        </p>
                    </div>
                `;

                // Create modal
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.innerHTML = `
                    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        ${credentialInfo}
                        <div style="padding: 0 20px 20px 20px; text-align: right;">
                            <button onclick="this.closest('.fixed').remove()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold">
                                Close
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            } else {
                showToast('Student credentials not found', 'error');
            }
        } else {
            showToast('Failed to fetch credentials', 'error');
        }
    } catch (error) {
        console.error('Error fetching credentials:', error);
        showToast('Error fetching credentials', 'error');
    }
}

// View Faculty Credentials
async function viewFacultyCredentials(facultyId) {
    try {
        const response = await fetch('/api/admin-enhanced/faculty/credentials', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Faculty credentials data:', data); // Debug
            console.log('Looking for faculty_id:', facultyId); // Debug

            // Try to find by faculty_id or user_id
            let faculty = data.credentials.find(f => f.faculty_id === facultyId);
            if (!faculty) {
                faculty = data.credentials.find(f => f.user_id === facultyId);
            }

            if (faculty) {
                const passwordId = 'facultyPassword_' + Date.now();
                const credentialInfo = `
                    <div style="text-align: left; padding: 20px;">
                        <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">Faculty Credentials</h3>
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                            <p style="margin: 8px 0;"><strong>Name:</strong> ${faculty.name}</p>
                            <p style="margin: 8px 0;"><strong>Faculty ID:</strong> ${faculty.faculty_id}</p>
                            <p style="margin: 8px 0;"><strong>Email:</strong> ${faculty.email}</p>
                            <p style="margin: 8px 0;"><strong>Department:</strong> ${faculty.department}</p>
                            <p style="margin: 8px 0;"><strong>Designation:</strong> ${faculty.designation || 'N/A'}</p>
                        </div>
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 2px solid #f59e0b;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="flex: 1;">
                                    <p style="margin: 8px 0;">
                                        <strong style="color: #92400e;">Password:</strong> 
                                        <span id="${passwordId}" style="font-family: monospace; font-size: 16px; color: #92400e;">••••••••</span>
                                    </p>
                                </div>
                                <button onclick="togglePassword('${passwordId}', '${faculty.password}')" 
                                        style="background: #f59e0b; color: white; padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; margin-left: 10px;">
                                    <i class="fas fa-eye"></i> Show
                                </button>
                            </div>
                        </div>
                        <p style="margin-top: 15px; font-size: 12px; color: #6b7280;">
                            <i class="fas fa-info-circle"></i> Keep this information secure. Faculty can use these credentials to login.
                        </p>
                    </div>
                `;

                // Create modal
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.innerHTML = `
                    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        ${credentialInfo}
                        <div style="padding: 0 20px 20px 20px; text-align: right;">
                            <button onclick="this.closest('.fixed').remove()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold">
                                Close
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            } else {
                console.error('Faculty not found. Available IDs:', data.credentials.map(f => f.faculty_id || f.user_id));
                showToast('Faculty credentials not found. Check console for details.', 'error');
            }
        } else {
            showToast('Failed to fetch credentials', 'error');
        }
    } catch (error) {
        console.error('Error fetching credentials:', error);
        showToast('Error fetching credentials', 'error');
    }
}


// Manage Subjects
let currentFacultyId = null;
let currentAssignments = [];

function manageSubjects(userId) {
    const faculty = allFaculty.find(f => f.user_id === userId);
    if (!faculty) {
        showToast('Faculty not found', 'error');
        return;
    }

    currentFacultyId = userId;
    currentAssignments = faculty.teaching_assignments || [];

    // Update modal header
    document.getElementById('subjectFacultyName').textContent = faculty.name;
    document.getElementById('subjectFacultyDept').textContent = faculty.department || 'No Department';

    // Populate program dropdown
    const programSelect = document.getElementById('assignProgram');
    programSelect.innerHTML = '<option value="">Select Program</option>';

    const programs = JSON.parse(localStorage.getItem('programs') || '[]');
    programs.forEach(p => {
        const option = document.createElement('option');
        option.value = p.code;
        option.textContent = p.name;
        programSelect.appendChild(option);
    });

    // Display current assignments
    displayAssignments();

    // Show modal
    document.getElementById('manageSubjectsModal').classList.remove('hidden');
}

function displayAssignments() {
    const container = document.getElementById('assignmentsList');

    if (currentAssignments.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No subjects assigned yet</p>';
        return;
    }

    container.innerHTML = currentAssignments.map((assignment, index) => `
        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div>
                <p class="font-semibold text-gray-800">${assignment.subject}</p>
                <p class="text-sm text-gray-600">${assignment.program} - Semester ${assignment.semester}</p>
            </div>
            <button onclick="removeAssignment(${index})" class="text-red-500 hover:text-red-700 p-2">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

document.getElementById('assignSubjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const program = document.getElementById('assignProgram').value;
    const semester = parseInt(document.getElementById('assignSemester').value);
    const subject = document.getElementById('assignSubject').value;

    // Check for duplicates
    const exists = currentAssignments.some(a =>
        a.program === program &&
        a.semester === semester &&
        a.subject.toLowerCase() === subject.toLowerCase()
    );

    if (exists) {
        showToast('This subject is already assigned for this program/semester', 'error');
        return;
    }

    currentAssignments.push({ program, semester, subject });

    // Save to backend
    await saveAssignments();

    // Reset form inputs but keep modal open
    document.getElementById('assignSubject').value = '';
});

async function removeAssignment(index) {
    if (!confirm('Remove this subject assignment?')) return;

    currentAssignments.splice(index, 1);
    await saveAssignments();
}

async function saveAssignments() {
    try {
        const response = await fetch(`/api/admin/users/${currentFacultyId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                teaching_assignments: currentAssignments
            })
        });

        if (response.ok) {
            showToast('Assignments updated successfully', 'success');
            displayAssignments();

            // Update local data
            const facultyIndex = allFaculty.findIndex(f => f.user_id === currentFacultyId);
            if (facultyIndex !== -1) {
                allFaculty[facultyIndex].teaching_assignments = currentAssignments;
            }
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to update assignments', 'error');
        }
    } catch (error) {
        console.error('Error saving assignments:', error);
        showToast('Error saving assignments', 'error');
    }
}

// Toggle password visibility
function togglePassword(elementId, password) {
    const element = document.getElementById(elementId);
    const button = event.target.closest('button');

    if (element.textContent === '••••••••') {
        // Show password
        element.textContent = password;
        button.innerHTML = '<i class="fas fa-eye-slash"></i> Hide';
    } else {
        // Hide password
        element.textContent = '••••••••';
        button.innerHTML = '<i class="fas fa-eye"></i> Show';
    }
}
