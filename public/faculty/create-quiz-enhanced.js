// Authentication check
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || user.role !== 'faculty') {
    window.location.href = '../login.html';
}

let questions = [];
let questionCounter = 0;
let currentStep = 1;

// Step navigation
function goToStep(step) {
    // Validate before moving forward
    if (step > currentStep) {
        if (currentStep === 1 && !validateStep1()) {
            return;
        }
        if (currentStep === 2 && !validateStep2()) {
            return;
        }
    }
    
    // Hide all steps
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step-indicator').forEach(s => s.classList.remove('active'));
    
    // Show current step
    document.getElementById(`step${step}`).classList.add('active');
    document.getElementById(`step${step}-indicator`).classList.add('active');
    
    // Mark completed steps
    for (let i = 1; i < step; i++) {
        document.getElementById(`step${i}-indicator`).classList.add('completed');
        const circle = document.querySelector(`#step${i}-indicator .w-10`);
        circle.classList.remove('bg-gray-300');
        circle.classList.add('bg-green-600');
    }
    
    currentStep = step;
    
    // Update review if going to step 3
    if (step === 3) {
        updateReview();
    }
}

// Validate step 1
function validateStep1() {
    const title = document.getElementById('quizTitle').value.trim();
    const subject = document.getElementById('quizSubject').value.trim();
    const program = document.getElementById('quizProgram').value;
    const semester = document.getElementById('quizSemester').value;
    const duration = document.getElementById('quizDuration').value;
    const schedule = document.getElementById('quizSchedule').value;
    
    if (!title) {
        alert('Please enter quiz title!');
        return false;
    }
    if (!subject) {
        alert('Please enter subject!');
        return false;
    }
    if (!program) {
        alert('Please select program!');
        return false;
    }
    if (!semester) {
        alert('Please select semester!');
        return false;
    }
    if (!duration || duration < 1) {
        alert('Please enter valid duration!');
        return false;
    }
    if (!schedule) {
        alert('Please select scheduled date and time!');
        return false;
    }
    
    return true;
}

// Validate step 2
function validateStep2() {
    const questionCards = document.querySelectorAll('.question-card');
    if (questionCards.length === 0) {
        alert('Please add at least one question!');
        return false;
    }
    return true;
}

// Update review
function updateReview() {
    document.getElementById('reviewTitle').textContent = document.getElementById('quizTitle').value;
    document.getElementById('reviewSubject').textContent = document.getElementById('quizSubject').value;
    document.getElementById('reviewProgram').textContent = document.getElementById('quizProgram').value;
    document.getElementById('reviewSemester').textContent = 'Semester ' + document.getElementById('quizSemester').value;
    document.getElementById('reviewDuration').textContent = document.getElementById('quizDuration').value + ' minutes';
    
    const scheduleDate = new Date(document.getElementById('quizSchedule').value);
    document.getElementById('reviewSchedule').textContent = scheduleDate.toLocaleString();
    
    updateQuestionCount();
}

// Add new question
function addQuestion() {
    // Remove empty state message if exists
    const emptyState = document.querySelector('#questionsContainer .text-center');
    if (emptyState) {
        emptyState.remove();
    }
    
    questionCounter++;
    const questionId = `q${questionCounter}`;
    
    const questionHTML = `
        <div id="${questionId}" class="question-card bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md">
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl font-bold text-gray-800">Question ${questionCounter}</h3>
                <button onclick="removeQuestion('${questionId}')" class="text-red-600 hover:text-red-800 font-semibold">
                    <i class="fas fa-trash mr-1"></i>Remove
                </button>
            </div>
            
            <!-- Question Type -->
            <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Question Type</label>
                <select id="${questionId}_type" onchange="updateQuestionType('${questionId}')" 
                    class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none">
                    <option value="radio">Single Choice (Radio)</option>
                    <option value="checkbox">Multiple Choice (Checkbox)</option>
                    <option value="text">Short Answer (Text)</option>
                </select>
            </div>
            
            <!-- Question Text -->
            <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Question Text *</label>
                <textarea id="${questionId}_text" rows="3" placeholder="Enter your question here..." 
                    class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"></textarea>
            </div>
            
            <!-- Marks -->
            <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Marks</label>
                <input type="number" id="${questionId}_marks" value="1" min="1" 
                    class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none">
            </div>
            
            <!-- Options Container (for radio/checkbox) -->
            <div id="${questionId}_optionsContainer">
                <div class="flex justify-between items-center mb-3">
                    <label class="block text-sm font-semibold text-gray-700">Options</label>
                    <button onclick="addOption('${questionId}')" class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg">
                        <i class="fas fa-plus mr-1"></i>Add Option
                    </button>
                </div>
                <div id="${questionId}_options" class="space-y-2">
                    <!-- Options will be added here -->
                </div>
            </div>
            
            <!-- Correct Answer (for text type) -->
            <div id="${questionId}_textAnswer" class="hidden">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Correct Answer *</label>
                <textarea id="${questionId}_correctText" rows="2" placeholder="Enter the correct answer..." 
                    class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"></textarea>
            </div>
        </div>
    `;
    
    document.getElementById('questionsContainer').insertAdjacentHTML('beforeend', questionHTML);
    
    // Add initial options for radio/checkbox
    addOption(questionId);
    addOption(questionId);
    
    updateQuestionCount();
}

