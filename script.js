// DOM Element Variables
const questionTextElement = document.getElementById('question-text');
const trueBtn = document.getElementById('true-btn');
const falseBtn = document.getElementById('false-btn');
const feedbackTextElement = document.getElementById('feedback-text');
const justificationTextElement = document.getElementById('justification-text');
const nextBtn = document.getElementById('next-btn');
const progressBarElement = document.getElementById('progress-bar');
const resetBtn = document.getElementById('reset-btn');
const correctScoreElement = document.getElementById('score-correct');
const incorrectScoreElement = document.getElementById('score-incorrect');
const totalScoreElement = document.getElementById('score-total');

const quizSelectionContainer = document.getElementById('quiz-selection-container');
const quizButtonsContainer = document.getElementById('quiz-buttons-container');
const quizContainer = document.querySelector('.quiz-container');
const quizTitleDisplay = document.getElementById('quiz-title-display');
const backToMenuBtn = document.getElementById('back-to-menu-btn');

// State Variables
let currentQuestionIndex = 0;
let correctScore = 0;
let incorrectScore = 0;
let questions = [];
let availableQuizzes = [];
let currentQuizId = null;
let currentQuizFile = null;

// --- Helper Functions ---
function getStorageKey(baseKey) {
    if (!currentQuizId) {
        console.error("Error: currentQuizId is not set when trying to get a storage key for:", baseKey);
        // Fallback to a generic key might be problematic for quiz-specific data.
        // Consider if an error should be thrown or if there's a valid non-quiz-specific scenario.
        return `generic_${baseKey}`; // Or handle error more strictly
    }
    return `${baseKey}_${currentQuizId}`;
}

// --- UI Update Functions ---
function updateScoreDisplay() {
    if (correctScoreElement) correctScoreElement.textContent = correctScore;
    if (incorrectScoreElement) incorrectScoreElement.textContent = incorrectScore;
    if (totalScoreElement) totalScoreElement.textContent = questions.length > 0 ? questions.length : '0';
}

function updateProgressBar() {
    if (!progressBarElement) return;
    if (questions.length > 0) {
        let progressPercentage = 0;
        if (currentQuestionIndex >= questions.length) {
            progressPercentage = 100;
        } else {
            progressPercentage = (currentQuestionIndex / questions.length) * 100;
        }
        progressBarElement.style.width = progressPercentage + '%';
    } else {
        progressBarElement.style.width = '0%';
    }
}

function disableAnswerButtons() {
    trueBtn.disabled = true; falseBtn.disabled = true;
    trueBtn.style.opacity = 0.7; falseBtn.style.opacity = 0.7;
}

function enableAnswerButtons() {
    trueBtn.disabled = false; falseBtn.disabled = false;
    trueBtn.style.opacity = 1; falseBtn.style.opacity = 1;
}

