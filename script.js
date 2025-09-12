const quizData = [
  {
    audio: "./audio/01.mp3",
    artist: "Стас Михайлов",
    hint: "Без тебя, без тебя",
  },
  {
    audio: "./audio/02.mp3",
    artist: "Tito & Tarantula",
    hint: "Один из них как паук",
  },
  {
    audio: "./audio/03.mp3",
    artist: "David Guetta Kid Cudi",
    hint: "Самый популярный DJ и непонятный чувак",
  },
  {
    audio: "./audio/04.mp3",
    artist: "Santana Rob Thomas",
    hint: "Как сатана и еще один чувак",
  },
  {
    audio: "./audio/05.mp3",
    artist: "The Beloved",
    hint: "Всеми любимый",
  },
  {
    audio: "./audio/06.mp3",
    artist: "Patricia Kaas",
    hint: "Фамилия почти как у змеи из \"Книги джунглей\"",
  },
  {
    audio: "./audio/07.mp3",
    artist: "Johhny Hates Jazz",
    hint: "Тёзка Леннона не любит определённый жанр музыки",
  },
];

// DOM elements
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const feedbackScreen = document.getElementById("feedback-screen");
const resultsScreen = document.getElementById("results-screen");

const startBtn = document.getElementById("start-btn");
const submitBtn = document.getElementById("submit-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

const audioPlayer = document.getElementById("audio-player");
const answerInput = document.getElementById("answer-input");
const timeDisplay = document.getElementById("time");
const progressBar = document.getElementById("progress-bar");
const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("final-score");
const totalQuestionsDisplay = document.getElementById("total-questions");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackMessage = document.getElementById("feedback-message");
const correctAnswerDisplay = document.getElementById("correct-answer");
const attemptsDisplay = document.getElementById("attempts");
const hintBtn = document.getElementById("hint-btn");
const playbackStatus = document.getElementById("playback-status");

// Game state
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 0;
let totalTime = 0;
let timer;
let attemptsLeft = 3;
let isPlaying = false;
let audioFinished = false;
let randomizedQuestions = [];

// Initialize the game
function initGame() {
  startBtn.addEventListener("click", startGame);
  submitBtn.addEventListener("click", checkAnswer);
  nextBtn.addEventListener("click", nextQuestion);
  restartBtn.addEventListener("click", restartGame);
  hintBtn.addEventListener("click", showHint);
  answerInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      checkAnswer();
    }
  });
}

// Function to randomize the questions
function randomizeQuestions() {
  // Create a copy of the quizData array
  randomizedQuestions = [...quizData];
  
  // Fisher-Yates shuffle algorithm
  for (let i = randomizedQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomizedQuestions[i], randomizedQuestions[j]] = [randomizedQuestions[j], randomizedQuestions[i]];
  }
  
  return randomizedQuestions;
}

// Start the game
function startGame() {
  // Randomize the questions before starting
  randomizeQuestions();
  currentQuestionIndex = 0;
  score = 0;
  scoreDisplay.textContent = score;
  
  showScreen(gameScreen);
  loadQuestion();
}

// Load a question
function loadQuestion() {
  if (currentQuestionIndex >= randomizedQuestions.length) {
    showResults();
    return;
  }

  const question = randomizedQuestions[currentQuestionIndex];
  audioPlayer.src = question.audio;
  answerInput.value = "";
  attemptsLeft = 3;
  attemptsDisplay.textContent = attemptsLeft;
  hintBtn.style.visibility = "visible";
  audioFinished = false;

  // Reset timer values - will be set properly when audio loads
  timeLeft = 0;
  totalTime = 0;
  timeDisplay.textContent = "Loading...";
  progressBar.style.width = "0%";

  // Once audio is loaded, the loadedmetadata event will fire
  audioPlayer.load();
  
  // Auto-play the audio once it's loaded
  audioPlayer.oncanplaythrough = function() {
    audioPlayer.play();
    isPlaying = true;
    
    // If we still don't have the duration, set a default
    if (totalTime === 0) {
      totalTime = 30; // Default fallback if we can't get duration
      timeLeft = totalTime;
      timeDisplay.textContent = timeLeft;
    }
    
    startTimer();
  };

  // Add event listener to get audio duration once it's loaded
  audioPlayer.addEventListener('loadedmetadata', function() {
    if (audioPlayer.duration !== Infinity && audioPlayer.duration > 0) {
      // Set total time to audio duration + 10 seconds
      totalTime = Math.floor(audioPlayer.duration) + 10;
      timeLeft = totalTime;
      timeDisplay.textContent = timeLeft;
    }
  });
}

// Start the timer
function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      timeDisplay.textContent = timeLeft;
      progressBar.style.width = `${((totalTime - timeLeft) / totalTime) * 100}%`;
    } else if (timeLeft <= 0) {
      clearInterval(timer);
      handleTimeUp();
    }
  }, 1000);
}

// Handle when time is up
function handleTimeUp() {
  isPlaying = false;
  audioPlayer.pause();
  showFeedback(false, "Время вышло!");
}

// Check the answer
function checkAnswer() {
  // Allow checking answer even if audio has finished but time is still left
  if (timeLeft <= 0) return;

  const userAnswer = answerInput.value.trim().toLowerCase();
  const correctAnswer = randomizedQuestions[currentQuestionIndex].artist.toLowerCase();

  if (userAnswer === "") return;

  if (userAnswer === correctAnswer) {
    clearInterval(timer);
    isPlaying = false;
    audioPlayer.pause(); // Stop playback
    score++;
    scoreDisplay.textContent = score;
    showFeedback(true, "Верно!");
  } else {
    attemptsLeft--;
    attemptsDisplay.textContent = attemptsLeft;

    if (attemptsLeft <= 0) {
      clearInterval(timer);
      isPlaying = false;
      audioPlayer.pause(); // Stop playback
      showFeedback(false, "Неверно! Попытки закончились.");
    } else {
      // Show error but allow another try
      answerInput.value = "";
      answerInput.placeholder = "Попробуйте снова...";
      setTimeout(() => {
        answerInput.placeholder = "Введите исполнителя...";
      }, 1000);
    }
  }
}

// Show feedback
function showFeedback(isCorrect, message) {
  showScreen(feedbackScreen);
  feedbackTitle.textContent = isCorrect ? "Верно!" : "Неверно!";
  feedbackTitle.className = isCorrect ? "correct" : "incorrect";
  feedbackMessage.textContent = message;
  feedbackMessage.className = isCorrect ? "correct" : "incorrect";
  correctAnswerDisplay.textContent = randomizedQuestions[currentQuestionIndex].artist;
}

// Show hint
function showHint() {
  alert(`Hint: ${randomizedQuestions[currentQuestionIndex].hint}`);
  hintBtn.style.visibility = "hidden";
}

// Next question
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < randomizedQuestions.length) {
    showScreen(gameScreen);
    loadQuestion();
  } else {
    showResults();
  }
}

// Show results
function showResults() {
  showScreen(resultsScreen);
  finalScoreDisplay.textContent = score;
  totalQuestionsDisplay.textContent = randomizedQuestions.length;
}

// Restart game
function restartGame() {
  currentQuestionIndex = 0;
  score = 0;
  scoreDisplay.textContent = score;
  showScreen(startScreen);
}

// Show a specific screen
function showScreen(screen) {
  startScreen.style.display = "none";
  gameScreen.style.display = "none";
  feedbackScreen.style.display = "none";
  resultsScreen.style.display = "none";

  screen.style.display = "block";
}

// Initialize the game when the page loads
window.onload = initGame;