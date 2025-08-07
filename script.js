let mode = 'classic';
let countdownInterval = null;
let countdownTime = 60;

const gameBoard = document.getElementById('game-board');
const movesText = document.getElementById('moves');
const timerText = document.getElementById('timer');
const restartBtn = document.getElementById('restart');
const levelSelector = document.getElementById('level');
const bestText = document.getElementById('best');
const themeSelector = document.getElementById('theme');

// Add mode selector dynamically
const modeSelector = document.createElement('select');
modeSelector.id = 'mode';
modeSelector.innerHTML = `
  <option value="classic">🎮 Classic</option>
  <option value="countdown">⏱️ Countdown</option>
`;
document.querySelector('.difficulty').appendChild(modeSelector);

// Sound effects
const flipSound = new Audio('sounds/flip.mp3');
const matchSound = new Audio('sounds/match.mp3');
const winSound = new Audio('sounds/win.mp3');

// Themes
const themes = {
  food: ['🍕', '🍔', '🍟', '🌮', '🍩', '🍪', '🍿', '🥓', '🥞', '🧁', '🍉', '🍇'],
  pokemon: ['🔥', '💧', '🌱', '⚡', '🐉', '🧊', '🪨', '👻', '🌈', '🧠', '🦇', '🐾'],
  marvel: ['🦸', '🧤', '🕷️', '🛡️', '🧠', '☠️', '⚔️', '🚀', '🧪', '👊', '🌀', '💣'],
  animals: ['🐶', '🐱', '🐭', '🦁', '🐵', '🐼', '🐸', '🐰', '🐷', '🦊', '🐮', '🐨'],
};

let cards = [];
let cardArray = [];
let flippedCards = [];
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let timer;
let timeElapsed = 0;
let firstClick = false;

function shuffleCards() {
  cardArray = [...cards, ...cards];
  cardArray.sort(() => 0.5 - Math.random());
}

function createBoard() {
  gameBoard.innerHTML = '';
  shuffleCards();
  cardArray.forEach((emoji) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.innerText = '?';
    gameBoard.appendChild(card);
    card.addEventListener('click', () => flipCard(card));
  });
}

function flipCard(card) {
  if (lockBoard || card.classList.contains('flipped')) return;

  if (!firstClick) {
    startTimer();
    firstClick = true;
  }

  flipSound.currentTime = 0;
  flipSound.play();

  card.innerText = card.dataset.emoji;
  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    movesText.innerText = `Moves: ${moves}`;
    checkMatch();
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;

  if (card1.dataset.emoji === card2.dataset.emoji) {
    matchedPairs++;
    flippedCards = [];

    matchSound.currentTime = 0;
    matchSound.play();

    if (matchedPairs === cards.length) {
      stopTimer();
      clearInterval(countdownInterval);
      setTimeout(() => {
        winSound.play();
        alert(`🎉 You won in ${moves} moves and ${timeElapsed} seconds!`);
        updateBestScore();
      }, 400);
    }
  } else {
    lockBoard = true;
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      card1.innerText = '?';
      card2.innerText = '?';
      flippedCards = [];
      lockBoard = false;
    }, 1000);
  }
}

function startTimer() {
  if (mode === 'classic') {
    timer = setInterval(() => {
      timeElapsed++;
      timerText.innerText = `Time: ${timeElapsed}s`;
    }, 1000);
  } else if (mode === 'countdown') {
    countdownTime = 60;
    timerText.innerText = `⏳ Time Left: ${countdownTime}s`;
    countdownInterval = setInterval(() => {
      countdownTime--;
      timerText.innerText = `⏳ Time Left: ${countdownTime}s`;
      if (countdownTime <= 0) {
        clearInterval(countdownInterval);
        lockBoard = true;
        alert('⏰ Time’s up! You lost.');
      }
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(timer);
}

function updateBestScore() {
  let best = localStorage.getItem('memory-best');
  if (!best || timeElapsed < best) {
    localStorage.setItem('memory-best', timeElapsed);
    bestText.innerText = `Best: ${timeElapsed}s`;
  } else {
    bestText.innerText = `Best: ${best}s`;
  }
}

function resetGame() {
  mode = modeSelector.value;

  let level = levelSelector.value;
  let theme = themeSelector.value;
  let emojis = themes[theme];

  if (level === 'easy') {
    cards = emojis.slice(0, 8);
    gameBoard.style.gridTemplateColumns = 'repeat(4, 100px)';
  } else {
    cards = emojis.slice(0, 18);
    gameBoard.style.gridTemplateColumns = 'repeat(6, 100px)';
  }

  moves = 0;
  matchedPairs = 0;
  timeElapsed = 0;
  countdownTime = 60;
  firstClick = false;
  flippedCards = [];
  lockBoard = false;
  movesText.innerText = `Moves: 0`;
  timerText.innerText = mode === 'classic' ? `Time: 0s` : `⏳ Time Left: 60s`;
  stopTimer();
  clearInterval(countdownInterval);
  createBoard();

  let best = localStorage.getItem('memory-best');
  bestText.innerText = best ? `Best: ${best}s` : 'Best: -';
}

// Theme and Mode Listeners
themeSelector.addEventListener('change', resetGame);
modeSelector.addEventListener('change', resetGame);
levelSelector.addEventListener('change', resetGame);
restartBtn.addEventListener('click', resetGame);

// Dark mode toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const mode = document.body.classList.contains('dark') ? 'Dark' : 'Light';
  themeToggle.innerText = mode === 'Dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => console.log("✅ Service Worker registered!", reg))
      .catch((err) => console.log("❌ SW registration failed", err));
  });
}

resetGame();
