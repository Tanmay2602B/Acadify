const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || user.role !== 'faculty') {
    window.location.href = '../login.html';
}

const get = (id) => document.getElementById(id);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));

const sidebar = get('sidebar');
const sidebarScrim = get('sidebarScrim');
const menuToggle = get('menuToggle');
const navLinks = qsa('.nav-link');
const quickTriggers = qsa('[data-section-target]');
const sections = qsa('.content-section');

const fallbackSchedule = [
    { title: 'Data Visualization Lab', time: '09:00 · Makers Lab', status: 'Live now' },
    { title: 'UX Critique Session', time: '11:30 · Studio 2', status: 'Starts soon' },
    { title: 'Cloud Office Hours', time: '15:00 · Virtual', status: 'Preview tasks' }
];

// Initialize header
const userNameLabel = get('userName');
if (userNameLabel) {
    userNameLabel.textContent = user.name || 'Faculty';
}

menuToggle?.addEventListener('click', () => toggleSidebar(true));
sidebarScrim?.addEventListener('click', () => toggleSidebar(false));
window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) toggleSidebar(false);
});

function toggleSidebar(forceOpen) {
    if (!sidebar) return;
    const open = typeof forceOpen === 'boolean' ? forceOpen : !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', open);
    sidebarScrim?.classList.toggle('visible', open);
}

navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const target = event.currentTarget.dataset.section;
        setActiveLink(link);
        showSection(target);
        toggleSidebar(false);
    });
});

quickTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
        const target = trigger.dataset.sectionTarget;
        if (!target) return;
        setActiveLink(document.querySelector(`.nav-link[data-section="${target}"]`));
        showSection(target);
    });
});

function setActiveLink(active) {
    if (!active) return;
    navLinks.forEach((link) => link.classList.remove('active'));
    active.classList.add('active');
}

function showSection(sectionName = 'overview') {
    const target = get(`${sectionName}Section`);
    if (!target) return;
    sections.forEach((section) => section.classList.add('hidden'));
    target.classList.remove('hidden');

    switch (sectionName) {
        case 'overview':
            loadOverviewData();
            break;
        case 'students':
            loadStudents();
            break;
        case 'classes':
            loadMeetings();
            break;
        case 'quizzes':
            loadQuizzes();
            break;
        case 'assignments':
            loadAssignments();
            break;
        default:
            break;
    }
}

