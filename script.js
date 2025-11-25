document.addEventListener('DOMContentLoaded', function () {
    // DOM element references
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const currentQuestionElement = document.getElementById('current-question');
    const totalQuestionsElement = document.getElementById('total-questions');
    const scoreElement = document.getElementById('score');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const reviewTryAgainBtn = document.getElementById('review-try-again-btn');
    const modalTryAgainBtn = document.getElementById('modal-try-again-btn');
    const reviewBtn = document.getElementById('review-btn');
    const resultModal = document.getElementById('result-modal');
    const finalScoreElement = document.getElementById('final-score');
    const performanceCommentElement = document.getElementById('performance-comment');
    const timerElement = document.getElementById('timer');
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');

    // Quiz question data
    const quizQuestions = [
        { question: "Which language runs in a web browser?", options: ["Java", "C", "Python", "JavaScript"], correctAnswer: 3 },
        { question: "What does CSS stand for?", options: ["Central Style Sheets", "Cascading Style Sheets", "Cascading Simple Sheets", "Cars SUVs Sailboats"], correctAnswer: 1 },
        { question: "What does HTML stand for?", options: ["Hypertext Markup Language", "Hypertext Markdown Language", "Hyperloop Machine Language", "Helicopters Terminals Motorboats Lamborghinis"], correctAnswer: 0 },
        { question: "Which year was JavaScript launched?", options: ["1996", "1995", "1994", "None of the above"], correctAnswer: 1 },
        { question: "Which of these is not a JavaScript framework?", options: ["React", "Angular", "Vue", "Django"], correctAnswer: 3 },
        { question: "What is the latest stable version of JavaScript as of 2023?", options: ["ES5", "ES6", "ES2022", "ES2023"], correctAnswer: 2 },
        { question: "Which HTML tag is used for creating an ordered list?", options: ["<ul>", "<li>", "<ol>", "<list>"], correctAnswer: 2 },
        { question: "What does API stand for?", options: ["Application Programming Interface", "Advanced Programming Interface", "Automated Program Interaction", "Application Process Integration"], correctAnswer: 0 },
        { question: "Which CSS property is used to change text color?", options: ["text-color", "font-color", "color", "text-style"], correctAnswer: 2 },
        { question: "What does DOM stand for?", options: ["Document Object Model", "Data Object Management", "Digital Output Mode", "Display Object Manipulation"], correctAnswer: 0 }
    ];

    // State variables
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedAnswers = new Array(quizQuestions.length).fill(null);
    let quizCompleted = false;
    let shuffledQuestions = [];
    let optionShuffles = [];
    let timer;
    let timeLeft = 300; // 5 minutes in seconds

    // Utility: Shuffle array elements (Fisher–Yates algorithm)
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Initializes quiz by shuffling questions and options
    function initQuiz() {
        shuffledQuestions = shuffleArray([...quizQuestions]);
        optionShuffles = shuffledQuestions.map(q => {
            let indices = q.options.map((_, i) => i);

            // Keeps "None of the above" option always last if it exists
            const noneIndex = q.options.findIndex(opt => /none of the above/i.test(opt));
            if (noneIndex !== -1) {
                indices = indices.filter(i => i !== noneIndex);
                indices = shuffleArray(indices);
                indices.push(noneIndex);
            } else {
                indices = shuffleArray(indices);
            }
            return indices;
        });

        totalQuestionsElement.textContent = shuffledQuestions.length;
        currentQuestionIndex = 0;
        score = 0;
        selectedAnswers = new Array(shuffledQuestions.length).fill(null);
        quizCompleted = false;
        scoreElement.textContent = score;
        resultModal.classList.remove('active');
        showQuestion();
        updateNavigationButtons();
        resetTimer();
    }

    // Displays current question and options
    function showQuestion() {
        const question = shuffledQuestions[currentQuestionIndex];
        questionText.textContent = question.question;
        optionsContainer.innerHTML = '';
        const currentShuffle = optionShuffles[currentQuestionIndex];

        currentShuffle.forEach(optionIndex => {
            const optionButton = document.createElement('button');
            optionButton.classList.add('option-btn');
            optionButton.textContent = question.options[optionIndex];

            // Highlight selected option
            if (selectedAnswers[currentQuestionIndex] === optionIndex)
                optionButton.classList.add('selected');

            // After quiz completion, show correct and incorrect answers
            if (quizCompleted) {
                if (optionIndex === question.correctAnswer)
                    optionButton.classList.add('correct');
                else if (selectedAnswers[currentQuestionIndex] === optionIndex &&
                    optionIndex !== question.correctAnswer)
                    optionButton.classList.add('incorrect');
            }

            optionButton.addEventListener('click', () => toggleSelectOption(optionIndex));
            optionsContainer.appendChild(optionButton);
        });

        currentQuestionElement.textContent = currentQuestionIndex + 1;
    }

    // Handles option selection toggling
    function toggleSelectOption(optionIndex) {
        if (quizCompleted) return;

        if (selectedAnswers[currentQuestionIndex] === optionIndex) {
            selectedAnswers[currentQuestionIndex] = null;
            showQuestion();
            return;
        }

        selectedAnswers[currentQuestionIndex] = optionIndex;
        showQuestion();
    }

    // Controls visibility and state of navigation buttons
    function updateNavigationButtons() {
        prevBtn.disabled = currentQuestionIndex === 0;

        if (currentQuestionIndex === shuffledQuestions.length - 1) {
            nextBtn.classList.add('hidden');

            if (quizCompleted && !resultModal.classList.contains('active')) {
                submitBtn.classList.add('hidden');
                reviewTryAgainBtn.classList.remove('hidden');
            } else {
                reviewTryAgainBtn.classList.add('hidden');
                submitBtn.classList.remove('hidden');
            }
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
            reviewTryAgainBtn.classList.add('hidden');
        }
    }

    // Moves to next question
    function nextQuestion() {
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
            updateNavigationButtons();
        }
    }

    // Moves to previous question
    function prevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
            updateNavigationButtons();
        }
    }

    // Calculates total score based on correct answers
    function calculateScore() {
        score = 0;
        shuffledQuestions.forEach((q, i) => {
            if (selectedAnswers[i] === q.correctAnswer) score++;
        });
        scoreElement.textContent = score;
        return score;
    }

    // Displays final result modal with comments
    function showResults() {
        quizCompleted = true;
        clearInterval(timer);
        const finalScore = calculateScore();
        finalScoreElement.textContent = `You scored ${finalScore} out of ${shuffledQuestions.length}`;
        const percentage = (finalScore / shuffledQuestions.length) * 100;

        let comment;
        if (percentage >= 80) comment = "Excellent work! You really know your stuff!";
        else if (percentage >= 60) comment = "Good job! You're on the right track!";
        else if (percentage >= 40) comment = "Not bad! Keep learning and you'll improve!";
        else comment = "Keep practicing! Review the questions and try again!";

        performanceCommentElement.textContent = comment;
        resultModal.classList.add('active');
    }

    // Starts countdown timer
    function startTimer() {
        clearInterval(timer);
        timer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timer);
                showResults();
            } else {
                timeLeft--;
                updateTimerDisplay();
            }
        }, 1000);
    }

    // Resets timer to default value
    function resetTimer() {
        clearInterval(timer);
        timeLeft = 300;
        updateTimerDisplay();
    }

    // Updates time display on screen
    function updateTimerDisplay() {
        const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
        const seconds = String(timeLeft % 60).padStart(2, '0');
        timerElement.textContent = `${minutes}:${seconds}`;
    }

    // Starts quiz from welcome screen
    function startQuiz() {
        startScreen.style.display = 'none';
        const quizBox = document.querySelector('.quiz-container');
        quizBox.classList.add('quiz-rise-again');
        initQuiz();
        startTimer();
    }

    // Restarts quiz for another attempt
    function restartQuiz() {
        initQuiz();
        startTimer();
    }

    // Button event listeners
    nextBtn.addEventListener('click', nextQuestion);
    prevBtn.addEventListener('click', prevQuestion);
    submitBtn.addEventListener('click', showResults);
    modalTryAgainBtn.addEventListener('click', restartQuiz);
    reviewTryAgainBtn.addEventListener('click', restartQuiz);
    startBtn.addEventListener('click', startQuiz);
    reviewBtn.addEventListener('click', () => {
        resultModal.classList.remove('active');
        quizCompleted = true;
        currentQuestionIndex = 0;
        showQuestion();
        updateNavigationButtons();
    });
});
