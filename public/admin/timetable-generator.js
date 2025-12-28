// Authentication
const token = localStorage.getItem('token');
let user = {};

try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
} catch (e) {
    console.error('Error parsing user data:', e);
}

if (!token) {
    console.log('No token found, redirecting to login...');
    window.location.href = '../login.html';
} else {
    console.log('Token found, user:', user);
}

// Set user name if element exists
const userNameEl = document.getElementById('userName');
if (userNameEl && user.name) {
    userNameEl.textContent = user.name;
}

// Time slots
const timeSlots = [
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '12:00', end: '13:00' },
    { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' }
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let timetableData = [];

// Initialize grid
function initializeGrid() {
    const tbody = document.getElementById('timetableGrid');
    let html = '';
    
    timeSlots.forEach(slot => {
        html += `<tr>`;
        html += `<td class="border px-4 py-3 bg-gray-50 font-semibold">${slot.start} - ${slot.end}</td>`;
        
        days.forEach(day => {
            const slotId = `${day}-${slot.start}`;
            html += `
                <td class="border time-slot" id="${slotId}" 
                    ondrop="drop(event)" 
                    ondragover="allowDrop(event)"
                    onclick="quickAdd('${day}', '${slot.start}', '${slot.end}')">
                    <div class="text-center text-gray-400 text-sm">Empty</div>
                </td>
            `;
        });
        
        html += `</tr>`;
    });
    
    tbody.innerHTML = html;
}

// Load timetable
async function loadTimetable() {
    const program = document.getElementById('program').value;
    const semester = document.getElementById('semester').value;
    const section = document.getElementById('section').value;
    const academicYear = document.getElementById('academicYear').value;
    
    if (!program || !semester) {
        return;
    }
    
    try {
        const response = await fetch(`/api/timetable?program=${program}&semester=${semester}&section=${section}&academic_year=${academicYear}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.timetables && data.timetables.length > 0) {
                timetableData = data.timetables[0].slots || [];
                renderTimetable();
            } else {
                timetableData = [];
                initializeGrid();
            }
        }
    } catch (error) {
        console.error('Error loading timetable:', error);
    }
}

// Render timetable
function renderTimetable() {
    initializeGrid();
    
    timetableData.forEach(slot => {
        const slotId = `${slot.day}-${slot.start_time}`;
        const cell = document.getElementById(slotId);
        
        if (cell) {
            cell.innerHTML = `
                <div class="slot-filled p-2 rounded cursor-pointer h-full" draggable="true" ondragstart="drag(event)" data-slot='${JSON.stringify(slot)}'>
                    <div class="font-semibold text-sm">${slot.subject_name}</div>
                    <div class="text-xs opacity-90">${slot.faculty_name}</div>
                    <div class="text-xs opacity-75">${slot.room || ''}</div>
                    <button onclick="removeSlot('${slotId}')" class="absolute top-1 right-1 text-white hover:text-red-200">
                        <i class="fas fa-times text-xs"></i>
                    </button>
                </div>
            `;
            cell.classList.add('relative');
        }
    });
}

// Quick add slot
function quickAdd(day, startTime, endTime) {
    document.getElementById('slotDay').value = day;
    document.getElementById('slotStart').value = startTime;
    document.getElementById('slotEnd').value = endTime;
    showAddSlotModal();
}

// Show/hide modal
function showAddSlotModal() {
    document.getElementById('addSlotModal').classList.remove('hidden');
}

function hideAddSlotModal() {
    document.getElementById('addSlotModal').classList.add('hidden');
}

// Add slot
function addSlot() {
    const day = document.getElementById('slotDay').value;
    const startTime = document.getElementById('slotStart').value;
    const endTime = document.getElementById('slotEnd').value;
    const subject = document.getElementById('slotSubject').value;
    const faculty = document.getElementById('slotFaculty').value;
    const room = document.getElementById('slotRoom').value;
    
    if (!subject || !faculty) {
        alert('Subject and Faculty are required');
        return;
    }
    
    const newSlot = {
        day,
        start_time: startTime,
        end_time: endTime,
        subject_code: subject.substring(0, 10).toUpperCase(),
        subject_name: subject,
        faculty_id: 'FAC-' + Date.now(),
        faculty_name: faculty,
        room: room,
        type: 'Lecture'
    };
    
    timetableData.push(newSlot);
    renderTimetable();
    hideAddSlotModal();
    
    // Clear form
    document.getElementById('slotSubject').value = '';
    document.getElementById('slotFaculty').value = '';
    document.getElementById('slotRoom').value = '';
}

// Remove slot
function removeSlot(slotId) {
    const [day, time] = slotId.split('-');
    timetableData = timetableData.filter(slot => !(slot.day === day && slot.start_time === time));
    renderTimetable();
}

// Save timetable
async function saveTimetable() {
    const program = document.getElementById('program').value;
    const semester = document.getElementById('semester').value;
    const section = document.getElementById('section').value;
    const academicYear = document.getElementById('academicYear').value;
    
    if (!program || !semester) {
        alert('Please select Program and Semester');
        return;
    }
    
    try {
        const response = await fetch('/api/timetable', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                program,
                semester: parseInt(semester),
                section,
                academic_year: academicYear,
                slots: timetableData
            })
        });
        
        if (response.ok) {
            alert('Timetable saved successfully!');
        } else {
            alert('Failed to save timetable');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving timetable');
    }
}

// Clear timetable
function clearTimetable() {
    if (confirm('Clear all slots?')) {
        timetableData = [];
        initializeGrid();
    }
}

// Auto generate (simple version)
function autoGenerate() {
    const program = document.getElementById('program').value;
    const semester = document.getElementById('semester').value;
    
    if (!program || !semester) {
        alert('Please select Program and Semester first');
        return;
    }
    
    // Sample subjects
    const subjects = [
        { name: 'Programming in C', faculty: 'Dr. Smith' },
        { name: 'Mathematics', faculty: 'Prof. Johnson' },
        { name: 'Digital Electronics', faculty: 'Dr. Williams' },
        { name: 'Data Structures', faculty: 'Prof. Brown' },
        { name: 'Database Systems', faculty: 'Dr. Davis' }
    ];
    
    timetableData = [];
    let subjectIndex = 0;
    
    // Generate slots (Mon-Fri, 9 AM - 4 PM)
    for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
        for (let timeIndex = 0; timeIndex < 6; timeIndex++) {
            if (timeIndex === 3) continue; // Skip lunch break
            
            const subject = subjects[subjectIndex % subjects.length];
            timetableData.push({
                day: days[dayIndex],
                start_time: timeSlots[timeIndex].start,
                end_time: timeSlots[timeIndex].end,
                subject_code: subject.name.substring(0, 10).toUpperCase(),
                subject_name: subject.name,
                faculty_id: 'FAC-' + subjectIndex,
                faculty_name: subject.faculty,
                room: `Room ${101 + subjectIndex}`,
                type: 'Lecture'
            });
            
            subjectIndex++;
        }
    }
    
    renderTimetable();
    alert('Timetable auto-generated! You can now edit or save it.');
}

// Drag and drop functions
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("slot", ev.target.getAttribute('data-slot'));
    ev.target.classList.add('dragging');
}

function drop(ev) {
    ev.preventDefault();
    const slotData = ev.dataTransfer.getData("slot");
    if (slotData) {
        const slot = JSON.parse(slotData);
        const targetCell = ev.target.closest('.time-slot');
        if (targetCell) {
            const [day, time] = targetCell.id.split('-');
            // Update slot day and time
            slot.day = day;
            slot.start_time = time;
            // Remove old slot
            timetableData = timetableData.filter(s => !(s.day === slot.day && s.start_time === slot.start_time));
            // Add updated slot
            timetableData.push(slot);
            renderTimetable();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing grid...');
    try {
        initializeGrid();
        console.log('Grid initialized successfully');
    } catch (error) {
        console.error('Error initializing grid:', error);
        alert('Error loading timetable generator. Please check console for details.');
    }
});

// Also initialize immediately for older browsers
try {
    initializeGrid();
} catch (error) {
    console.error('Error in immediate initialization:', error);
}


// Publish timetable
async function publishTimetable() {
    const program = document.getElementById('program').value;
    const semester = document.getElementById('semester').value;
    
    if (!program || !semester) {
        alert('Please select Program and Semester first');
        return;
    }
    
    if (timetableData.length === 0) {
        alert('Please create a timetable before publishing');
        return;
    }
    
    if (!confirm('Publish this timetable? Students and faculty will be able to view it.')) {
        return;
    }
    
    try {
        // First save the timetable
        const saveResponse = await fetch('/api/timetable', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                program,
                semester: parseInt(semester),
                section: document.getElementById('section').value,
                academic_year: document.getElementById('academicYear').value,
                slots: timetableData
            })
        });
        
        if (!saveResponse.ok) {
            alert('Failed to save timetable');
            return;
        }
        
        const savedData = await saveResponse.json();
        const timetableId = savedData.timetable?._id || savedData._id;
        
        // Then publish it
        const publishResponse = await fetch(`/api/timetable/${timetableId}/publish`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_published: true })
        });
        
        if (publishResponse.ok) {
            alert('Timetable published successfully! Students and faculty can now view it.');
        } else {
            alert('Timetable saved but failed to publish');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error publishing timetable');
    }
}
