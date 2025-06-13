const questionTextElement = document.getElementById('question-text');
const trueBtn = document.getElementById('true-btn');
const falseBtn = document.getElementById('false-btn');
const feedbackTextElement = document.getElementById('feedback-text');
const justificationTextElement = document.getElementById('justification-text');
const nextBtn = document.getElementById('next-btn');

let currentQuestionIndex = 0;
let questions = [];

// Function to load questions from JSON file
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        questions = await response.json();
        if (questions.length > 0) {
            displayQuestion();
        } else {
            questionTextElement.textContent = 'Nie znaleziono pytań.';
            disableAnswerButtons();
        }
    } catch (error) {
        console.error('Błąd ładowania pytań:', error);
        questionTextElement.textContent = 'Wystąpił błąd podczas ładowania pytań. Spróbuj odświeżyć stronę.';
        disableAnswerButtons();
    }
}

// Function to display the current question
function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        questionTextElement.textContent = currentQuestion.question;
        feedbackTextElement.textContent = '';
        justificationTextElement.textContent = '';
        nextBtn.classList.add('hidden');
        enableAnswerButtons();
    } else {
        // End of quiz
        questionTextElement.textContent = 'Koniec quizu!';
        feedbackTextElement.textContent = '';
        justificationTextElement.textContent = '';
        disableAnswerButtons();
        nextBtn.classList.add('hidden');
    }
}

// Function to handle user's answer
function handleAnswer(userAnswer) {
    disableAnswerButtons();
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = userAnswer === currentQuestion.answer;

    if (isCorrect) {
        feedbackTextElement.textContent = 'Poprawna odpowiedź!';
        feedbackTextElement.style.color = 'green';
    } else {
        feedbackTextElement.textContent = 'Niepoprawna odpowiedź.';
        feedbackTextElement.style.color = 'red';
    }
    justificationTextElement.textContent = currentQuestion.justification;
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

// Event listeners for answer buttons
trueBtn.addEventListener('click', () => handleAnswer(true));
falseBtn.addEventListener('click', () => handleAnswer(false));

// Event listener for next button
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    displayQuestion();
});

// Load questions when the script is executed
loadQuestions();