async function loadQuizzes() {
    try {
        const response = await fetch('/api/exams/faculty', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        const container = document.getElementById('quizzesList');
        if (!container) return;

        if (!data.exams || data.exams.length === 0) {
            container.innerHTML = '<div class="glass-panel rounded-3xl p-6 text-sm text-slate-400">No assessments created.</div>';
            return;
        }

        container.innerHTML = data.exams.map(quiz => `
            <div class="glass-panel rounded-3xl p-6 space-y-3">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-lg font-semibold">${quiz.title}</p>
                        <p class="text-xs text-slate-400">${quiz.program} Sem ${quiz.semester} · ${quiz.subject}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs">Active</span>
                </div>
                <p class="text-sm text-slate-300 line-clamp-2">${quiz.description || 'No description'}</p>
                <div class="flex items-center gap-4 text-xs text-slate-400">
                    <span><i class="fas fa-clock mr-1"></i>${quiz.duration} mins</span>
                    <span><i class="fas fa-list-ol mr-1"></i>${quiz.questions ? quiz.questions.length : 0} Questions</span>
                </div>
                <div class="flex gap-3 pt-2">
                    <a href="quiz-results.html?id=${quiz.exam_id}" class="flex-1 glass-soft rounded-2xl px-4 py-2 text-sm text-center hover:bg-white/10 transition">
                        <i class="fas fa-chart-line mr-1"></i>Results
                    </a>
                    <button class="rounded-2xl bg-rose-500/30 px-4 py-2 text-sm text-rose-100 hover:bg-rose-500/40 transition">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        const container = document.getElementById('quizzesList');
        if (container) container.innerHTML = '<div class="glass-panel rounded-3xl p-6 text-sm text-rose-400">Failed to load quizzes.</div>';
    }
}

// Logout
get('logoutBtn')?.addEventListener('click', () => {
    if (confirm('Sign out of your faculty workspace?')) {
        localStorage.clear();
        window.location.href = '../login.html';
    }
});

// Bulk upload modal
get('bulkUploadBtn')?.addEventListener('click', () => openModal('bulkUploadModal'));
get('uploadStudentsBtn')?.addEventListener('click', uploadStudentsFromJson);

function uploadStudentsFromJson() {
    const payload = get('studentJsonData')?.value;
    const result = get('uploadResult');
    if (!payload || !result) return;

    try {
        const students = JSON.parse(payload);
        // Reuse the confirm logic since the structure matches
        confirmStudentImport(students);
    } catch (error) {
        result.classList.remove('hidden');
        result.innerHTML = `
            <div class="bg-rose-500/20 border border-rose-300/40 rounded-2xl p-3 text-sm text-rose-100">
                Invalid JSON structure.
            </div>`;
    }
}

function handleFileSelect(input) {
    const fileName = input.files[0]?.name;
    const display = get('studentFileName');
    if (fileName && display) {
        display.textContent = fileName;
        display.classList.remove('hidden');
    }
}

async function uploadStudentsFile() {
    const fileInput = get('studentFile');
    const file = fileInput?.files?.[0];

    if (!file) {
        return showNotification('Please select a file first.', 'error');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        showNotification('Uploading file...', 'info');
        const response = await fetch('/api/bulk-students/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Upload failed');

        // Auto-confirm if valid records found
        if (data.preview && data.preview.length > 0) {
            showNotification(`File parsed. Importing ${data.preview.length} students...`, 'info');
            await confirmStudentImport(data.preview);
        } else {
            showNotification('No valid records found in file.', 'warning');
        }

    } catch (error) {
        console.error(error);
        showNotification(error.message, 'error');
    }
}

async function confirmStudentImport(students) {
    try {
        const response = await fetch('/api/bulk-students/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ students })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Import failed');

        showNotification(`Successfully imported ${data.successful} students.`, 'success');
        openModal('bulkUploadModal', false);
        loadStudents();

    } catch (error) {
        console.error(error);
        showNotification(error.message, 'error');
    }
}

function downloadTemplate(type) {
    try {
        const link = document.createElement('a');
        link.href = `/api/admin-import/template/${type}`;
        link.download = `${type}-template.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Template downloaded.', 'success');
    } catch (error) {
        console.error(error);
        showNotification('Failed to download template.', 'error');
    }
}

// Modal system
qsa('[data-modal-open]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
});

document.addEventListener('click', (event) => {
    if (event.target.matches('[data-modal-close]')) {
        const modal = event.target.closest('.modal');
        if (modal?.id) openModal(modal.id, false);
    }
});

function openModal(id, show = true) {
    const modal = get(id);
    if (!modal) return;
    modal.classList.toggle('hidden', !show);
}

async function loadOverviewData() {
    loadSchedule();
    loadStudents();
    loadMeetings();
}

async function loadSchedule() {
    const container = get('todaySchedule');
    if (!container) return;

    try {
        const response = await fetch('/api/meetings/faculty', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        const meetings = data.meetings || [];

        const today = new Date();
        const todayString = today.toDateString();

        const todaysMeetings = meetings.filter(m => {
            const mDate = new Date(m.scheduled_time);
            return mDate.toDateString() === todayString;
        });

        if (todaysMeetings.length === 0) {
            container.innerHTML = '<p class="text-slate-500">No classes scheduled for today.</p>';
            return;
        }

        container.innerHTML = todaysMeetings
            .map(
                (slot) => {
                    const time = new Date(slot.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return `
            <div class="glass-soft rounded-2xl px-4 py-3">
                <p class="font-semibold">${slot.title}</p>
                <p class="text-xs text-slate-400">${time} · ${slot.program} ${slot.semester}</p>
                <p class="text-xs text-emerald-300 mt-1">${slot.status}</p>
            </div>`;
                }
            )
            .join('');
    } catch (error) {
        console.error('Error loading schedule:', error);
        container.innerHTML = '<p class="text-rose-400">Failed to load schedule.</p>';
    }
}

async function loadStudents() {
    try {
        const response = await fetch('/api/bulk-students/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load students');
        displayStudents(data.students || []);
    } catch (error) {
        console.error(error);
        displayStudents([]);
    }
}

function displayStudents(students) {
    const tbody = get('studentsTableBody');
    if (!tbody) return;
    if (!students.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-6 text-center text-slate-500">No students found.</td></tr>';
        return;
    }

    tbody.innerHTML = students
        .map(
            (student) => `
            <tr class="hover:bg-white/5 transition">
                <td class="px-5 py-4 text-slate-300">${student.roll_number || '—'}</td>
                <td class="px-5 py-4 font-semibold">${student.name || 'N/A'}<p class="text-xs text-slate-400">${student.email || ''}</p></td>
                <td class="px-5 py-4 text-slate-300">${student.program || '—'}</td>
                <td class="px-5 py-4 text-slate-300">${student.semester || '—'}</td>
                <td class="px-5 py-4">
                    <span class="text-xs px-3 py-1 rounded-full ${student.status === 'inactive' ? 'bg-rose-500/20 text-rose-200' : 'bg-emerald-500/20 text-emerald-200'}">
                        ${student.status || 'active'}
                    </span>
                </td>
                <td class="px-5 py-4 text-right">
                    <button class="text-sky-300 hover:text-white text-xs" onclick="viewStudent('${student.student_id}')">View</button>
                </td>
            </tr>`
        )
        .join('');
}

async function createMeeting() {
    const payload = {
        title: get('meetingTitle')?.value,
        description: get('meetingDescription')?.value,
        program: get('meetingProgram')?.value,
        semester: get('meetingSemester')?.value,
        subject: get('meetingSubject')?.value,
        scheduled_time: get('meetingTime')?.value,
        duration: parseInt(get('meetingDuration')?.value, 10)
    };

    if (!payload.title || !payload.program || !payload.semester || !payload.subject || !payload.scheduled_time || !payload.duration) {
        return showNotification('Fill in all meeting fields.', 'error');
    }

    try {
        const response = await fetch('/api/meetings', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create meeting');
        showNotification('Meeting scheduled successfully.', 'success');
        openModal('createMeetingModal', false);
        loadMeetings();
    } catch (error) {
        console.error(error);
        showNotification(error.message, 'error');
    }
}

async function loadMeetings() {
    try {
        const response = await fetch('/api/meetings/faculty', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load meetings');
        displayMeetings(data.meetings || []);
    } catch (error) {
        console.error(error);
        displayMeetings([]);
    }
}

function displayMeetings(meetings) {
    const container = get('meetingsList');
    if (!container) return;
    if (!meetings.length) {
        container.innerHTML = '<div class="glass-panel rounded-3xl p-6 text-sm text-slate-400">No classes scheduled.</div>';
        return;
    }

    container.innerHTML = meetings
        .map(
            (meeting) => `
            <div class="glass-panel rounded-3xl p-6 space-y-3">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-lg font-semibold">${meeting.title}</p>
                        <p class="text-xs text-slate-400">${meeting.subject}</p>
                    </div>
                    <span class="text-xs px-3 py-1 rounded-full ${meeting.status === 'scheduled'
                    ? 'bg-sky-500/20 text-sky-200'
                    : meeting.status === 'ongoing'
                        ? 'bg-emerald-500/20 text-emerald-200'
                        : 'bg-slate-500/20 text-slate-200'
                }">${meeting.status || 'scheduled'}</span>
                </div>
                <div class="grid grid-cols-2 gap-3 text-sm text-slate-400">
                    <div><i class="fas fa-calendar mr-2 text-slate-500"></i>${new Date(meeting.scheduled_time).toLocaleString()}</div>
                    <div><i class="fas fa-clock mr-2 text-slate-500"></i>${meeting.duration} mins</div>
                    <div><i class="fas fa-book mr-2 text-slate-500"></i>${meeting.program} · Sem ${meeting.semester}</div>
                    <div><i class="fas fa-users mr-2 text-slate-500"></i>${meeting.participants?.length || 0} attendees</div>
                </div>
                <div class="flex gap-3">
                    <button class="flex-1 glass-soft rounded-2xl px-4 py-2 text-sm" onclick="copyMeetingLink('${meeting.jitsi_room_url}')">
                        <i class="fas fa-link mr-2"></i>Copy link
                    </button>
                    <button class="rounded-2xl bg-rose-500/30 px-4 py-2 text-sm text-rose-100" onclick="endMeeting('${meeting.meeting_id}')">
                        <i class="fas fa-stop mr-1"></i>End
                    </button>
                </div>
            </div>`
        )
        .join('');
}

function copyMeetingLink(url) {
    navigator.clipboard.writeText(url || '').then(
        () => showNotification('Meeting link copied.', 'success'),
        () => showNotification('Unable to copy link.', 'error')
    );
}

async function endMeeting(meetingId) {
    if (!confirm('End this meeting?')) return;
    try {
        const response = await fetch(`/api/meetings/${meetingId}/end`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to end meeting');
        showNotification('Meeting ended.', 'success');
        loadMeetings();
    } catch (error) {
        console.error(error);
        showNotification(error.message, 'error');
    }
}

function viewStudent(studentId) {
    showNotification(`Viewing student ${studentId}`, 'info');
}

function showNotification(message, type = 'info') {
    const palette = {
        success: 'bg-emerald-500/90 border-emerald-300/40',
        error: 'bg-rose-500/90 border-rose-300/40',
        info: 'bg-slate-800/90 border-slate-300/30',
        warning: 'bg-amber-500/90 border-amber-300/50'
    };

    const toast = document.createElement('div');
    toast.className = `fixed top-6 right-6 px-5 py-3 rounded-2xl text-sm text-white backdrop-blur-xl border ${palette[type]} shadow-2xl z-50`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i>
            <span>${message}</span>
        </div>`;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
}

// --- Assignments Logic ---
// --- Assignments Logic ---
async function loadAssignments() {
    try {
        const response = await fetch('/api/assignments/faculty', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load assignments');

        const assignments = data.assignments || [];
        const container = get('assignmentsList');
        if (!container) return;

        if (assignments.length === 0) {
            container.innerHTML = '<div class="glass-panel rounded-3xl p-6 text-sm text-slate-400">No assignments uploaded yet.</div>';
            return;
        }

        container.innerHTML = assignments.map(task => {
            const dueDate = new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return `
            <div class="glass-panel rounded-3xl p-6 space-y-3">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-lg font-semibold">${task.title}</p>
                        <p class="text-xs text-slate-400">${task.subject} · Due ${dueDate}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs">${task.status}</span>
                </div>
                <div class="flex gap-3 pt-2">
                    <button class="flex-1 glass-soft rounded-2xl px-4 py-2 text-sm hover:bg-white/10 transition" onclick="viewSubmissions('${task.id}', '${task.title}')">
                        <i class="fas fa-eye mr-1"></i>View Submissions
                    </button>
                    <button class="rounded-2xl bg-rose-500/30 px-4 py-2 text-sm text-rose-100 hover:bg-rose-500/40 transition">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `}).join('');
    } catch (error) {
        console.error(error);
        get('assignmentsList').innerHTML = '<div class="glass-panel rounded-3xl p-6 text-sm text-rose-400">Failed to load assignments.</div>';
    }
}

async function viewSubmissions(assignmentId, title) {
    try {
        showNotification(`Loading submissions for ${title}...`, 'info');
        const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load submissions');

        const submissions = data.submissions || [];
        const tbody = get('submissionsTableBody');
        get('submissionsModalTitle').textContent = `Submissions: ${title}`;

        if (submissions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-6 text-center text-slate-500">No submissions yet.</td></tr>';
        } else {
            tbody.innerHTML = submissions.map(sub => `
                <tr class="hover:bg-white/5 transition">
                    <td class="px-5 py-4 font-semibold">${sub.studentName || 'Unknown'}</td>
                    <td class="px-5 py-4 text-slate-400">${new Date(sub.submittedAt).toLocaleString()}</td>
                    <td class="px-5 py-4 text-sky-300">${sub.fileName}</td>
                    <td class="px-5 py-4">
                        <a href="${sub.filePath}" download="${sub.fileName}" class="text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition">
                            <i class="fas fa-download mr-1"></i>Download
                        </a>
                    </td>
                </tr>
            `).join('');
        }

        openModal('submissionsModal');
    } catch (error) {
        console.error(error);
        showNotification('Failed to load submissions.', 'error');
    }
}

async function uploadAssignment() {
    const title = get('assignTitle')?.value;
    const subject = get('assignSubject')?.value;
    const program = get('assignProgram')?.value;
    const semester = get('assignSemester')?.value;
    const dueDate = get('assignDueDate')?.value;
    const description = get('assignDesc')?.value;
    const fileInput = get('assignFile');
    const file = fileInput?.files?.[0];

    if (!title || !subject || !program || !semester || !dueDate || !file) {
        showNotification('Please fill in all fields and select a file.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('program', program);
    formData.append('semester', semester);
    formData.append('dueDate', dueDate);
    formData.append('description', description);
    formData.append('file', file);

    try {
        const btn = document.querySelector('#assignmentUploadModal button[onclick="uploadAssignment()"]');
        const originalText = btn.textContent;
        btn.textContent = 'Uploading...';
        btn.disabled = true;

        const response = await fetch('/api/assignments/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Upload failed');

        showNotification('Assignment uploaded successfully!', 'success');
        document.getElementById('assignmentUploadModal').classList.add('hidden');
        loadAssignments();

        // Reset form
        get('assignTitle').value = '';
        get('assignSubject').value = '';
        get('assignDesc').value = '';
        get('assignFile').value = '';
        get('fileNameDisplay').classList.add('hidden');

    } catch (error) {
        console.error(error);
        showNotification(error.message, 'error');
    } finally {
        const btn = document.querySelector('#assignmentUploadModal button[onclick="uploadAssignment()"]');
        if (btn) {
            btn.textContent = 'Upload';
            btn.disabled = false;
        }
    }
}

// File input handler
get('assignFile')?.addEventListener('change', function (e) {
    if (e.target.files[0]) {
        const display = get('fileNameDisplay');
        display.textContent = e.target.files[0].name;
        display.classList.remove('hidden');
    }
});

showSection('overview');
