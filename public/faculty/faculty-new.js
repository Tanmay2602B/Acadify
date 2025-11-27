// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || user.role !== 'faculty') {
    window.location.href = '../login.html';
}

document.getElementById('userName').textContent = user.name;

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
        
        // Update active state
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.remove('sidebar-active');
        });
        e.currentTarget.classList.add('sidebar-active');
        
        // Close mobile menu
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
    
    // Load data for section
    if (sectionName === 'dashboard') loadDashboardData();
    if (sectionName === 'students') loadStudents();
    if (sectionName === 'meetings') loadMeetings();
    if (sectionName === 'quizzes') loadQuizzes();
    if (sectionName === 'announcements') loadAnnouncements();
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load stats
        const studentsRes = await fetch('/api/bulk-students/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (studentsRes.ok) {
            const data = await studentsRes.json();
            document.getElementById('totalStudents').textContent = data.students?.length || 0;
        }
        
        const meetingsRes = await fetch('/api/meetings/faculty', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (meetingsRes.ok) {
            const data = await meetingsRes.json();
            document.getElementById('totalMeetings').textContent = data.meetings?.length || 0;
        }
        
        const quizzesRes = await fetch('/api/exams/faculty', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (quizzesRes.ok) {
            const data = await quizzesRes.json();
            document.getElementById('totalQuizzes').textContent = data.exams?.length || 0;
        }
        
        document.getElementById('totalAnnouncements').textContent = '0';
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load students
async function loadStudents() {
    try {
        const response = await fetch('/api/bulk-students/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayStudents(data.students || []);
        } else {
            displayStudents([]);
        }
    } catch (error) {
        console.error('Error loading students:', error);
        displayStudents([]);
    }
}

// Display students
function displayStudents(students) {
    const tbody = document.getElementById('studentsTableBody');
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No students found</td></tr>';
        return;
    }
    
    tbody.innerHTML = students.map(student => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-blue-600"></i>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${student.name || 'N/A'}</div>
                        <div class="text