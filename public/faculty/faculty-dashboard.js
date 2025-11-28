// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || user.role !== 'faculty') {
    window.location.href = '../login.html';
}

document.getElementById('userName').textContent = user.name;

// Global variables
let allStudents = [];
let allMeetings = [];
let allQuizzes = [];
let allAnnouncements = [];
let allResources = [];
let allPrograms = [];

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
    if (sectionName === 'resources') loadResources();
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Modal functions
function showCreateMeetingModal() {
    document.getElementById('createMeetingModal').classList.remove('hidden');
}

function showCreateAnnouncementModal() {
    document.getElementById('createAnnouncementModal').classList.remove('hidden');
}

function showCreateQuizModal() {
    // Redirect to full quiz creator page with question builder
    window.location.href = 'create-quiz.html';
}

function showUploadResourceModal() {
    console.log('Opening upload resource modal');
    const modal = document.getElementById('uploadResourceModal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error('Upload resource modal not found');
    }
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load students count
        const studentsRes = await fetch('/api/bulk-students/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (studentsRes.ok) {
            const data = await studentsRes.json();
            document.getElementById('totalStudents').textContent = data.students?.length || 0;
        }

        // Load meetings count
        const meetingsRes = await fetch('/api/meetings/faculty', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (meetingsRes.ok) {
            const data = await meetingsRes.json();
            document.getElementById('totalMeetings').textContent = data.meetings?.length || 0;
        }

        // Load quizzes count
        const quizzesRes = await fetch('/api/exams/faculty', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (quizzesRes.ok) {
            const data = await quizzesRes.json();
            document.getElementById('totalQuizzes').textContent = data.exams?.length || 0;
        }

        // Load announcements count (from localStorage for now)
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
        document.getElementById('totalAnnouncements').textContent = announcements.length;

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
            allStudents = data.students || [];
            displayStudents(allStudents);
        } else {
            allStudents = [];
            displayStudents([]);
        }
    } catch (error) {
        console.error('Error loading students:', error);
        allStudents = [];
        displayStudents([]);
    }
}

