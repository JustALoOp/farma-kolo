const questionTextElement = document.getElementById('question-text');
const trueBtn = document.getElementById('true-btn');
const falseBtn = document.getElementById('false-btn');
const feedbackTextElement = document.getElementById('feedback-text');
const justificationTextElement = document.getElementById('justification-text');
const nextBtn = document.getElementById('next-btn');
const progressBarElement = document.getElementById('progress-bar');
const scoreValueElement = document.getElementById('score-value');
const totalQuestionsElement = document.getElementById('total-questions');
const resetBtn = document.getElementById('reset-btn'); // Added reset button element

let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Function to update score display
function updateScoreDisplay() {
    if (scoreValueElement) {
        scoreValueElement.textContent = score;
    }
    if (totalQuestionsElement) {
        totalQuestionsElement.textContent = questions.length > 0 ? questions.length : '0';
    }
}

// Function to update the progress bar
function updateProgressBar() {
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

// Function to load questions from JSON file
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        questions = await response.json();

        if (totalQuestionsElement) {
            totalQuestionsElement.textContent = questions.length > 0 ? questions.length : '0';
        }

        const savedIndex = localStorage.getItem('quizCurrentQuestionIndex');
        const savedScore = localStorage.getItem('quizScore');

        currentQuestionIndex = 0;
        score = 0;

        if (savedIndex !== null) {
            const parsedIndex = parseInt(savedIndex, 10);
            if (parsedIndex >= 0 && parsedIndex <= questions.length && questions.length > 0) {
                 currentQuestionIndex = parsedIndex;
            } else if (parsedIndex !== 0) {
                localStorage.removeItem('quizCurrentQuestionIndex');
            }
        }
        if (savedScore !== null) {
            const parsedScore = parseInt(savedScore, 10);
             if (!isNaN(parsedScore) && parsedScore >= 0) {
                score = parsedScore;
            } else if (parsedScore !== 0) {
                 localStorage.removeItem('quizScore');
            }
        }

        if (questions.length > 0) {
            displayQuestion();
        } else {
            questionTextElement.textContent = 'Nie znaleziono pytań.';
            disableAnswerButtons();
            localStorage.removeItem('quizCurrentQuestionIndex');
            localStorage.removeItem('quizScore');
            currentQuestionIndex = 0;
            score = 0;
            updateProgressBar();
            updateScoreDisplay();
        }
        if(questions.length === 0) {
            updateScoreDisplay();
        }

    } catch (error) {
        console.error('Błąd ładowania pytań:', error);
        questionTextElement.textContent = 'Wystąpił błąd podczas ładowania pytań. Spróbuj odświeżyć stronę.';
        disableAnswerButtons();
        localStorage.removeItem('quizCurrentQuestionIndex');
        localStorage.removeItem('quizScore');
        currentQuestionIndex = 0;
        score = 0;
        if (totalQuestionsElement) {
            totalQuestionsElement.textContent = '0';
        }
        updateScoreDisplay();
        updateProgressBar();
    }
}

// Function to display the current question
function displayQuestion() {
    updateScoreDisplay();
    updateProgressBar();

    if (currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        questionTextElement.textContent = currentQuestion.question;
        // Clear feedback from previous question only if it's not the final score message
        if (feedbackTextElement.textContent !== `Ostateczny wynik: ${score} / ${questions.length}`) {
             feedbackTextElement.textContent = '';
        }
        // Clear justification only if it's not the final score message
        if (justificationTextElement.textContent !== '') {
            justificationTextElement.textContent = '';
        }
        nextBtn.classList.add('hidden');
        enableAnswerButtons();
    } else {
        questionTextElement.textContent = 'Koniec quizu!';
        feedbackTextElement.textContent = `Ostateczny wynik: ${score} / ${questions.length}`;
        feedbackTextElement.style.color = '#333';
        justificationTextElement.textContent = '';
        disableAnswerButtons();
        nextBtn.classList.add('hidden');
    }
}

// Function to handle user's answer
function handleAnswer(userAnswer) {
    disableAnswerButtons();
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = userAnswer === currentQuestion.answer;

    if (isCorrect) {
        score++;
        feedbackTextElement.textContent = 'Poprawna odpowiedź!';
        feedbackTextElement.style.color = 'green';
    } else {
        feedbackTextElement.textContent = 'Niepoprawna odpowiedź.';
        feedbackTextElement.style.color = 'red';
    }
    justificationTextElement.textContent = currentQuestion.justification;

    localStorage.setItem('quizCurrentQuestionIndex', currentQuestionIndex.toString());
    localStorage.setItem('quizScore', score.toString());

    updateScoreDisplay();
    nextBtn.classList.remove('hidden');
}

// Function to disable answer buttons
function disableAnswerButtons() {
    trueBtn.disabled = true;
    falseBtn.disabled = true;
    trueBtn.style.opacity = 0.7;
    falseBtn.style.opacity = 0.7;
}

// Function to enable answer buttons
function enableAnswerButtons() {
    trueBtn.disabled = false;
    falseBtn.disabled = false;
    trueBtn.style.opacity = 1;
    falseBtn.style.opacity = 1;
}

// Function to reset the quiz
function resetQuiz() {
    currentQuestionIndex = 0;
    score = 0;

    localStorage.removeItem('quizCurrentQuestionIndex');
    localStorage.removeItem('quizScore');

    feedbackTextElement.textContent = ''; // Clear feedback text
    feedbackTextElement.style.color = '#333'; // Reset color just in case
    justificationTextElement.textContent = ''; // Clear justification text

    enableAnswerButtons();
    nextBtn.classList.add('hidden');

    displayQuestion(); // Reload the first question and update displays
}

// Event listeners for answer buttons
trueBtn.addEventListener('click', () => handleAnswer(true));
falseBtn.addEventListener('click', () => handleAnswer(false));

// Event listener for next button
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    localStorage.setItem('quizCurrentQuestionIndex', currentQuestionIndex.toString());
    displayQuestion();
});

// Event listener for reset button
if (resetBtn) {
    resetBtn.addEventListener('click', resetQuiz);
}

// Load questions when the script is executed
loadQuestions();