// Update question type
function updateQuestionType(questionId) {
    const type = document.getElementById(`${questionId}_type`).value;
    const optionsContainer = document.getElementById(`${questionId}_optionsContainer`);
    const textAnswer = document.getElementById(`${questionId}_textAnswer`);
    
    if (type === 'text') {
        optionsContainer.classList.add('hidden');
        textAnswer.classList.remove('hidden');
    } else {
        optionsContainer.classList.remove('hidden');
        textAnswer.classList.add('hidden');
    }
}

// Add option to question
function addOption(questionId) {
    const type = document.getElementById(`${questionId}_type`).value;
    const optionsDiv = document.getElementById(`${questionId}_options`);
    const optionCount = optionsDiv.children.length + 1;
    const optionId = `${questionId}_option${optionCount}`;
    
    const inputType = type === 'checkbox' ? 'checkbox' : 'radio';
    const inputName = `${questionId}_correct`;
    
    const optionHTML = `
        <div id="${optionId}" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input type="${inputType}" name="${inputName}" value="${optionCount}" 
                class="w-5 h-5 text-purple-600 focus:ring-purple-500">
            <input type="text" id="${optionId}_text" placeholder="Option ${optionCount}" 
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none">
            <button onclick="removeOption('${optionId}')" class="text-red-600 hover:text-red-800">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    optionsDiv.insertAdjacentHTML('beforeend', optionHTML);
}

// Remove option
function removeOption(optionId) {
    const option = document.getElementById(optionId);
    if (option) {
        option.remove();
    }
}

// Remove question
function removeQuestion(questionId) {
    if (confirm('Are you sure you want to remove this question?')) {
        const question = document.getElementById(questionId);
        if (question) {
            question.remove();
            updateQuestionCount();
        }
    }
}

// Update question count
function updateQuestionCount() {
    const questionCards = document.querySelectorAll('.question-card');
    const count = questionCards.length;
    
    // Update count displays
    const questionCountEl = document.getElementById('questionCount');
    const totalQuestionsEl = document.getElementById('totalQuestions');
    
    if (questionCountEl) questionCountEl.textContent = `(${count})`;
    if (totalQuestionsEl) totalQuestionsEl.textContent = count;
    
    // Calculate total marks
    let totalMarks = 0;
    questionCards.forEach(card => {
        const marksInput = card.querySelector('input[type="number"]');
        if (marksInput) {
            totalMarks += parseInt(marksInput.value) || 0;
        }
    });
    
    const totalMarksEl = document.getElementById('totalMarks');
    if (totalMarksEl) totalMarksEl.textContent = totalMarks;
    
    // Show/hide empty state
    const container = document.getElementById('questionsContainer');
    const emptyState = container.querySelector('.text-center');
    
    if (count === 0 && !emptyState) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-question-circle text-6xl mb-4"></i>
                <p class="text-xl">No questions added yet</p>
                <p class="text-sm mt-2">Click "Add Question" button above to start</p>
            </div>
        `;
    }
}

