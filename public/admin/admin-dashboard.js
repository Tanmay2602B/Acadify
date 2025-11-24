// Admin Dashboard JavaScript - Enhanced Version
// Connects to new backend APIs with auto-credential generation

// Global variables
let currentUserType = 'student';
let currentSection = 'dashboard';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeAuth();
    initializeNavigation();
    initializeModals();
    loadDashboardData();
});

// ==================== AUTHENTICATION ====================

function initializeAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || user.role !== 'admin') {
        window.location.href = '../login.html';
        return;
    }

    // Set user name
    const userName = document.getElementById('userName');
    if (userName && user.name) {
        userName.textContent = user.name;
    }

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../login.html';
}

// ==================== NAVIGATION ====================

function initializeNavigation() {
    // Sidebar navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) {
                switchSection(section);
            }
        });
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarScrim = document.getElementById('sidebarScrim');

    if (menuToggle && sidebar && sidebarScrim) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarScrim.classList.toggle('visible');
        });

        sidebarScrim.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarScrim.classList.remove('visible');
        });
    }

    // Quick action buttons
    const quickActionBtns = document.querySelectorAll('[data-section-target]');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const target = this.getAttribute('data-section-target');
            if (target) {
                switchSection(target);
            }
        });
    });
}

function switchSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Update navigation active state
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });

    // Load section data
    currentSection = sectionName;
    loadSectionData(sectionName);

    // Close mobile menu
    const sidebar = document.getElementById('sidebar');
    const sidebarScrim = document.getElementById('sidebarScrim');
    if (sidebar && sidebarScrim) {
        sidebar.classList.remove('open');
        sidebarScrim.classList.remove('visible');
    }
}

function loadSectionData(section) {
    switch (section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'faculty':
            loadFaculty();
            break;
        case 'students':
            loadStudents();
            break;
        case 'timetable':
            loadTimetable();
            break;
        case 'meetings':
            loadMeetings();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// ==================== DASHBOARD DATA ====================

async function loadDashboardData() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin-enhanced/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateDashboardStats(data);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function updateDashboardStats(data) {
    const elements = {
        totalStudents: document.getElementById('totalStudents'),
        totalFaculty: document.getElementById('totalFaculty'),
        totalPrograms: document.getElementById('totalPrograms'),
        totalCourses: document.getElementById('totalCourses')
    };

    if (elements.totalStudents) elements.totalStudents.textContent = data.totalStudents || 0;
    if (elements.totalFaculty) elements.totalFaculty.textContent = data.totalFaculty || 0;
    if (elements.totalPrograms) elements.totalPrograms.textContent = data.totalPrograms || 0;
    if (elements.totalCourses) elements.totalCourses.textContent = data.totalCourses || 0;
}

// ==================== MODAL HANDLING ====================

function initializeModals() {
    const userModal = document.getElementById('userModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelUserBtn');
    const userForm = document.getElementById('userForm');

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            userModal.classList.add('hidden');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            userModal.classList.add('hidden');
        });
    }

    if (userForm) {
        userForm.addEventListener('submit', handleUserFormSubmit);
    }
}

function openUserModal(type) {
    currentUserType = type;
    const modal = document.getElementById('userModal');
    const semesterField = document.getElementById('semesterField');
    const departmentField = document.getElementById('departmentField');
    const designationField = document.getElementById('designationField');

    // Reset form
    document.getElementById('userForm').reset();

    // Show/hide fields based on user type
    if (type === 'student') {
        if (semesterField) semesterField.classList.remove('hidden');
        if (departmentField) departmentField.classList.add('hidden');
        if (designationField) designationField.classList.add('hidden');
    } else if (type === 'faculty') {
        if (semesterField) semesterField.classList.add('hidden');
        if (departmentField) departmentField.classList.remove('hidden');
        if (designationField) designationField.classList.remove('hidden');
    }

    modal.classList.remove('hidden');
}

async function handleUserFormSubmit(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('userNameInput').value,
        email: document.getElementById('userEmailInput').value,
        dateOfBirth: document.getElementById('userDOBInput').value,
        phone: document.getElementById('userPhoneInput').value,
        program: document.getElementById('userProgramInput').value
    };

    if (currentUserType === 'student') {
        formData.semester = document.getElementById('userSemesterInput').value;
        await createStudent(formData);
    } else if (currentUserType === 'faculty') {
        formData.department = document.getElementById('userDepartmentInput').value;
        formData.designation = document.getElementById('userDesignationInput').value || 'Faculty';
        await createFaculty(formData);
    }
}

// ==================== FACULTY MANAGEMENT ====================

async function loadFaculty() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin-enhanced/faculty/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayFacultyList(data.faculty || []);
        }
    } catch (error) {
        console.error('Error loading faculty:', error);
        showNotification('Failed to load faculty list', 'error');
    }
}

