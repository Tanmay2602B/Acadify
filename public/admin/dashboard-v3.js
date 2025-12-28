// Authentication
const token = localStorage.getItem('token');
let user = {};

try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
} catch (e) {
    console.error('Error parsing user data:', e);
}

if (!token || user.role !== 'admin') {
    window.location.href = '../login.html';
}

document.getElementById('userName').textContent = user.name || 'Admin';

// Global variables
let allStudents = [];
let allFaculty = [];
let allPrograms = [];

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = '../login.html';
    }
});

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${icons[type] || icons.info} text-xl"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        // Load students
        const studentsRes = await fetch('/api/admin/students', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (studentsRes.ok) {
            const studentsData = await studentsRes.json();
            allStudents = studentsData.students || [];
            document.getElementById('totalStudents').textContent = allStudents.length;
        }

        // Load faculty
        const facultyRes = await fetch('/api/admin/faculty', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (facultyRes.ok) {
            const facultyData = await facultyRes.json();
            allFaculty = facultyData.faculty || [];
            document.getElementById('totalFaculty').textContent = allFaculty.length;
        }

        // Load programs
        const programsRes = await fetch('/api/admin/programs', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (programsRes.ok) {
            const programsData = await programsRes.json();
            allPrograms = programsData.programs || [];
            document.getElementById('totalPrograms').textContent = allPrograms.length;
        }

        // Calculate total courses
        const totalCourses = allPrograms.reduce((sum, program) => {
            return sum + (program.courses ? program.courses.length : 0);
        }, 0);
        document.getElementById('totalCourses').textContent = totalCourses;

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

// Show Section
function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
        
        // Load section-specific data
        if (sectionName === 'students') loadStudents();
        if (sectionName === 'faculty') loadFaculty();
        if (sectionName === 'programs') loadPrograms();
        if (sectionName === 'results') loadResults();
        if (sectionName === 'reports') loadReports();
    }
}

// Load Students
async function loadStudents() {
    const section = document.getElementById('studentsSection');
    section.innerHTML = `
        <div class="animate-fade-in">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold">Student Management</h2>
                <div class="flex gap-3">
                    <button onclick="showBulkUploadModal()" class="btn bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold">
                        <i class="fas fa-file-excel mr-2"></i>Bulk Upload
                    </button>
                    <button onclick="showAddStudentModal()" class="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
                        <i class="fas fa-plus mr-2"></i>Add Student
                    </button>
                </div>
            </div>

            <div class="card p-6">
                <div class="mb-4 flex gap-4">
                    <input type="text" id="studentSearch" placeholder="Search students..." 
                        class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        style="background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color);">
                    <select id="programFilter" class="px-4 py-2 border rounded-lg"
                        style="background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color);">
                        <option value="">All Programs</option>
                    </select>
                </div>

                <div class="table-container">
                    <table class="min-w-full">
                        <thead class="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase">Student</th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase">Program</th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase">Semester</th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="studentTableBody">
                            <tr class="table-row">
                                <td colspan="5" class="px-6 py-4 text-center">
                                    <div class="spinner mx-auto"></div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Load student data
    if (allStudents.length === 0) {
        await loadDashboardData();
    }

    renderStudentTable();
}

function renderStudentTable() {
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;

    if (allStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No students found</td></tr>';
        return;
    }

    tbody.innerHTML = allStudents.map(student => `
        <tr class="table-row">
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        ${student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div class="ml-3">
                        <div class="font-medium">${student.name || 'N/A'}</div>
                        <div class="text-sm text-gray-500">${student.student_id || 'N/A'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">${student.email || 'N/A'}</td>
            <td class="px-6 py-4">${student.program || 'N/A'}</td>
            <td class="px-6 py-4">${student.semester || 'N/A'}</td>
            <td class="px-6 py-4">
                <button onclick="editStudent('${student.student_id}')" class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteStudent('${student.student_id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load Faculty
async function loadFaculty() {
    const section = document.getElementById('facultySection');
    section.innerHTML = `
        <div class="animate-fade-in">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold">Faculty Management</h2>
                <button onclick="showAddFacultyModal()" class="btn bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold">
                    <i class="fas fa-plus mr-2"></i>Add Faculty
                </button>
            </div>

            <div class="card p-6">
                <div class="table-container">
                    <table class="min-w-full">
                        <thead class="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase">Faculty</th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase">Department</th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="facultyTableBody">
                            <tr class="table-row">
                                <td colspan="4" class="px-6 py-4 text-center">
                                    <div class="spinner mx-auto"></div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    if (allFaculty.length === 0) {
        await loadDashboardData();
    }

    renderFacultyTable();
}

function renderFacultyTable() {
    const tbody = document.getElementById('facultyTableBody');
    if (!tbody) return;

    if (allFaculty.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No faculty found</td></tr>';
        return;
    }

    tbody.innerHTML = allFaculty.map(faculty => `
        <tr class="table-row">
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                        ${faculty.name ? faculty.name.charAt(0).toUpperCase() : 'F'}
                    </div>
                    <div class="ml-3">
                        <div class="font-medium">${faculty.name || 'N/A'}</div>
                        <div class="text-sm text-gray-500">${faculty.designation || 'Faculty'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">${faculty.email || 'N/A'}</td>
            <td class="px-6 py-4">${faculty.department || 'N/A'}</td>
            <td class="px-6 py-4">
                <button onclick="editFaculty('${faculty.user_id}')" class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteFaculty('${faculty.user_id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        
        // Reset forms
        if (modalId === 'addFacultyModal') {
            const form = document.getElementById('addFacultyForm');
            if (form) {
                form.reset();
                delete form.dataset.editMode;
                delete form.dataset.userId;
            }
        }
        if (modalId === 'addStudentModal') {
            const form = document.getElementById('addStudentForm');
            if (form) {
                form.reset();
                delete form.dataset.editMode;
                delete form.dataset.studentId;
            }
        }
    }
}

function showAddStudentModal() {
    const form = document.getElementById('addStudentForm');
    if (form) {
        form.reset();
        delete form.dataset.editMode;
        delete form.dataset.studentId;
    }
    showModal('addStudentModal');
}

function showAddFacultyModal() {
    const form = document.getElementById('addFacultyForm');
    if (form) {
        form.reset();
        delete form.dataset.editMode;
        delete form.dataset.userId;
    }
    showModal('addFacultyModal');
}

function showBulkUploadModal() {
    showToast('Bulk Upload feature - Coming soon', 'info');
}

// Add Faculty Form Handler
document.getElementById('addFacultyForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const isEditMode = form.dataset.editMode === 'true';
    const userId = form.dataset.userId;

    const facultyData = {
        name: document.getElementById('facultyName').value,
        email: document.getElementById('facultyEmail').value,
        role: 'faculty',
        department: document.getElementById('facultyDepartment').value,
        designation: document.getElementById('facultyDesignation').value,
        phone: document.getElementById('facultyPhone').value
    };

    try {
        let response;

        if (isEditMode) {
            response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(facultyData)
            });
        } else {
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

            if (!isEditMode && data.generatedCredentials) {
                alert(`Faculty added successfully!\n\nCredentials:\nUser ID: ${data.generatedCredentials.userId}\nEmail: ${facultyData.email}\nPassword: ${data.generatedCredentials.password}\n\nPlease save these credentials!`);
            }

            showToast(isEditMode ? 'Faculty updated successfully!' : 'Faculty added successfully!', 'success');
            hideModal('addFacultyModal');
            loadDashboardData();
            if (document.getElementById('facultySection').classList.contains('hidden') === false) {
                loadFaculty();
            }
        } else {
            const error = await response.json();
            showToast(error.message || `Failed to ${isEditMode ? 'update' : 'add'} faculty`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast(`Error ${isEditMode ? 'updating' : 'adding'} faculty`, 'error');
    }
});

// Add Student Form Handler
document.getElementById('addStudentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const isEditMode = form.dataset.editMode === 'true';
    const studentId = form.dataset.studentId;

    const studentData = {
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        role: 'student',
        program: document.getElementById('studentProgram').value,
        semester: parseInt(document.getElementById('studentSemester').value),
        phone: document.getElementById('studentPhone').value
    };

    try {
        let response;

        if (isEditMode) {
            response = await fetch(`/api/admin/students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(studentData)
            });
        } else {
            response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(studentData)
            });
        }

        if (response.ok) {
            const data = await response.json();

            if (!isEditMode && data.generatedCredentials) {
                alert(`Student added successfully!\n\nCredentials:\nUser ID: ${data.generatedCredentials.userId}\nEmail: ${studentData.email}\nPassword: ${data.generatedCredentials.password}\n\nPlease save these credentials!`);
            }

            showToast(isEditMode ? 'Student updated successfully!' : 'Student added successfully!', 'success');
            hideModal('addStudentModal');
            loadDashboardData();
            if (document.getElementById('studentsSection').classList.contains('hidden') === false) {
                loadStudents();
            }
        } else {
            const error = await response.json();
            showToast(error.message || `Failed to ${isEditMode ? 'update' : 'add'} student`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast(`Error ${isEditMode ? 'updating' : 'adding'} student`, 'error');
    }
});

function editStudent(id) {
    const student = allStudents.find(s => s.student_id === id);
    if (!student) {
        showToast('Student not found', 'error');
        return;
    }

    document.getElementById('studentName').value = student.name || '';
    document.getElementById('studentEmail').value = student.email || '';
    document.getElementById('studentProgram').value = student.program || '';
    document.getElementById('studentSemester').value = student.semester || '';
    document.getElementById('studentPhone').value = student.phone || '';

    const form = document.getElementById('addStudentForm');
    form.dataset.editMode = 'true';
    form.dataset.studentId = id;

    showModal('addStudentModal');
}

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/students/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showToast('Student deleted successfully', 'success');
            loadDashboardData();
            loadStudents();
        } else {
            showToast('Failed to delete student', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error deleting student', 'error');
    }
}

function editFaculty(id) {
    const faculty = allFaculty.find(f => f.user_id === id);
    if (!faculty) {
        showToast('Faculty not found', 'error');
        return;
    }

    document.getElementById('facultyName').value = faculty.name || '';
    document.getElementById('facultyEmail').value = faculty.email || '';
    document.getElementById('facultyDepartment').value = faculty.department || '';
    document.getElementById('facultyDesignation').value = faculty.designation || '';
    document.getElementById('facultyPhone').value = faculty.phone || '';

    const form = document.getElementById('addFacultyForm');
    form.dataset.editMode = 'true';
    form.dataset.userId = id;

    showModal('addFacultyModal');
}

async function deleteFaculty(id) {
    if (!confirm('Are you sure you want to delete this faculty member?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showToast('Faculty deleted successfully', 'success');
            loadDashboardData();
            loadFaculty();
        } else {
            showToast('Failed to delete faculty', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error deleting faculty', 'error');
    }
}

// Load Programs
async function loadPrograms() {
    const section = document.getElementById('programsSection');
    section.innerHTML = `
        <div class="animate-fade-in">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold">Program Management</h2>
                <button onclick="showAddProgramModal()" class="btn bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold">
                    <i class="fas fa-plus mr-2"></i>Add Program
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${allPrograms.length === 0 ? `
                    <div class="col-span-full card p-8 text-center">
                        <i class="fas fa-graduation-cap text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">No programs found. Add your first program!</p>
                    </div>
                ` : allPrograms.map(program => `
                    <div class="card p-6 hover:shadow-xl transition-all">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="text-xl font-bold text-purple-600">${program.name || 'N/A'}</h3>
                                <p class="text-sm text-gray-500">${program.code || 'N/A'}</p>
                            </div>
                            <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-semibold">
                                ${program.duration || 0} Years
                            </span>
                        </div>
                        <div class="space-y-2 mb-4">
                            <div class="flex items-center text-sm">
                                <i class="fas fa-book w-5 text-gray-400"></i>
                                <span class="ml-2">${program.courses?.length || 0} Courses</span>
                            </div>
                            <div class="flex items-center text-sm">
                                <i class="fas fa-users w-5 text-gray-400"></i>
                                <span class="ml-2">${program.students || 0} Students</span>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="editProgram('${program._id}')" class="flex-1 btn bg-blue-50 dark:bg-blue-900/20 text-blue-600 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40">
                                <i class="fas fa-edit mr-1"></i>Edit
                            </button>
                            <button onclick="deleteProgram('${program._id}')" class="btn bg-red-50 dark:bg-red-900/20 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Load Results
async function loadResults() {
    const section = document.getElementById('resultsSection');
    section.innerHTML = `
        <div class="animate-fade-in">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold">Publish Results</h2>
                <button onclick="showUploadResultsModal()" class="btn bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold">
                    <i class="fas fa-upload mr-2"></i>Upload Results
                </button>
            </div>

            <div class="card p-6 mb-6">
                <h3 class="text-xl font-bold mb-4">Select Criteria</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select id="resultProgram" class="px-4 py-2 border rounded-lg"
                        style="background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color);">
                        <option value="">Select Program</option>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                        <option value="BSc">BSc</option>
                    </select>
                    <select id="resultSemester" class="px-4 py-2 border rounded-lg"
                        style="background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color);">
                        <option value="">Select Semester</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                    </select>
                    <select id="resultExamType" class="px-4 py-2 border rounded-lg"
                        style="background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color);">
                        <option value="">Exam Type</option>
                        <option value="mid-term">Mid-Term</option>
                        <option value="end-term">End-Term</option>
                        <option value="internal">Internal</option>
                    </select>
                    <button onclick="loadResultsList()" class="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                        <i class="fas fa-search mr-2"></i>Search
                    </button>
                </div>
            </div>

            <div class="card p-6">
                <h3 class="text-xl font-bold mb-4">Recent Results</h3>
                <div id="resultsListContainer" class="space-y-3">
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-file-alt text-4xl mb-3"></i>
                        <p>Select criteria to view results</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load Reports
async function loadReports() {
    const section = document.getElementById('reportsSection');
    section.innerHTML = `
        <div class="animate-fade-in">
            <h2 class="text-3xl font-bold mb-6">Reports & Analytics</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="card p-6 text-center hover:shadow-xl transition-all cursor-pointer" onclick="generateReport('attendance')">
                    <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-user-check text-3xl text-blue-600"></i>
                    </div>
                    <h3 class="font-bold mb-2">Attendance Report</h3>
                    <p class="text-sm text-gray-500">View student attendance</p>
                </div>

                <div class="card p-6 text-center hover:shadow-xl transition-all cursor-pointer" onclick="generateReport('performance')">
                    <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-chart-line text-3xl text-green-600"></i>
                    </div>
                    <h3 class="font-bold mb-2">Performance Report</h3>
                    <p class="text-sm text-gray-500">Academic performance</p>
                </div>

                <div class="card p-6 text-center hover:shadow-xl transition-all cursor-pointer" onclick="generateReport('enrollment')">
                    <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-users text-3xl text-purple-600"></i>
                    </div>
                    <h3 class="font-bold mb-2">Enrollment Report</h3>
                    <p class="text-sm text-gray-500">Student enrollment data</p>
                </div>

                <div class="card p-6 text-center hover:shadow-xl transition-all cursor-pointer" onclick="generateReport('faculty')">
                    <div class="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-chalkboard-teacher text-3xl text-orange-600"></i>
                    </div>
                    <h3 class="font-bold mb-2">Faculty Report</h3>
                    <p class="text-sm text-gray-500">Faculty workload & stats</p>
                </div>
            </div>

            <div class="card p-6">
                <h3 class="text-xl font-bold mb-4">Generate Custom Report</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <select class="px-4 py-2 border rounded-lg"
                        style="background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color);">
                        <option value="">Report Type</option>
                        <option value="attendance">Attendance</option>
                        <option value="performance">Performance</option>
                        <option value="enrollment">Enrollment</option>
                        <option value="faculty">Faculty</option>
                    </select>
                    <input type="date" class="px-4 py-2 border rounded-lg"
                        style="background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color);">
                    <input type="date" class="px-4 py-2 border rounded-lg"
                        style="background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color);">
                </div>
                <button onclick="generateCustomReport()" class="btn bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg">
                    <i class="fas fa-file-download mr-2"></i>Generate Report
                </button>
            </div>
        </div>
    `;
}

// Placeholder functions for new features
function showAddProgramModal() {
    showToast('Add Program feature - Coming soon', 'info');
}

function editProgram(id) {
    showToast('Edit Program: ' + id, 'info');
}

function deleteProgram(id) {
    if (confirm('Delete this program?')) {
        showToast('Delete Program: ' + id, 'info');
    }
}

function showUploadResultsModal() {
    showToast('Upload Results feature - Coming soon', 'info');
}

function loadResultsList() {
    showToast('Loading results...', 'info');
}

function generateReport(type) {
    showToast('Generating ' + type + ' report...', 'info');
}

function generateCustomReport() {
    showToast('Generating custom report...', 'info');
}

// Initialize
loadDashboardData();
