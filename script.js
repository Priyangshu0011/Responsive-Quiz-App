document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
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

    // Quiz Questions (10 questions)
    const quizQuestions = [
        {
            question: "Which language runs in a web browser?",
            options: ["Java", "C", "Python", "JavaScript"],
            correctAnswer: 3
        },
        {
            question: "What does CSS stand for?",
            options: ["Central Style Sheets", "Cascading Style Sheets", "Cascading Simple Sheets", "Cars SUVs Sailboats"],
            correctAnswer: 1
        },
        {
            question: "What does HTML stand for?",
            options: ["Hypertext Markup Language", "Hypertext Markdown Language", "Hyperloop Machine Language", "Helicopters Terminals Motorboats Lamborghinis"],
            correctAnswer: 0
        },
        {
            question: "Which year was JavaScript launched?",
            options: ["1996", "1995", "1994", "None of the above"],
            correctAnswer: 1
        },
        {
            question: "Which of these is not a JavaScript framework?",
            options: ["React", "Angular", "Vue", "Django"],
            correctAnswer: 3
        },
        {
            question: "What is the latest stable version of JavaScript as of 2023?",
            options: ["ES5", "ES6", "ES2022", "ES2023"],
            correctAnswer: 2
        },
        {
            question: "Which HTML tag is used for creating an ordered list?",
            options: ["<ul>", "<li>", "<ol>", "<list>"],
            correctAnswer: 2
        },
        {
            question: "What does API stand for?",
            options: ["Application Programming Interface", "Advanced Programming Interface", "Automated Program Interaction", "Application Process Integration"],
            correctAnswer: 0
        },
        {
            question: "Which CSS property is used to change text color?",
            options: ["text-color", "font-color", "color", "text-style"],
            correctAnswer: 2
        },
        {
            question: "What does DOM stand for?",
            options: ["Document Object Model", "Data Object Management", "Digital Output Mode", "Display Object Manipulation"],
            correctAnswer: 0
        }
    ];

    // Quiz State
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedAnswers = new Array(quizQuestions.length).fill(null);
    let quizCompleted = false;
    let shuffledQuestions = [];
    let optionShuffles = []; // Stores shuffle order for each question's options

    // Shuffle array function
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Initialize Quiz
    function initQuiz() {
        shuffledQuestions = shuffleArray([...quizQuestions]);
        // Create shuffle order for each question's options
        optionShuffles = shuffledQuestions.map(question => {
            const indices = question.options.map((_, index) => index);
            return shuffleArray(indices);
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
    }

    // Display Current Question with randomized options
    function showQuestion() {
        const question = shuffledQuestions[currentQuestionIndex];
        questionText.textContent = question.question;
        
        optionsContainer.innerHTML = '';
        const currentShuffle = optionShuffles[currentQuestionIndex];
        
        currentShuffle.forEach((optionIndex, displayIndex) => {
            const option = question.options[optionIndex];
            const optionButton = document.createElement('button');
            optionButton.classList.add('option-btn');
            optionButton.textContent = option;
            
            if (selectedAnswers[currentQuestionIndex] === optionIndex) {
                optionButton.classList.add('selected');
            }
            
            if (quizCompleted) {
                if (optionIndex === question.correctAnswer) {
                    optionButton.classList.add('correct');
                } else if (selectedAnswers[currentQuestionIndex] === optionIndex && 
                          optionIndex !== question.correctAnswer) {
                    optionButton.classList.add('incorrect');
                }
            }
            
            optionButton.addEventListener('click', () => selectOption(optionIndex));
            optionsContainer.appendChild(optionButton);
        });
        
        currentQuestionElement.textContent = currentQuestionIndex + 1;
    }

    // Handle Option Selection
    function selectOption(optionIndex) {
        if (quizCompleted) return;
        
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedButton = [...optionsContainer.children].find(
            btn => btn.textContent === shuffledQuestions[currentQuestionIndex].options[optionIndex]
        );
        if (selectedButton) {
            selectedButton.classList.add('selected');
        }
        selectedAnswers[currentQuestionIndex] = optionIndex;
    }

    // Update Navigation Buttons State
    function updateNavigationButtons() {
        prevBtn.disabled = currentQuestionIndex === 0;
        
        if (currentQuestionIndex === shuffledQuestions.length - 1) {
            nextBtn.classList.add('hidden');
            if (quizCompleted) {
                submitBtn.classList.add('hidden');
                reviewTryAgainBtn.classList.remove('hidden');
            } else {
                submitBtn.classList.remove('hidden');
                reviewTryAgainBtn.classList.add('hidden');
            }
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
            reviewTryAgainBtn.classList.add('hidden');
        }
    }

    // Move to Next Question
    function nextQuestion() {
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
            updateNavigationButtons();
        }
    }

    // Move to Previous Question
    function prevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
            updateNavigationButtons();
        }
    }

    // Calculate and Display Final Score
    function calculateScore() {
        score = 0;
        shuffledQuestions.forEach((question, index) => {
            if (selectedAnswers[index] === question.correctAnswer) {
                score++;
            }
        });
        scoreElement.textContent = score;
        return score;
    }

    // Show Results Modal
    function showResults() {
        const finalScore = calculateScore();
        finalScoreElement.textContent = `You scored ${finalScore} out of ${shuffledQuestions.length}`;
        
        const percentage = (finalScore / shuffledQuestions.length) * 100;
        let comment = '';
        
        if (percentage >= 80) {
            comment = "Excellent work! You really know your stuff!";
        } else if (percentage >= 60) {
            comment = "Good job! You're on the right track!";
        } else if (percentage >= 40) {
            comment = "Not bad! Keep learning and you'll improve!";
        } else {
            comment = "Keep practicing! Review the questions and try again!";
        }
        
        performanceCommentElement.textContent = comment;
        resultModal.classList.add('active');
    }

    // Event Listeners
    nextBtn.addEventListener('click', nextQuestion);
    prevBtn.addEventListener('click', prevQuestion);
    submitBtn.addEventListener('click', () => {
        quizCompleted = true;
        showResults();
    });
    modalTryAgainBtn.addEventListener('click', initQuiz);
    reviewTryAgainBtn.addEventListener('click', initQuiz);
    reviewBtn.addEventListener('click', () => {
        resultModal.classList.remove('active');
        quizCompleted = true;
        currentQuestionIndex = 0;
        showQuestion();
        updateNavigationButtons();
    });

    // Initialize the quiz
    initQuiz();
});