function displayFacultyList(facultyList) {
    const tbody = document.getElementById('facultyTableBody');
    if (!tbody) return;

    if (facultyList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-6 text-center text-slate-400">No faculty found</td></tr>';
        return;
    }

    tbody.innerHTML = facultyList.map(faculty => `
        <tr class="hover:bg-white/5 transition">
            <td class="px-6 py-4">${faculty.name || 'N/A'}</td>
            <td class="px-6 py-4">${faculty.email || 'N/A'}</td>
            <td class="px-6 py-4">${faculty.department || 'N/A'}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(faculty.status)}">
                    ${getStatusIcon(faculty.status)} ${faculty.status || 'offline'}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="deleteFaculty('${faculty.faculty_id}')" 
                    class="text-rose-400 hover:text-rose-300 transition">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getStatusClass(status) {
    switch (status) {
        case 'online': return 'bg-emerald-500/20 text-emerald-300';
        case 'in-class': return 'bg-blue-500/20 text-blue-300';
        default: return 'bg-slate-500/20 text-slate-300';
    }
}

function getStatusIcon(status) {
    switch (status) {
        case 'online': return '🟢';
        case 'in-class': return '🔵';
        default: return '⚫';
    }
}

async function createFaculty(formData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin-enhanced/faculty/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Close modal
            document.getElementById('userModal').classList.add('hidden');

            // Show success with credentials
            showCredentialsAlert(data.credentials, 'Faculty');

            // Reload faculty list
            loadFaculty();
        } else {
            showNotification(data.message || 'Failed to create faculty', 'error');
        }
    } catch (error) {
        console.error('Error creating faculty:', error);
        showNotification('Failed to create faculty', 'error');
    }
}

async function deleteFaculty(facultyId) {
    if (!confirm('Are you sure you want to delete this faculty member?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin-enhanced/faculty/${facultyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showNotification('Faculty deleted successfully', 'success');
            loadFaculty();
        } else {
            const data = await response.json();
            showNotification(data.message || 'Failed to delete faculty', 'error');
        }
    } catch (error) {
        console.error('Error deleting faculty:', error);
        showNotification('Failed to delete faculty', 'error');
    }
}

// ==================== STUDENT MANAGEMENT ====================

async function loadStudents() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin-enhanced/students/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayStudentList(data.students || []);
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showNotification('Failed to load student list', 'error');
    }
}

function displayStudentList(studentList) {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;

    if (studentList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-6 text-center text-slate-400">No students found</td></tr>';
        return;
    }

    tbody.innerHTML = studentList.map(student => `
        <tr class="hover:bg-white/5 transition">
            <td class="px-6 py-4">${student.name || 'N/A'}</td>
            <td class="px-6 py-4">${student.email || 'N/A'}</td>
            <td class="px-6 py-4">${student.program || 'N/A'}</td>
            <td class="px-6 py-4">${student.semester || 'N/A'}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">
                    ${student.status || 'active'}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="deleteStudent('${student.student_id}')" 
                    class="text-rose-400 hover:text-rose-300 transition">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function createStudent(formData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin-enhanced/students/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Close modal
            document.getElementById('userModal').classList.add('hidden');

            // Show success with credentials
            showCredentialsAlert(data.credentials, 'Student');

            // Reload student list
            loadStudents();
        } else {
            showNotification(data.message || 'Failed to create student', 'error');
        }
    } catch (error) {
        console.error('Error creating student:', error);
        showNotification('Failed to create student', 'error');
    }
}

async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin-enhanced/students/${studentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showNotification('Student deleted successfully', 'success');
            loadStudents();
        } else {
            const data = await response.json();
            showNotification(data.message || 'Failed to delete student', 'error');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showNotification('Failed to delete student', 'error');
    }
}

// ==================== CREDENTIALS DISPLAY ====================

function showCredentialsAlert(credentials, type) {
    const message = `
✅ ${type} Created Successfully!

📋 Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${type} ID: ${credentials.student_id || credentials.faculty_id}
${credentials.roll_number ? `Roll Number: ${credentials.roll_number}\n` : ''}Password: ${credentials.password}
Email: ${credentials.email}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANT: Please save these credentials!
The password will not be shown again.

Would you like to download these credentials?
    `;

    if (confirm(message)) {
        downloadCredentials(credentials, type);
    }
}

function downloadCredentials(credentials, type) {
    const csvContent = type === 'Student'
        ? `Student ID,Roll Number,Name,Email,Password\n${credentials.student_id},${credentials.roll_number || 'N/A'},${credentials.name || 'N/A'},${credentials.email},${credentials.password}`
        : `Faculty ID,Name,Email,Password\n${credentials.faculty_id},${credentials.name || 'N/A'},${credentials.email},${credentials.password}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type.toLowerCase()}_credentials_${credentials.student_id || credentials.faculty_id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// ==================== PLACEHOLDER FUNCTIONS ====================

function loadTimetable() {
    console.log('Loading timetable...');
}

function loadMeetings() {
    console.log('Loading meetings...');
}

function loadReports() {
    console.log('Loading reports...');
}

// ==================== NOTIFICATIONS ====================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm transition-all transform translate-x-0 ${type === 'success' ? 'bg-emerald-500/90 text-white' :
            type === 'error' ? 'bg-rose-500/90 text-white' :
                'bg-indigo-500/90 text-white'
        }`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ==================== EXPORT FUNCTIONS ====================

function exportData(type) {
    console.log('Exporting data:', type);
    showNotification('Export functionality coming soon!', 'info');
}

// Make functions globally available
window.openUserModal = openUserModal;
window.deleteFaculty = deleteFaculty;
window.deleteStudent = deleteStudent;
window.exportData = exportData;