// --- Quiz Logic Functions ---
async function loadQuestions(fileName) {
    if (!fileName || !currentQuizId) {
        console.error("Quiz file name or ID not provided for loading.");
        questionTextElement.textContent = 'Błąd: Nie można załadować quizu. Spróbuj wrócić do menu.';
        disableAnswerButtons();
        if(backToMenuBtn && !backToMenuBtn.classList.contains('hidden')) { // Show if hidden
             // No, backToMenuBtn should always be visible in quiz view
        }
        return;
    }
    try {
        const response = await fetch(fileName);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${fileName}`);
        questions = await response.json();

        const savedIndex = localStorage.getItem(getStorageKey('quizCurrentQuestionIndex'));
        const savedCorrectScore = localStorage.getItem(getStorageKey('quizCorrectScore'));
        const savedIncorrectScore = localStorage.getItem(getStorageKey('quizIncorrectScore'));

        currentQuestionIndex = savedIndex !== null ? parseInt(savedIndex, 10) : 0;
        correctScore = savedCorrectScore !== null ? parseInt(savedCorrectScore, 10) : 0;
        incorrectScore = savedIncorrectScore !== null ? parseInt(savedIncorrectScore, 10) : 0;

        // Validate loaded index
        if (currentQuestionIndex < 0 || currentQuestionIndex > questions.length || isNaN(currentQuestionIndex)) {
            currentQuestionIndex = 0;
        }
        if (isNaN(correctScore) || correctScore < 0) correctScore = 0;
        if (isNaN(incorrectScore) || incorrectScore < 0) incorrectScore = 0;


        if (questions.length > 0) {
            displayQuestion();
        } else {
            questionTextElement.textContent = 'Nie znaleziono pytań w tym quizie.';
            disableAnswerButtons();
            localStorage.removeItem(getStorageKey('quizCurrentQuestionIndex'));
            localStorage.removeItem(getStorageKey('quizCorrectScore'));
            localStorage.removeItem(getStorageKey('quizIncorrectScore'));
            currentQuestionIndex = 0; correctScore = 0; incorrectScore = 0;
        }
    } catch (error) {
        console.error(`Błąd ładowania pytań dla ${fileName}:`, error);
        questionTextElement.textContent = `Błąd ładowania pytań. Spróbuj ponownie lub wybierz inny quiz.`;
        disableAnswerButtons();
        localStorage.removeItem(getStorageKey('quizCurrentQuestionIndex'));
        localStorage.removeItem(getStorageKey('quizCorrectScore'));
        localStorage.removeItem(getStorageKey('quizIncorrectScore'));
        currentQuestionIndex = 0; correctScore = 0; incorrectScore = 0;
    }
    updateScoreDisplay();
    updateProgressBar();
}

function displayQuestion() {
    updateScoreDisplay();
    updateProgressBar();

    if (currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        questionTextElement.textContent = currentQuestion.question;
        const finalScoreMsg = `Ostateczny wynik: ${correctScore} poprawnych, ${incorrectScore} niepoprawnych z ${questions.length} pytań.`;
        if (feedbackTextElement.textContent !== finalScoreMsg || currentQuestionIndex !== questions.length) {
             feedbackTextElement.textContent = ''; // Clear feedback unless it's the final score message already set
        }
        justificationTextElement.textContent = '';
        nextBtn.classList.add('hidden');
        enableAnswerButtons();
    } else {
        questionTextElement.textContent = 'Koniec quizu!';
        feedbackTextElement.textContent = `Ostateczny wynik: ${correctScore} poprawnych, ${incorrectScore} niepoprawnych z ${questions.length} pytań.`;
        feedbackTextElement.style.color = '#333';
        justificationTextElement.textContent = '';
        disableAnswerButtons();
        nextBtn.classList.add('hidden');
    }
}

function handleAnswer(userAnswer) {
    if (currentQuestionIndex >= questions.length) return; // Quiz already ended

    disableAnswerButtons();
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = userAnswer === currentQuestion.answer;

    if (isCorrect) {
        correctScore++;
        feedbackTextElement.textContent = 'Poprawna odpowiedź!';
        feedbackTextElement.style.color = 'green';
    } else {
        incorrectScore++;
        feedbackTextElement.textContent = 'Niepoprawna odpowiedź.';
        feedbackTextElement.style.color = 'red';
    }
    justificationTextElement.textContent = currentQuestion.justification;

    localStorage.setItem(getStorageKey('quizCurrentQuestionIndex'), currentQuestionIndex.toString());
    localStorage.setItem(getStorageKey('quizCorrectScore'), correctScore.toString());
    localStorage.setItem(getStorageKey('quizIncorrectScore'), incorrectScore.toString());

    updateScoreDisplay();
    nextBtn.classList.remove('hidden');
}

function resetQuiz() {
    if (!currentQuizId || !currentQuizFile) {
        console.warn("Cannot reset, no quiz loaded.");
        showQuizSelectionMenu();
        return;
    }
    currentQuestionIndex = 0;
    correctScore = 0;
    incorrectScore = 0;

    localStorage.removeItem(getStorageKey('quizCurrentQuestionIndex'));
    localStorage.removeItem(getStorageKey('quizCorrectScore'));
    localStorage.removeItem(getStorageKey('quizIncorrectScore'));

    feedbackTextElement.textContent = '';
    feedbackTextElement.style.color = '#333';
    justificationTextElement.textContent = '';
    enableAnswerButtons();
    nextBtn.classList.add('hidden');
    displayQuestion();
}

// --- Application Flow & Menu Functions ---
async function initializeApp() {
    try {
        const response = await fetch('quizzes_manifest.json');
        if (!response.ok) throw new Error(`Nie udało się załadować manifestu: ${response.status}`);
        availableQuizzes = await response.json();

        if (!availableQuizzes || availableQuizzes.length === 0) {
            displayErrorInMenu("Nie znaleziono żadnych quizów w manifeście.");
            return;
        }
        populateQuizSelectionMenu();
        showQuizSelectionMenu();
    } catch (error) {
        console.error("Błąd inicjalizacji aplikacji:", error);
        displayErrorInMenu(`Błąd ładowania manifestu quizów. ${error.message}`);
    }
}

function displayErrorInMenu(message) {
    quizButtonsContainer.innerHTML = `<p style="color: red; font-weight: bold;">${message}</p>`;
    showQuizSelectionMenu(); // Ensure menu is visible to show the error
}

function populateQuizSelectionMenu() {
    quizButtonsContainer.innerHTML = '';
    availableQuizzes.forEach(quizInfo => {
        const button = document.createElement('button');
        button.textContent = quizInfo.title;
        button.addEventListener('click', () => startQuiz(quizInfo));
        quizButtonsContainer.appendChild(button);
    });
}

function startQuiz(quizInfo) {
    currentQuizId = quizInfo.id;
    currentQuizFile = quizInfo.file;
    if (quizTitleDisplay) quizTitleDisplay.textContent = quizInfo.title;

    currentQuestionIndex = 0;
    correctScore = 0;
    incorrectScore = 0;

    // Clear any lingering quiz state from a different quiz before loading new one
    questions = []; // Clear previous questions array
    updateScoreDisplay(); // Update to 0/0/0 before loading
    updateProgressBar();  // Update to 0%

    showQuizContainer();
    loadQuestions(currentQuizFile);
}

function showQuizSelectionMenu() {
    if (quizContainer) quizContainer.classList.add('hidden');
    if (quizSelectionContainer) quizSelectionContainer.classList.remove('hidden');
    if (document.body) document.body.style.alignItems = 'flex-start'; // Or 'center' if menu is always short
}

function showQuizContainer() {
    if (quizSelectionContainer) quizSelectionContainer.classList.add('hidden');
    if (quizContainer) quizContainer.classList.remove('hidden');
    if (document.body) document.body.style.alignItems = 'center';
}

// --- Event Listeners ---
if (trueBtn) trueBtn.addEventListener('click', () => handleAnswer(true));
if (falseBtn) falseBtn.addEventListener('click', () => handleAnswer(false));

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length) { // Avoid incrementing beyond what displayQuestion handles for "end of quiz"
            currentQuestionIndex++;
            // Only save index if it's for a question to be displayed or end state.
            // currentQuestionIndex can be questions.length for "end of quiz" state.
            localStorage.setItem(getStorageKey('quizCurrentQuestionIndex'), currentQuestionIndex.toString());
        }
        displayQuestion();
    });
}

if (resetBtn) resetBtn.addEventListener('click', resetQuiz);

if (backToMenuBtn) {
    backToMenuBtn.addEventListener('click', () => {
        showQuizSelectionMenu();
        currentQuizId = null;
        currentQuizFile = null;
        questions = [];
        currentQuestionIndex = 0; correctScore = 0; incorrectScore = 0; // Reset scores
        if (quizTitleDisplay) quizTitleDisplay.textContent = 'Wybierz Quiz'; // Reset title
        questionTextElement.textContent = ''; // Clear question text
        feedbackTextElement.textContent = '';
        justificationTextElement.textContent = '';
        updateScoreDisplay();
        updateProgressBar();
        disableAnswerButtons();
        nextBtn.classList.add('hidden');
    });
}

// Initial Call
initializeApp();