// Collect quiz data
function collectQuizData() {
    const title = document.getElementById('quizTitle').value.trim();
    const subject = document.getElementById('quizSubject').value.trim();
    const program = document.getElementById('quizProgram').value;
    const semester = document.getElementById('quizSemester').value;
    const duration = parseInt(document.getElementById('quizDuration').value);
    const schedule = document.getElementById('quizSchedule').value;
    const description = document.getElementById('quizDescription').value.trim();
    
    // Validation
    if (!title || !subject || !program || !semester || !duration || !schedule) {
        alert('Please fill in all required fields!');
        return null;
    }
    
    const questionCards = document.querySelectorAll('.question-card');
    if (questionCards.length === 0) {
        alert('Please add at least one question!');
        return null;
    }
    
    const questions = [];
    let isValid = true;
    
    questionCards.forEach((card, index) => {
        const questionId = card.id;
        const type = document.getElementById(`${questionId}_type`).value;
        const questionText = document.getElementById(`${questionId}_text`).value.trim();
        const marks = parseInt(document.getElementById(`${questionId}_marks`).value) || 1;
        
        if (!questionText) {
            alert(`Question ${index + 1}: Please enter question text!`);
            isValid = false;
            return;
        }
        
        let options = [];
        let correctAnswer = null;
        
        if (type === 'radio' || type === 'checkbox') {
            // Collect options
            const optionsDiv = document.getElementById(`${questionId}_options`);
            const optionInputs = optionsDiv.querySelectorAll('input[type="text"]');
            
            optionInputs.forEach(input => {
                const optionText = input.value.trim();
                if (optionText) {
                    options.push(optionText);
                }
            });
            
            if (options.length < 2) {
                alert(`Question ${index + 1}: Please add at least 2 options!`);
                isValid = false;
                return;
            }
            
            // Get correct answer(s)
            if (type === 'radio') {
                const selected = card.querySelector(`input[name="${questionId}_correct"]:checked`);
                if (!selected) {
                    alert(`Question ${index + 1}: Please select the correct answer!`);
                    isValid = false;
                    return;
                }
                correctAnswer = options[parseInt(selected.value) - 1];
            } else {
                // checkbox - multiple correct answers
                const selected = card.querySelectorAll(`input[name="${questionId}_correct"]:checked`);
                if (selected.length === 0) {
                    alert(`Question ${index + 1}: Please select at least one correct answer!`);
                    isValid = false;
                    return;
                }
                correctAnswer = Array.from(selected).map(s => options[parseInt(s.value) - 1]);
            }
        } else {
            // text type
            correctAnswer = document.getElementById(`${questionId}_correctText`).value.trim();
            if (!correctAnswer) {
                alert(`Question ${index + 1}: Please enter the correct answer!`);
                isValid = false;
                return;
            }
        }
        
        questions.push({
            type,
            question_text: questionText,
            options,
            correct_answer: correctAnswer,
            marks
        });
    });
    
    if (!isValid) {
        return null;
    }
    
    return {
        title,
        subject,
        program,
        semester,
        duration,
        start_time: new Date(schedule).toISOString(),
        description,
        questions
    };
}

// Publish quiz
async function publishQuiz() {
    console.log('Publishing quiz...'); // Debug
    
    const quizData = collectQuizData();
    
    if (!quizData) {
        console.log('Quiz data validation failed'); // Debug
        return;
    }
    
    console.log('Quiz data collected:', quizData); // Debug
    
    if (!confirm(`Publish quiz "${quizData.title}" with ${quizData.questions.length} questions for ${quizData.program} Semester ${quizData.semester}?`)) {
        return;
    }
    
    try {
        console.log('Sending request to /api/quiz...'); // Debug
        
        const response = await fetch('/api/quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(quizData)
        });
        
        console.log('Response status:', response.status); // Debug
        
        const data = await response.json();
        console.log('Response data:', data); // Debug
        
        if (response.ok) {
            alert(`Quiz published successfully for ${quizData.program} Semester ${quizData.semester}!`);
            window.location.href = 'dashboard-enhanced.html';
        } else {
            console.error('Server error:', data); // Debug
            alert('Error: ' + (data.message || 'Failed to publish quiz'));
        }
    } catch (error) {
        console.error('Error publishing quiz:', error);
        alert('Error publishing quiz: ' + error.message + '\nCheck console for details.');
    }
}

// Update marks total when marks change
document.addEventListener('input', (e) => {
    if (e.target.type === 'number' && e.target.id.includes('_marks')) {
        updateQuestionCount();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set minimum schedule time to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('quizSchedule').min = now.toISOString().slice(0, 16);
});
