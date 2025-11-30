// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || user.role !== 'student') {
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

// Notification button
document.getElementById('notificationBtn').addEventListener('click', () => {
    loadNotifications();
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
    if (sectionName === 'timetable') loadTimetable();
    if (sectionName === 'meetings') loadMeetings();
    if (sectionName === 'quizzes') loadQuizzes();
    if (sectionName === 'grades') loadGrades();
    if (sectionName === 'resources') loadResources();
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load stats
        document.getElementById('attendanceRate').textContent = '85%';
        document.getElementById('quizzesTaken').textContent = '5';
        document.getElementById('avgScore').textContent = '78%';
        document.getElementById('meetingsCount').textContent = '12';

        // Load upcoming classes
        loadUpcomingClasses();

        // Load announcements
        loadAnnouncements();

        // Load notifications count
        loadNotificationCount();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load upcoming classes
function loadUpcomingClasses() {
    const container = document.getElementById('upcomingClasses');
    const classes = [
        { subject: 'Programming in C', time: 'Today, 10:00 AM', room: 'Room 101', faculty: 'Dr. Smith' },
        { subject: 'Mathematics', time: 'Today, 2:00 PM', room: 'Room 205', faculty: 'Prof. Johnson' },
        { subject: 'Digital Electronics', time: 'Tomorrow, 9:00 AM', room: 'Room 103', faculty: 'Dr. Williams' }
    ];

    container.innerHTML = classes.map(cls => `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div class="flex items-center">
                <div class="bg-blue-100 p-3 rounded-lg mr-4">
                    <i class="fas fa-book text-blue-600"></i>
                </div>
                <div>
                    <p class="font-semibold text-gray-800">${cls.subject}</p>
                    <p class="text-sm text-gray-600">${cls.faculty} • ${cls.room}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm font-medium text-gray-800">${cls.time}</p>
            </div>
        </div>
    `).join('');
}

// Load timetable
async function loadTimetable() {
    try {
        const response = await fetch(`/api/timetable-generator/?program=${user.program}&semester=${user.semester}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayTimetable(data.timetable?.entries || []);
        } else {
            displayTimetable([]);
        }
    } catch (error) {
        console.error('Error loading timetable:', error);
        displayTimetable([]);
    }
}

// Display timetable
function displayTimetable(entries) {
    const tbody = document.getElementById('timetableBody');

    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No timetable available</td></tr>';
        return;
    }

    tbody.innerHTML = entries.map(entry => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${entry.day}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.start_time} - ${entry.end_time}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${entry.subject}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.faculty_name || 'TBA'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.room || '-'}</td>
        </tr>
    `).join('');
}

// Load meetings
async function loadMeetings() {
    try {
        const response = await fetch('/api/meetings/student', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayMeetings(data.meetings || []);
        } else {
            displayMeetings([]);
        }
    } catch (error) {
        console.error('Error loading meetings:', error);
        displayMeetings([]);
    }
}

// Display meetings
function displayMeetings(meetings) {
    const container = document.getElementById('meetingsList');

    if (meetings.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-2">No meetings scheduled</p>';
        return;
    }

    container.innerHTML = meetings.map(meeting => `
        <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-bold text-gray-800">${meeting.title}</h3>
                    <p class="text-sm text-gray-600">${meeting.description || ''}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
            meeting.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
        }">
                    ${meeting.status}
                </span>
            </div>
            <div class="space-y-2 mb-4 text-sm">
                <div class="flex items-center text-gray-600">
                    <i class="fas fa-calendar w-5 text-gray-400"></i>
                    <span>${new Date(meeting.scheduled_time).toLocaleString()}</span>
                </div>
                <div class="flex items-center text-gray-600">
                    <i class="fas fa-clock w-5 text-gray-400"></i>
                    <span>${meeting.duration} minutes</span>
                </div>
                <div class="flex items-center text-gray-600">
                    <i class="fas fa-book w-5 text-gray-400"></i>
                    <span>${meeting.subject}</span>
                </div>
            </div>
            <button onclick="joinMeeting('${meeting.meeting_id}')" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition transform hover:scale-105">
                <i class="fas fa-video mr-2"></i>Join Meeting
            </button>
        </div>
    `).join('');
}

// Join meeting
async function joinMeeting(meetingId) {
    try {
        const response = await fetch(`/api/meetings/${meetingId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Open Jitsi meeting in new window
            window.open(data.meeting.jitsi_room_url, '_blank');
            showNotification('Joined meeting successfully', 'success');

            // Auto leave after some time (optional)
            setTimeout(() => {
                leaveMeeting(meetingId);
            }, 60000); // Leave after 1 minute for demo
        } else {
            showNotification(data.message || 'Failed to join meeting', 'error');
        }
    } catch (error) {
        console.error('Error joining meeting:', error);
        showNotification('Error joining meeting', 'error');
    }
}

// Leave meeting
async function leaveMeeting(meetingId) {
    try {
        await fetch(`/api/meetings/${meetingId}/leave`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Error leaving meeting:', error);
    }
}

// Load quizzes
async function loadQuizzes() {
    try {
        const response = await fetch('/api/exams/student/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayQuizzes(data.exams || []);
        } else {
            displayQuizzes([]);
        }
    } catch (error) {
        console.error('Error loading quizzes:', error);
        displayQuizzes([]);
    }
}

// Display quizzes
function displayQuizzes(quizzes) {
    const container = document.getElementById('quizzesList');

    if (quizzes.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-2">No quizzes available</p>';
        return;
    }

    container.innerHTML = quizzes.map(quiz => `
        <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-bold text-gray-800">${quiz.title}</h3>
                    <p class="text-sm text-gray-600">${quiz.description || ''}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    ${quiz.total_marks} marks
                </span>
            </div>
            <div class="space-y-2 mb-4 text-sm">
                <div class="flex items-center text-gray-600">
                    <i class="fas fa-question-circle w-5 text-gray-400"></i>
                    <span>${quiz.questions?.length || 0} questions</span>
                </div>
                <div class="flex items-center text-gray-600">
                    <i class="fas fa-clock w-5 text-gray-400"></i>
                    <span>${quiz.duration} minutes</span>
                </div>
                <div class="flex items-center text-gray-600">
                    <i class="fas fa-book w-5 text-gray-400"></i>
                    <span>${quiz.subject}</span>
                </div>
            </div>
            <button onclick="takeQuiz('${quiz.exam_id}')" class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition transform hover:scale-105">
                <i class="fas fa-play mr-2"></i>Take Quiz
            </button>
        </div>
    `).join('');
}

// Take quiz
function takeQuiz(quizId) {
    window.location.href = `take-quiz.html?id=${quizId}`;
}

// Load grades
async function loadGrades() {
    try {
        const response = await fetch(`/api/reportcards/student?student_id=${user.user_id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayGrades(data.reportCards || []);
        } else {
            displayGrades([]);
        }
    } catch (error) {
        console.error('Error loading grades:', error);
        displayGrades([]);
    }
}

// Display grades
function displayGrades(reportCards) {
    const container = document.getElementById('reportCard');

    if (reportCards.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No report cards available</p>';
        return;
    }

    const latest = reportCards[0];
    const isRecent = (new Date() - new Date(latest.generated_at)) < (7 * 24 * 60 * 60 * 1000); // 7 days

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <div>
                ${isRecent ? '<span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full mb-2 inline-block">RECENTLY PUBLISHED</span>' : ''}
                <h4 class="text-lg font-semibold text-gray-800">${latest.semester} Semester Report Card</h4>
                <p class="text-sm text-gray-500">Academic Year: ${latest.academic_year}</p>
            </div>
            <button onclick="downloadReportCardPDF()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center">
                <i class="fas fa-download mr-2"></i>Download PDF
            </button>
        </div>

        <div id="reportCardContent" class="bg-white p-4 border border-gray-200 rounded-lg">
            <div class="text-center mb-6 border-b border-gray-200 pb-4">
                <h2 class="text-2xl font-bold text-gray-800">Acadify University</h2>
                <p class="text-gray-600">Official Grade Card</p>
                <div class="mt-4 flex justify-between text-sm text-left">
                    <div>
                        <p><span class="font-semibold">Name:</span> ${user.name}</p>
                        <p><span class="font-semibold">Program:</span> ${latest.program}</p>
                    </div>
                    <div class="text-right">
                        <p><span class="font-semibold">Roll No:</span> ${user.roll_number || 'N/A'}</p>
                        <p><span class="font-semibold">Semester:</span> ${latest.semester}</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-blue-50 rounded-lg p-4 text-center">
                    <p class="text-sm text-blue-800 font-semibold">SGPA</p>
                    <p class="text-3xl font-bold text-blue-600 mt-2">${latest.sgpa?.toFixed(2) || 'N/A'}</p>
                </div>
                <div class="bg-green-50 rounded-lg p-4 text-center">
                    <p class="text-sm text-green-800 font-semibold">Percentage</p>
                    <p class="text-3xl font-bold text-green-600 mt-2">${latest.percentage?.toFixed(2) || 'N/A'}%</p>
                </div>
                <div class="bg-purple-50 rounded-lg p-4 text-center">
                    <p class="text-sm text-purple-800 font-semibold">Attendance</p>
                    <p class="text-3xl font-bold text-purple-600 mt-2">${latest.attendance_percentage?.toFixed(0) || 'N/A'}%</p>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full border border-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">Subject</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-b">Marks</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-b">Grade</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-b">Credits</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        ${latest.subjects?.map(sub => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">${sub.subject}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center border-r">${sub.total_marks}/${sub.max_marks}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-center border-r">
                                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${sub.grade === 'A+' || sub.grade === 'A' ? 'bg-green-100 text-green-800' :
            sub.grade === 'B+' || sub.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
        }">
                                        ${sub.grade}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">${sub.credits}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No subjects</td></tr>'}
                    </tbody>
                </table>
            </div>
            
            <div class="mt-6 text-center text-xs text-gray-400">
                <p>Generated on ${new Date().toLocaleDateString()}</p>
                <p>This is a computer-generated document and does not require a signature.</p>
            </div>
        </div>
    `;
}

// Download PDF
function downloadReportCardPDF() {
    const element = document.getElementById('reportCardContent');
    const opt = {
        margin: 0.5,
        filename: `ReportCard_${user.name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Show toast
    showNotification('Generating PDF...', 'info');

    html2pdf().set(opt).from(element).save().then(() => {
        showNotification('PDF Downloaded Successfully', 'success');
    }).catch(err => {
        console.error('PDF Error:', err);
        showNotification('Failed to generate PDF', 'error');
    });
}

// Load resources
let allResources = [];
let currentResourceFilter = 'all';

async function loadResources() {
    try {
        const response = await fetch('/api/resources/student', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            allResources = data.resources || [];
            displayResources(allResources);
        } else {
            const container = document.getElementById('resourcesList');
            container.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-3">No resources available</p>';
        }
    } catch (error) {
        console.error('Error loading resources:', error);
        const container = document.getElementById('resourcesList');
        container.innerHTML = '<p class="text-red-500 text-center py-8 col-span-3">Error loading resources</p>';
    }
}

function displayResources(resources) {
    const container = document.getElementById('resourcesList');

    if (resources.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-3">No resources available</p>';
        return;
    }

    const typeIcons = {
        notes: 'fa-file-alt',
        ppt: 'fa-file-powerpoint',
        assignment: 'fa-tasks',
        reference: 'fa-book',
        Slides: 'fa-file-powerpoint',
        Notes: 'fa-file-alt',
        Video: 'fa-video',
        Other: 'fa-file'
    };

    const typeColors = {
        notes: 'bg-blue-100 text-blue-800',
        ppt: 'bg-orange-100 text-orange-800',
        assignment: 'bg-green-100 text-green-800',
        reference: 'bg-purple-100 text-purple-800',
        Slides: 'bg-orange-100 text-orange-800',
        Notes: 'bg-blue-100 text-blue-800',
        Video: 'bg-red-100 text-red-800',
        Other: 'bg-gray-100 text-gray-800'
    };

    container.innerHTML = resources.map(resource => {
        const isAssignment = resource.type === 'assignment';
        const fileUrl = resource.fileUrl || resource.link;

        // Check if assignment is overdue
        let assignmentStatus = '';
        if (isAssignment && resource.dueDate) {
            const now = new Date();
            const dueDate = new Date(resource.dueDate);
            const startDate = new Date(resource.startDate);
            const isOverdue = now > dueDate;
            const isActive = now >= startDate && now <= dueDate;

            if (isOverdue) {
                assignmentStatus = '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Overdue</span>';
            } else if (isActive) {
                assignmentStatus = '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>';
            } else {
                assignmentStatus = '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Upcoming</span>';
            }
        }

        return `
            <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div class="flex items-start gap-3 mb-4">
                    <div class="w-12 h-12 rounded-lg ${typeColors[resource.type] || 'bg-gray-100'} flex items-center justify-center flex-shrink-0">
                        <i class="fas ${typeIcons[resource.type] || 'fa-file'} text-2xl"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-gray-800 mb-1">${resource.title}</h3>
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-1 text-xs font-semibold rounded-full ${typeColors[resource.type] || 'bg-gray-100 text-gray-800'}">
                                ${resource.type.toUpperCase()}
                            </span>
                            ${assignmentStatus}
                        </div>
                    </div>
                </div>
                
                ${resource.description ? `<p class="text-sm text-gray-600 mb-4">${resource.description}</p>` : ''}
                
                <div class="space-y-2 text-sm text-gray-600 mb-4">
                    <div class="flex items-center">
                        <i class="fas fa-book w-5 text-blue-600"></i>
                        <span class="ml-2">${resource.subject}</span>
                    </div>
                    ${isAssignment && resource.startDate ? `
                    <div class="flex items-center">
                        <i class="fas fa-calendar-check w-5 text-green-600"></i>
                        <span class="ml-2">Start: ${new Date(resource.startDate).toLocaleString()}</span>
                    </div>
                    ` : ''}
                    ${isAssignment && resource.dueDate ? `
                    <div class="flex items-center">
                        <i class="fas fa-calendar-times w-5 text-red-600"></i>
                        <span class="ml-2">Due: ${new Date(resource.dueDate).toLocaleString()}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="flex gap-2">
                    <a href="${fileUrl}" target="_blank" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center font-semibold transition">
                        <i class="fas fa-download mr-2"></i>${isAssignment ? 'Download' : 'Download/View'}
                    </a>
                    ${isAssignment ? `
                    <button onclick="showSubmitAssignmentModal('${resource._id}', '${resource.title}')" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition">
                        <i class="fas fa-upload mr-2"></i>Submit
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Filter resources
function filterResources(type) {
    currentResourceFilter = type.toLowerCase();

    if (type === 'all' || type === 'All') {
        displayResources(allResources);
    } else {
        const filtered = allResources.filter(r => r.type.toLowerCase() === currentResourceFilter);
        displayResources(filtered);
    }

    // Update button styles
    document.querySelectorAll('button[onclick^="filterResources"]').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });

    event.target.classList.remove('bg-gray-200', 'text-gray-700');
    event.target.classList.add('bg-blue-600', 'text-white');
}

// Load announcements
async function loadAnnouncements() {
    try {
        const response = await fetch('/api/announcements/student', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayAnnouncements(data.announcements || []);
        } else {
            displayAnnouncements([]);
        }
    } catch (error) {
        console.error('Error loading announcements:', error);
        displayAnnouncements([]);
    }
}

// Display announcements
function displayAnnouncements(announcements) {
    const container = document.getElementById('announcements');

    if (announcements.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No announcements</p>';
        return;
    }

    container.innerHTML = announcements.map(announcement => `
        <div class="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-gray-800">${announcement.title}</h4>
                <span class="text-xs text-gray-500">${new Date(announcement.createdAt).toLocaleDateString()}</span>
            </div>
            <p class="text-gray-700 text-sm">${announcement.message}</p>
            ${announcement.priority === 'high' ? '<span class="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">Important</span>' : ''}
        </div>
    `).join('');
}

// Load notifications
async function loadNotifications() {
    try {
        const response = await fetch('/api/notifications', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayNotificationsModal(data.notifications || []);
        } else {
            showNotification('Failed to load notifications', 'error');
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        showNotification('Error loading notifications', 'error');
    }
}

// Display notifications in a modal
function displayNotificationsModal(notifications) {
    if (notifications.length === 0) {
        showNotification('No notifications', 'info');
        return;
    }

    // Check if there are unread notifications
    const hasUnread = notifications.some(n => !n.read);

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.id = 'notificationModal';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-2xl font-bold text-gray-800">Notifications</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            ${hasUnread ? `
            <div class="mb-4">
                <button onclick="markAllNotificationsAsRead()" class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition">
                    <i class="fas fa-check-double mr-2"></i>Mark All as Read
                </button>
            </div>
            ` : ''}
            <div id="notificationsList" class="space-y-3">
                ${notifications.map(notif => `
                    <div class="border-l-4 ${notif.read ? 'border-gray-300 bg-gray-50' : 'border-blue-500 bg-blue-50'} p-4 rounded-r-lg">
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="font-semibold text-gray-800">${notif.title || 'Notification'}</h4>
                            <span class="text-xs text-gray-500">${new Date(notif.createdAt).toLocaleString()}</span>
                        </div>
                        <p class="text-gray-700 text-sm">${notif.message}</p>
                        ${!notif.read ? '<span class="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">New</span>' : ''}
                    </div>
                `).join('')}
            </div>
            <button onclick="this.closest('.fixed').remove()" class="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

// Mark all notifications as read
async function markAllNotificationsAsRead() {
    try {
        const response = await fetch('/api/notifications/read-all', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showNotification('All notifications marked as read', 'success');

            // Close and reopen modal to refresh
            const modal = document.getElementById('notificationModal');
            if (modal) {
                modal.remove();
            }

            // Reload notifications
            loadNotifications();

            // Update notification count
            loadNotificationCount();
        } else {
            showNotification('Failed to mark notifications as read', 'error');
        }
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        showNotification('Error marking notifications as read', 'error');
    }
}

// Load notification count
async function loadNotificationCount() {
    try {
        const response = await fetch('/api/notifications/unread-count', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const count = data.count || 0;
            const badge = document.getElementById('notifCount');
            if (count > 0) {
                badge.textContent = count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('Error loading notification count:', error);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Load initial data
loadDashboardData();

// AI Chat functionality
document.getElementById('aiForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const promptInput = document.getElementById('aiPrompt');
    const prompt = promptInput.value.trim();

    if (!prompt) return;

    // Add user message
    addMessage('user', prompt);
    promptInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    try {
        const response = await fetch('/api/ai/ask', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: prompt,
                subject: 'general',
                level: 'beginner'
            })
        });

        const data = await response.json();

        // Remove typing indicator
        removeTypingIndicator();

        if (response.ok) {
            addMessage('ai', data.response, true);
        } else {
            addMessage('ai', "I'm having trouble connecting right now. Please try again.");
            showNotification(data.message || 'AI Error', 'error');
            console.error('AI API Error:', data);
        }
    } catch (error) {
        removeTypingIndicator();
        console.error('AI Error:', error);
        addMessage('ai', "Sorry, I encountered a network error. Please check your connection.");
        showNotification('Network error', 'error');
    }
});

// Add message to chat
function addMessage(sender, text, animate = false) {
    const chatWindow = document.getElementById('chatWindow');

    // Remove welcome message if exists
    const welcome = chatWindow.querySelector('.text-center');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`;

    const bubble = document.createElement('div');
    bubble.className = `max-w-[80%] px-4 py-3 rounded-lg ${sender === 'user'
        ? 'bg-blue-600 text-white rounded-br-none'
        : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`;

    // Add proper styling for formatted content
    bubble.style.whiteSpace = 'pre-wrap';
    bubble.style.wordWrap = 'break-word';

    div.appendChild(bubble);
    chatWindow.appendChild(div);

    // Convert markdown to HTML and clean up
    let formattedText = text
        // Convert markdown headers
        .replace(/### (.*?)(<br>|$)/g, '<h4 class="font-semibold text-base mt-2 mb-1">$1</h4>')
        .replace(/## (.*?)(<br>|$)/g, '<h3 class="font-bold text-lg mt-3 mb-2">$1</h3>')
        // Convert markdown bold to HTML
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Convert markdown italic to HTML (but not in URLs or already processed)
        .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
        // Convert bullet points
        .replace(/^\* (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc ml-4 my-2">$1</ul>')
        // Convert numbered lists
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        // Convert code blocks
        .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
        // Convert inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Convert newlines to breaks
        .replace(/\n/g, '<br>')
        // Clean up multiple breaks
        .replace(/(<br>){3,}/g, '<br><br>')
        // Clean up breaks around block elements
        .replace(/<br>(<h[34]|<ul|<ol|<pre)/g, '$1')
        .replace(/(<\/h[34]>|<\/ul>|<\/ol>|<\/pre>)<br>/g, '$1');

    // For AI messages, display with proper HTML rendering (no character-by-character animation)
    // Character animation breaks HTML tags
    bubble.innerHTML = formattedText;
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Add fade-in animation instead
    if (animate && sender === 'ai') {
        bubble.style.opacity = '0';
        bubble.style.transition = 'opacity 0.5s ease-in';
        setTimeout(() => {
            bubble.style.opacity = '1';
        }, 50);
    }
}

// Show typing indicator
function showTypingIndicator() {
    const chatWindow = document.getElementById('chatWindow');
    const div = document.createElement('div');
    div.id = 'typingIndicator';
    div.className = 'flex justify-start';
    div.innerHTML = `
        <div class="bg-gray-200 px-4 py-3 rounded-lg rounded-bl-none">
            <div class="flex space-x-2">
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
        </div>
    `;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}


// Show submit assignment modal
function showSubmitAssignmentModal(resourceId, title) {
    document.getElementById('assignmentResourceId').value = resourceId;
    document.getElementById('assignmentTitle').textContent = title;
    document.getElementById('submitAssignmentModal').classList.remove('hidden');
}

// Hide submit modal
function hideSubmitModal() {
    document.getElementById('submitAssignmentModal').classList.add('hidden');
    document.getElementById('submitAssignmentForm').reset();
}

// Submit assignment
document.getElementById('submitAssignmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const resourceId = document.getElementById('assignmentResourceId').value;
    const file = document.getElementById('submissionFile').files[0];
    const comments = document.getElementById('submissionComments').value;

    console.log('=== STUDENT SUBMIT DEBUG ===');
    console.log('Resource ID:', resourceId);
    console.log('File:', file ? file.name : 'NO FILE');
    console.log('Comments:', comments);

    if (!file) {
        showNotification('Please select a file to upload', 'error');
        return;
    }

    // Check file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('resourceId', resourceId);
    formData.append('comments', comments);

    console.log('FormData created, sending to /api/assignments/submit');

    try {
        showNotification('Submitting assignment...', 'info');

        const response = await fetch('/api/assignments/submit', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        console.log('Response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', data);
            showNotification('Assignment submitted successfully!', 'success');
            hideSubmitModal();
            loadResources(); // Reload to show submission status
        } else {
            const error = await response.json();
            console.error('Error response:', error);
            showNotification(error.message || 'Failed to submit assignment', 'error');
        }
    } catch (error) {
        console.error('Error submitting assignment:', error);
        showNotification('Error submitting assignment', 'error');
    }
});

// Load user data
async function loadUserData() {
    try {
        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Update user object
            Object.assign(user, data.user);
            localStorage.setItem('user', JSON.stringify(user));

            // Update UI
            const userNameEl = document.getElementById('userName');
            if (userNameEl) userNameEl.textContent = user.name;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}