// Display students
function displayStudents(students) {
    const tbody = document.getElementById('studentsTableBody');

    // Update student count
    const countElement = document.getElementById('studentCount');
    if (countElement) {
        countElement.textContent = students.length;
    }

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No students found</td></tr>';
        return;
    }

    console.log('Displaying students:', students.length); // Debug log

    tbody.innerHTML = students.map(student => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-blue-600"></i>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${student.name || 'N/A'}</div>
                        <div class="text-sm text-gray-500">${student.roll_number || student.rollNumber || 'N/A'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${student.email || 'N/A'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    ${student.program || 'N/A'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Semester ${student.semester || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                    ${student.status || 'Active'}
                </span>
            </td>
        </tr>
    `).join('');
}

// Apply student filters
function applyStudentFilters() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const programFilter = document.getElementById('programFilter').value;
    const semesterFilter = document.getElementById('semesterFilter').value;

    let filtered = allStudents;

    if (searchTerm) {
        filtered = filtered.filter(s =>
            s.name?.toLowerCase().includes(searchTerm) ||
            s.email?.toLowerCase().includes(searchTerm) ||
            s.rollNumber?.toLowerCase().includes(searchTerm)
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

// Load meetings
async function loadMeetings() {
    try {
        console.log('Loading meetings...'); // Debug log

        const response = await fetch('/api/meetings/faculty', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Meetings loaded:', data); // Debug log
            allMeetings = data.meetings || [];
            displayMeetings(allMeetings);
        } else {
            const errorData = await response.json();
            console.error('Failed to load meetings:', errorData);
            allMeetings = [];
            displayMeetings([]);
        }
    } catch (error) {
        console.error('Error loading meetings:', error);
        allMeetings = [];
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

    console.log('Displaying meetings:', meetings); // Debug log

    container.innerHTML = meetings.map(meeting => {
        // Debug log for each meeting
        console.log('Meeting data:', {
            title: meeting.title,
            scheduled_time: meeting.scheduled_time,
            scheduledAt: meeting.scheduledAt,
            _id: meeting._id,
            meeting_id: meeting.meeting_id
        });

        // Handle both scheduled_time and scheduledAt field names
        const dateValue = meeting.scheduled_time || meeting.scheduledAt;
        const meetingDate = dateValue ? new Date(dateValue) : null;
        const isValidDate = meetingDate && !isNaN(meetingDate.getTime());
        const isUpcoming = isValidDate && meetingDate > new Date();

        // Get meeting link from various possible field names
        const baseMeetingLink = meeting.jitsi_room_url || meeting.meetingLink || meeting.meeting_link;
        const meetingId = meeting._id || meeting.meeting_id;

        // Add user info and configuration for faculty (host)
        // Note: First person to join becomes moderator automatically in Jitsi
        let meetingLink = baseMeetingLink;
        if (baseMeetingLink) {
            const url = new URL(baseMeetingLink);
            // Add user information
            url.searchParams.set('userInfo.displayName', encodeURIComponent(user.name || 'Faculty'));
            url.searchParams.set('userInfo.email', encodeURIComponent(user.email || ''));
            // Configure audio/video settings for host (no moderator role to avoid login)
            url.hash = '#config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false';
            meetingLink = url.toString();
        }

        return `
            <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-bold text-gray-800">${meeting.title}</h3>
                        <p class="text-sm text-gray-600 mt-1">${meeting.description || 'No description'}</p>
                    </div>
                    <span class="px-3 py-1 text-xs font-semibold rounded-full ${isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${isUpcoming ? 'Upcoming' : 'Past'}
                    </span>
                </div>
                
                <div class="space-y-2 text-sm text-gray-600 mb-4">
                    <div class="flex items-center">
                        <i class="fas fa-user-tie w-5 text-purple-600"></i>
                        <span class="ml-2"><strong>Host:</strong> ${meeting.faculty_name || user.name || 'You'}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-calendar-alt w-5 text-blue-600"></i>
                        <span class="ml-2">${isValidDate ? meetingDate.toLocaleDateString() : 'Date not set'}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-clock w-5 text-blue-600"></i>
                        <span class="ml-2">${isValidDate ? meetingDate.toLocaleTimeString() : 'Time not set'} (${meeting.duration || 60} min)</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-book w-5 text-blue-600"></i>
                        <span class="ml-2">${meeting.subject || 'N/A'}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-users w-5 text-blue-600"></i>
                        <span class="ml-2">${meeting.program} - Semester ${meeting.semester}</span>
                    </div>
                </div>
                
                <div class="space-y-2">
                    ${meetingLink ? `
                        <div class="flex gap-2">
                            <button onclick="startMeetingAsHost('${baseMeetingLink}', '${meeting.title}')" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center font-semibold transition">
                                <i class="fas fa-video mr-2"></i>Start Meeting
                            </button>
                            <button onclick="deleteMeeting('${meetingId}')" class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 italic">
                            <i class="fas fa-info-circle mr-1"></i>Opens in new window with host privileges
                        </p>
                    ` : `
                        <div class="flex gap-2">
                            <button onclick="generateMeetingLink('${meetingId}')" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition">
                                <i class="fas fa-link mr-2"></i>Generate Link
                            </button>
                            <button onclick="deleteMeeting('${meetingId}')" class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// Create meeting
document.getElementById('meetingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const meetingData = {
        title: document.getElementById('meetingTitle').value,
        description: document.getElementById('meetingDescription').value,
        program: document.getElementById('meetingProgram').value,
        semester: parseInt(document.getElementById('meetingSemester').value),
        subject: document.getElementById('meetingSubject').value,
        scheduled_time: document.getElementById('meetingTime').value, // Changed from scheduledAt to scheduled_time
        duration: parseInt(document.getElementById('meetingDuration').value)
    };

    console.log('Creating meeting with data:', meetingData); // Debug log

    try {
        const response = await fetch('/api/meetings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(meetingData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Meeting created:', data); // Debug log
            showToast('Meeting created successfully!', 'success');
            hideModal('createMeetingModal');
            document.getElementById('meetingForm').reset();
            loadMeetings();
            loadDashboardData();
        } else {
            const error = await response.json();
            console.error('Meeting creation failed:', error); // Debug log
            showToast(error.message || 'Failed to create meeting', 'error');
        }
    } catch (error) {
        console.error('Error creating meeting:', error);
        showToast('Error creating meeting', 'error');
    }
});

// Start meeting as host (bypasses authentication)
function startMeetingAsHost(meetingUrl, meetingTitle) {
    try {
        // Extract room name from URL
        const url = new URL(meetingUrl);
        const roomName = url.pathname.substring(1); // Remove leading slash
        const domain = url.hostname;

        // Create a new window with Jitsi meeting
        const width = 1200;
        const height = 800;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;

        // Build URL with configuration to bypass authentication
        const jitsiUrl = `https://${domain}/${roomName}#` +
            `config.startWithAudioMuted=false&` +
            `config.startWithVideoMuted=false&` +
            `config.prejoinPageEnabled=false&` +
            `config.requireDisplayName=false&` +
            `userInfo.displayName=${encodeURIComponent(user.name || 'Faculty')}&` +
            `userInfo.email=${encodeURIComponent(user.email || '')}`;

        const meetingWindow = window.open(
            jitsiUrl,
            'JitsiMeeting',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (meetingWindow) {
            meetingWindow.focus();
            showToast('Meeting opened! You are the host.', 'success');
        } else {
            showToast('Please allow popups for this site', 'error');
        }
    } catch (error) {
        console.error('Error starting meeting:', error);
        showToast('Error starting meeting', 'error');
    }
}

// Generate meeting link
async function generateMeetingLink(meetingId) {
    const meetingLink = `https://meet.google.com/${Math.random().toString(36).substring(7)}`;

    try {
        const response = await fetch(`/api/meetings/${meetingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ meetingLink })
        });

        if (response.ok) {
            showToast('Meeting link generated!', 'success');
            loadMeetings();
        } else {
            showToast('Failed to generate link', 'error');
        }
    } catch (error) {
        console.error('Error generating link:', error);
        showToast('Error generating link', 'error');
    }
}

// Delete meeting
async function deleteMeeting(meetingId) {
    if (!confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) return;

    try {
        console.log('Deleting meeting with ID:', meetingId); // Debug log

        const response = await fetch(`/api/meetings/${meetingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Delete response:', data); // Debug log

        if (response.ok) {
            showToast('Meeting deleted successfully!', 'success');
            loadMeetings();
            loadDashboardData();
        } else {
            console.error('Delete failed:', data);
            showToast(data.message || 'Failed to delete meeting', 'error');
        }
    } catch (error) {
        console.error('Error deleting meeting:', error);
        showToast('Error deleting meeting: ' + error.message, 'error');
    }
}

// Load quizzes
async function loadQuizzes() {
    try {
        const response = await fetch('/api/exams/faculty', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            allQuizzes = data.exams || [];
            displayQuizzes(allQuizzes);
            displayRecentQuestions(allQuizzes);
        } else {
            allQuizzes = [];
            displayQuizzes([]);
            displayRecentQuestions([]);
        }
    } catch (error) {
        console.error('Error loading quizzes:', error);
        allQuizzes = [];
        displayQuizzes([]);
        displayRecentQuestions([]);
    }
}

// Display recently added questions
function displayRecentQuestions(quizzes) {
    const container = document.getElementById('recentQuestionsList');

    if (!container) return;

    // Collect all questions from all quizzes with quiz info
    const allQuestions = [];
    quizzes.forEach(quiz => {
        if (quiz.questions && quiz.questions.length > 0) {
            quiz.questions.forEach(question => {
                allQuestions.push({
                    ...question,
                    quizTitle: quiz.title,
                    quizId: quiz._id || quiz.exam_id,
                    subject: quiz.subject,
                    addedAt: question.created_at || quiz.created_at
                });
            });
        }
    });

    // Sort by date (most recent first) and take top 5
    const recentQuestions = allQuestions
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        .slice(0, 5);

    if (recentQuestions.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No questions added yet</p>';
        return;
    }

    container.innerHTML = recentQuestions.map((q, index) => `
        <div class="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg hover:bg-blue-100 transition">
            <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">${q.type || 'MCQ'}</span>
                        <span class="text-xs text-gray-600">${q.marks || 1} marks</span>
                    </div>
                    <p class="font-semibold text-gray-800 text-sm mb-1">${q.question_text || q.text || 'Question ' + (index + 1)}</p>
                    <p class="text-xs text-gray-600">
                        <i class="fas fa-book mr-1"></i>${q.subject} • ${q.quizTitle}
                    </p>
                </div>
                <button onclick="addQuestions('${q.quizId}')" class="ml-2 text-blue-600 hover:text-blue-800 text-sm">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Display quizzes
function displayQuizzes(quizzes) {
    const container = document.getElementById('quizzesList');

    if (quizzes.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-2">No quizzes created yet</p>';
        return;
    }

    container.innerHTML = quizzes.map(quiz => {
        // Calculate actual total marks from questions if available
        let actualMarks = quiz.total_marks || quiz.totalMarks || 0;
        if (quiz.questions && quiz.questions.length > 0) {
            actualMarks = quiz.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
        }

        return `
        <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-bold text-gray-800">${quiz.title}</h3>
                    <p class="text-sm text-gray-600 mt-1">${quiz.description || 'No description'}</p>
                </div>
                <span class="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    ${actualMarks} marks
                </span>
            </div>
            
            <div class="space-y-2 text-sm text-gray-600 mb-4">
                <div class="flex items-center">
                    <i class="fas fa-book w-5 text-purple-600"></i>
                    <span class="ml-2">${quiz.subject || 'N/A'}</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-users w-5 text-purple-600"></i>
                    <span class="ml-2">${quiz.program} - Semester ${quiz.semester}</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-question-circle w-5 text-purple-600"></i>
                    <span class="ml-2">${quiz.questions?.length || 0} questions</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-clock w-5 text-purple-600"></i>
                    <span class="ml-2">${quiz.duration || 30} minutes</span>
                </div>
            </div>
            
            <div class="flex flex-col gap-2">
                <button onclick="addQuestions('${quiz._id || quiz.exam_id}')" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition">
                    <i class="fas fa-plus-circle mr-2"></i>Add Questions
                </button>
                <div class="flex gap-2">
                    <button onclick="viewQuizResults('${quiz._id || quiz.exam_id}')" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition">
                        <i class="fas fa-chart-bar mr-2"></i>View Results
                    </button>
                    <button onclick="deleteQuiz('${quiz._id || quiz.exam_id}')" class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Add questions to quiz
function addQuestions(quizId) {
    // Redirect to create quiz page with quiz ID to add questions
    window.location.href = `create-quiz-enhanced.html?exam_id=${quizId}`;
}

// View quiz results
function viewQuizResults(quizId) {
    // Redirect to quiz results page
    window.location.href = `quiz-results.html?exam_id=${quizId}`;
}

// Delete quiz
async function deleteQuiz(quizId) {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
        const response = await fetch(`/api/exams/${quizId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showToast('Quiz deleted successfully!', 'success');
            loadQuizzes();
            loadDashboardData();
        } else {
            showToast('Failed to delete quiz', 'error');
        }
    } catch (error) {
        console.error('Error deleting quiz:', error);
        showToast('Error deleting quiz', 'error');
    }
}

// Load announcements
function loadAnnouncements() {
    allAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]');
    displayAnnouncements(allAnnouncements);
}

// Display announcements
function displayAnnouncements(announcements) {
    const container = document.getElementById('announcementsList');

    if (announcements.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No announcements posted yet</p>';
        return;
    }

    container.innerHTML = announcements.map((announcement, index) => {
        const priorityColors = {
            normal: 'bg-blue-100 text-blue-800',
            important: 'bg-yellow-100 text-yellow-800',
            urgent: 'bg-red-100 text-red-800'
        };

        return `
            <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h3 class="text-lg font-bold text-gray-800">${announcement.title}</h3>
                            <span class="px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[announcement.priority] || priorityColors.normal}">
                                ${announcement.priority || 'normal'}
                            </span>
                        </div>
                        <p class="text-gray-600">${announcement.message}</p>
                    </div>
                    <button onclick="deleteAnnouncement(${index})" class="text-red-500 hover:text-red-700 ml-4">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                
                <div class="flex flex-wrap gap-2 text-sm text-gray-500 mt-4">
                    <span class="flex items-center">
                        <i class="fas fa-graduation-cap mr-1"></i>
                        ${announcement.program === 'all' ? 'All Programs' : announcement.program}
                    </span>
                    <span class="flex items-center">
                        <i class="fas fa-layer-group mr-1"></i>
                        ${announcement.semester === 'all' ? 'All Semesters' : `Semester ${announcement.semester}`}
                    </span>
                    <span class="flex items-center">
                        <i class="fas fa-clock mr-1"></i>
                        ${new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Create announcement
document.getElementById('announcementForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const announcementData = {
        title: document.getElementById('announcementTitle').value,
        message: document.getElementById('announcementMessage').value,
        program: document.getElementById('announcementProgram').value,
        semester: document.getElementById('announcementSemester').value,
        priority: document.getElementById('announcementPriority').value,
        createdBy: user.name,
        createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    announcements.unshift(announcementData);
    localStorage.setItem('announcements', JSON.stringify(announcements));

    showToast('Announcement posted successfully!', 'success');
    hideModal('createAnnouncementModal');
    document.getElementById('announcementForm').reset();
    loadAnnouncements();
    loadDashboardData();
});

// Apply announcement filters
function applyAnnouncementFilters() {
    const programFilter = document.getElementById('announcementProgramFilter').value;
    const semesterFilter = document.getElementById('announcementSemesterFilter').value;

    let filtered = allAnnouncements;

    if (programFilter) {
        filtered = filtered.filter(a => a.program === programFilter || a.program === 'all');
    }

    if (semesterFilter) {
        filtered = filtered.filter(a => a.semester === semesterFilter || a.semester === 'all');
    }

    displayAnnouncements(filtered);
}

// Delete announcement
function deleteAnnouncement(index) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    announcements.splice(index, 1);
    localStorage.setItem('announcements', JSON.stringify(announcements));

    showToast('Announcement deleted successfully!', 'success');
    loadAnnouncements();
    loadDashboardData();
}

// Load resources
async function loadResources() {
    try {
        const response = await fetch('/api/resources/faculty', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            allResources = data.resources || [];
            displayResources(allResources);
        } else {
            allResources = [];
            displayResources([]);
        }
    } catch (error) {
        console.error('Error loading resources:', error);
        allResources = [];
        displayResources([]);
    }
}

// Display resources
function displayResources(resources) {
    const container = document.getElementById('resourcesList');

    if (resources.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-3">No resources uploaded yet</p>';
        return;
    }

    const typeIcons = {
        notes: 'fa-file-alt',
        ppt: 'fa-file-powerpoint',
        assignment: 'fa-tasks',
        reference: 'fa-book'
    };

    const typeColors = {
        notes: 'bg-blue-100 text-blue-800',
        ppt: 'bg-orange-100 text-orange-800',
        assignment: 'bg-green-100 text-green-800',
        reference: 'bg-purple-100 text-purple-800'
    };

    container.innerHTML = resources.map((resource, index) => {
        const isAssignment = resource.type === 'assignment';
        const fileUrl = resource.fileUrl || resource.link;
        const uploadDate = resource.createdAt || resource.uploadedAt;

        // Check if assignment is overdue
        let assignmentStatus = '';
        if (isAssignment && resource.dueDate) {
            const now = new Date();
            const dueDate = new Date(resource.dueDate);
            const isOverdue = now > dueDate;
            assignmentStatus = isOverdue ?
                '<span class="text-red-600 font-semibold">Overdue</span>' :
                '<span class="text-green-600 font-semibold">Active</span>';
        }

        return `
        <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
                        <i class="fas ${typeIcons[resource.type] || 'fa-file'} text-2xl text-pink-600"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-800">${resource.title}</h3>
                        <span class="px-2 py-1 text-xs font-semibold rounded-full ${typeColors[resource.type] || 'bg-gray-100 text-gray-800'}">
                            ${resource.type.toUpperCase()}
                        </span>
                    </div>
                </div>
                <button onclick="deleteResource('${resource._id || index}')" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            
            <p class="text-sm text-gray-600 mb-4">${resource.description || 'No description'}</p>
            
            <div class="space-y-2 text-sm text-gray-600 mb-4">
                <div class="flex items-center">
                    <i class="fas fa-book w-5 text-pink-600"></i>
                    <span class="ml-2">${resource.subject}</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-users w-5 text-pink-600"></i>
                    <span class="ml-2">${resource.program} - Semester ${resource.semester}</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-clock w-5 text-pink-600"></i>
                    <span class="ml-2">Uploaded: ${new Date(uploadDate).toLocaleDateString()}</span>
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
                    <span class="ml-2">Due: ${new Date(resource.dueDate).toLocaleString()} ${assignmentStatus}</span>
                </div>
                ` : ''}
                ${isAssignment && resource.lateSubmission ? `
                <div class="flex items-center">
                    <i class="fas fa-info-circle w-5 text-blue-600"></i>
                    <span class="ml-2">Late submission: ${resource.lateSubmission === 'yes' ? 'Allowed' : 'Not allowed'}</span>
                </div>
                ` : ''}
                ${isAssignment ? `
                <div class="flex items-center">
                    <i class="fas fa-users w-5 text-purple-600"></i>
                    <span class="ml-2">Submissions: <strong>${resource.submissions?.length || 0}</strong></span>
                </div>
                ` : ''}
            </div>
            
            <div class="flex gap-2">
                <a href="${fileUrl}" target="_blank" class="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg text-center font-semibold transition">
                    <i class="fas fa-download mr-2"></i>Download
                </a>
                ${isAssignment ? `
                <button onclick="viewSubmissions('${resource._id}', '${resource.title}')" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition">
                    <i class="fas fa-eye mr-2"></i>View Submissions
                </button>
                ` : ''}
            </div>
        </div>
        `;
    }).join('');
}

// Upload resource
// Show/hide assignment dates based on resource type
document.getElementById('resourceType').addEventListener('change', (e) => {
    const assignmentDates = document.getElementById('assignmentDates');
    const startDate = document.getElementById('assignmentStartDate');
    const dueDate = document.getElementById('assignmentDueDate');

    if (e.target.value === 'assignment') {
        assignmentDates.classList.remove('hidden');
        startDate.required = true;
        dueDate.required = true;
    } else {
        assignmentDates.classList.add('hidden');
        startDate.required = false;
        dueDate.required = false;
    }
});

document.getElementById('resourceForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('resourceFile');
    const file = fileInput.files[0];

    if (!file) {
        showToast('Please select a file to upload', 'error');
        return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
    }

    const resourceType = document.getElementById('resourceType').value;

    // Validate assignment dates if type is assignment
    if (resourceType === 'assignment') {
        const startDate = document.getElementById('assignmentStartDate').value;
        const dueDate = document.getElementById('assignmentDueDate').value;

        if (!startDate || !dueDate) {
            showToast('Please set start date and due date for assignment', 'error');
            return;
        }

        if (new Date(startDate) >= new Date(dueDate)) {
            showToast('Due date must be after start date', 'error');
            return;
        }
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', document.getElementById('resourceTitle').value);
    formData.append('description', document.getElementById('resourceDescription').value);
    formData.append('program', document.getElementById('resourceProgram').value);
    formData.append('semester', document.getElementById('resourceSemester').value);
    formData.append('subject', document.getElementById('resourceSubject').value);
    formData.append('type', resourceType);

    // Add assignment dates if applicable
    if (resourceType === 'assignment') {
        formData.append('startDate', document.getElementById('assignmentStartDate').value);
        formData.append('dueDate', document.getElementById('assignmentDueDate').value);
        formData.append('lateSubmission', document.getElementById('lateSubmission').value);
    }

    try {
        showToast('Uploading file...', 'success');

        const response = await fetch('/api/resources/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            showToast('Resource uploaded successfully!', 'success');
            hideModal('uploadResourceModal');
            document.getElementById('resourceForm').reset();
            loadResources();
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to upload resource', 'error');
        }
    } catch (error) {
        console.error('Error uploading resource:', error);
        showToast('Error uploading resource. Please try again.', 'error');
    }
});

// Apply resource filters
function applyResourceFilters() {
    const programFilter = document.getElementById('resourceProgramFilter').value;
    const semesterFilter = document.getElementById('resourceSemesterFilter').value;
    const typeFilter = document.getElementById('resourceTypeFilter').value;

    let filtered = allResources;

    if (programFilter) {
        filtered = filtered.filter(r => r.program === programFilter);
    }

    if (semesterFilter) {
        filtered = filtered.filter(r => r.semester === semesterFilter);
    }

    if (typeFilter) {
        filtered = filtered.filter(r => r.type === typeFilter);
    }

    displayResources(filtered);
}

// Delete resource
async function deleteResource(resourceId) {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
        const response = await fetch(`/api/resources/${resourceId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showToast('Resource deleted successfully!', 'success');
            loadResources();
        } else {
            showToast('Failed to delete resource', 'error');
        }
    } catch (error) {
        console.error('Error deleting resource:', error);
        showToast('Error deleting resource', 'error');
    }
}

// Load programs from API
async function loadPrograms() {
    try {
        const response = await fetch('/api/admin-enhanced/programs/public');
        if (response.ok) {
            const data = await response.json();
            allPrograms = data.programs || [];
            populateProgramDropdowns();
        } else {
            console.error('Failed to load programs');
            // Fallback to default programs
            allPrograms = [
                { code: 'BCA', name: 'BCA' },
                { code: 'MCA', name: 'MCA' },
                { code: 'BSc', name: 'BSc' }
            ];
            populateProgramDropdowns();
        }
    } catch (error) {
        console.error('Error loading programs:', error);
        // Fallback to default programs
        allPrograms = [
            { code: 'BCA', name: 'BCA' },
            { code: 'MCA', name: 'MCA' },
            { code: 'BSc', name: 'BSc' }
        ];
        populateProgramDropdowns();
    }
}

// Populate all program dropdowns
function populateProgramDropdowns() {
    const programDropdowns = [
        'meetingProgram',
        'quizProgram',
        'announcementProgram',
        'resourceProgram',
        'programFilter',
        'announcementProgramFilter',
        'resourceProgramFilter'
    ];

    programDropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            // Store current value
            const currentValue = dropdown.value;

            // Get the first option (usually "Select Program" or "All Programs")
            const firstOption = dropdown.options[0];

            // Clear all options
            dropdown.innerHTML = '';

            // Re-add first option
            if (firstOption) {
                dropdown.appendChild(firstOption);
            }

            // Add program options
            allPrograms.forEach(program => {
                const option = document.createElement('option');
                option.value = program.code;
                option.textContent = program.name || program.code;
                dropdown.appendChild(option);
            });

            // Restore previous value if it still exists
            if (currentValue && Array.from(dropdown.options).some(opt => opt.value === currentValue)) {
                dropdown.value = currentValue;
            }
        }
    });
}

// Initialize dashboard
loadPrograms();
loadDashboardData();


let currentSubmissionResourceId = null;
let currentSubmissionTitle = null;

// View assignment submissions
async function viewSubmissions(resourceId, title) {
    currentSubmissionResourceId = resourceId;
    currentSubmissionTitle = title;

    document.getElementById('submissionAssignmentTitle').textContent = title;
    document.getElementById('viewSubmissionsModal').classList.remove('hidden');

    console.log('Fetching submissions for resource:', resourceId);

    try {
        const response = await fetch(`/api/assignments/${resourceId}/submissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('Submissions data:', data);
            displaySubmissions(data.submissions || [], resourceId);
        } else {
            const error = await response.json();
            console.error('Error response:', error);
            document.getElementById('submissionsList').innerHTML = `<p class="text-red-500 text-center py-8">Failed to load submissions: ${error.message}</p>`;
        }
    } catch (error) {
        console.error('Error loading submissions:', error);
        document.getElementById('submissionsList').innerHTML = '<p class="text-red-500 text-center py-8">Error loading submissions</p>';
    }
}

// Refresh submissions
function refreshSubmissions() {
    if (currentSubmissionResourceId && currentSubmissionTitle) {
        viewSubmissions(currentSubmissionResourceId, currentSubmissionTitle);
    }
}

// Display submissions
function displaySubmissions(submissions, resourceId) {
    const container = document.getElementById('submissionsList');

    if (submissions.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No submissions yet</p>';
        return;
    }

    container.innerHTML = submissions.map(sub => {
        const statusColors = {
            submitted: 'bg-blue-100 text-blue-800',
            graded: 'bg-green-100 text-green-800',
            late: 'bg-red-100 text-red-800'
        };

        return `
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-bold text-gray-800">${sub.student_name}</h4>
                        <p class="text-sm text-gray-600">ID: ${sub.student_id}</p>
                        <p class="text-sm text-gray-600">Submitted: ${new Date(sub.submitted_at).toLocaleString()}</p>
                    </div>
                    <span class="px-3 py-1 text-xs font-semibold rounded-full ${statusColors[sub.status] || 'bg-gray-100 text-gray-800'}">
                        ${sub.status.toUpperCase()}
                    </span>
                </div>
                
                ${sub.comments ? `<p class="text-sm text-gray-600 mb-3"><strong>Comments:</strong> ${sub.comments}</p>` : ''}
                
                ${sub.marks !== undefined ? `
                <div class="bg-white rounded p-3 mb-3">
                    <p class="text-sm"><strong>Marks:</strong> ${sub.marks}/100</p>
                    ${sub.feedback ? `<p class="text-sm mt-1"><strong>Feedback:</strong> ${sub.feedback}</p>` : ''}
                </div>
                ` : ''}
                
                <div class="flex gap-2">
                    <a href="${sub.file_url}" target="_blank" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center text-sm font-semibold transition">
                        <i class="fas fa-download mr-2"></i>Download
                    </a>
                    <button onclick="showGradeModal('${resourceId}', '${sub.student_id}', '${sub.student_name}', ${sub.marks || 0})" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition">
                        <i class="fas fa-edit mr-2"></i>${sub.marks !== undefined ? 'Edit Grade' : 'Grade'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Hide submissions modal
function hideSubmissionsModal() {
    document.getElementById('viewSubmissionsModal').classList.add('hidden');
}

// Show grade modal
function showGradeModal(resourceId, studentId, studentName, currentMarks) {
    document.getElementById('gradeResourceId').value = resourceId;
    document.getElementById('gradeStudentId').value = studentId;
    document.getElementById('gradeStudentName').textContent = studentName;
    document.getElementById('gradeMarks').value = currentMarks || '';
    document.getElementById('gradeSubmissionModal').classList.remove('hidden');
}

// Hide grade modal
function hideGradeModal() {
    document.getElementById('gradeSubmissionModal').classList.add('hidden');
    document.getElementById('gradeSubmissionForm').reset();
}

// Submit grade
document.getElementById('gradeSubmissionForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const resourceId = document.getElementById('gradeResourceId').value;
    const studentId = document.getElementById('gradeStudentId').value;
    const marks = parseInt(document.getElementById('gradeMarks').value);
    const feedback = document.getElementById('gradeFeedback').value;

    try {
        const response = await fetch(`/api/assignments/${resourceId}/grade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                studentId,
                marks,
                feedback
            })
        });

        if (response.ok) {
            showToast('Grade submitted successfully!', 'success');
            hideGradeModal();
            // Reload submissions
            const title = document.getElementById('submissionAssignmentTitle').textContent;
            viewSubmissions(resourceId, title);
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to submit grade', 'error');
        }
    } catch (error) {
        console.error('Error submitting grade:', error);
        showToast('Error submitting grade', 'error');
    }
});
