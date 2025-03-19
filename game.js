/**
 * Cookie Monster's German Adventure
 * Main game logic for the language learning game
 */

// Game configuration
const CONFIG = {
    boardSize: 8,
    initialDifficulty: 1,
    pointsPerLetter: 10,
    wordCompletionBonus: 50,
    movementDelay: 200
};

// Game state
const gameState = {
    score: 0,
    currentWord: null,
    targetWord: '',
    collectedLetters: '',
    cookieMonsterPosition: { x: 0, y: 0 },
    letterPositions: [],
    canMove: true,
    difficulty: CONFIG.initialDifficulty
};

// DOM Elements
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const currentWordDisplay = document.getElementById('current-word');
const wordTranslationDisplay = document.getElementById('word-translation');
const collectedLettersDisplay = document.getElementById('collected-letters');
const messageBox = document.getElementById('message-box');
const levelCompleteModal = document.getElementById('level-complete');
const completedWordDisplay = document.getElementById('completed-word');
const wordMeaningDisplay = document.getElementById('word-meaning');
const nextWordButton = document.getElementById('next-word-btn');

// Sound effects
const nomSound = document.getElementById('nom-sound');
const errorSound = document.getElementById('error-sound');
const completeSound = document.getElementById('complete-sound');

// Control buttons
const upButton = document.getElementById('up-btn');
const downButton = document.getElementById('down-btn');
const leftButton = document.getElementById('left-btn');
const rightButton = document.getElementById('right-btn');

/**
 * Initialize the game
 */
function initGame() {
    createGameBoard();
    setupEventListeners();
    startNewWord();
}

/**
 * Create the game board grid
 */
function createGameBoard() {
    gameBoard.style.gridTemplateColumns = `repeat(${CONFIG.boardSize}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${CONFIG.boardSize}, 1fr)`;
    
    for (let y = 0; y < CONFIG.boardSize; y++) {
        for (let x = 0; x < CONFIG.boardSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            gameBoard.appendChild(cell);
        }
    }
}

/**
 * Set up event listeners for keyboard and button controls
 */
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Button controls
    upButton.addEventListener('click', () => movePlayer(0, -1));
    downButton.addEventListener('click', () => movePlayer(0, 1));
    leftButton.addEventListener('click', () => movePlayer(-1, 0));
    rightButton.addEventListener('click', () => movePlayer(1, 0));
    
    // Next word button
    nextWordButton.addEventListener('click', () => {
        levelCompleteModal.style.display = 'none';
        startNewWord();
    });
}

/**
 * Handle keyboard controls
 */
function handleKeyPress(event) {
    if (!gameState.canMove) return;
    
    switch (event.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            event.preventDefault();
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            event.preventDefault();
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            event.preventDefault();
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            event.preventDefault();
            break;
    }
}

/**
 * Start a new word challenge
 */
function startNewWord() {
    // Clear the board
    clearBoard();
    
    // Get a new random word
    gameState.currentWord = getRandomWord(gameState.difficulty);
    gameState.targetWord = gameState.currentWord.word;
    gameState.collectedLetters = '';
    
    // Display the English translation instead of the German word
    currentWordDisplay.textContent = gameState.currentWord.translation.toUpperCase();
    
    // Don't show the German word - we're now asking the player to find it
    wordTranslationDisplay.textContent = '(Spell the German word!)';
    
    // Create letter slots
    createLetterSlots();
    
    // Place Cookie Monster
    placeCookieMonster();
    
    // Place letters on the board
    placeLettersOnBoard();
    
    // Update message
    messageBox.textContent = 'Find the correct German spelling for this English word!';
}

/**
 * Clear the game board
 */
function clearBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        while (cell.firstChild) {
            cell.removeChild(cell.firstChild);
        }
    });
}

/**
 * Create letter slots for tracking progress
 */
function createLetterSlots() {
    collectedLettersDisplay.innerHTML = '';
    
    for (let i = 0; i < gameState.targetWord.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'letter-slot';
        slot.dataset.index = i;
        collectedLettersDisplay.appendChild(slot);
    }
}

/**
 * Place Cookie Monster on the board
 */
function placeCookieMonster() {
    // Random starting position
    const x = Math.floor(Math.random() * CONFIG.boardSize);
    const y = Math.floor(Math.random() * CONFIG.boardSize);
    
    gameState.cookieMonsterPosition = { x, y };
    
    const cell = getCellAtPosition(x, y);
    
    const cookieMonster = document.createElement('div');
    cookieMonster.className = 'cookie-monster';
    
    const eyes = document.createElement('div');
    eyes.className = 'cookie-monster-eyes';
    
    const leftEye = document.createElement('div');
    leftEye.className = 'eye';
    
    const rightEye = document.createElement('div');
    rightEye.className = 'eye';
    
    eyes.appendChild(leftEye);
    eyes.appendChild(rightEye);
    cookieMonster.appendChild(eyes);
    
    cell.appendChild(cookieMonster);
}

/**
 * Place letters on the board as cookies
 */
function placeLettersOnBoard() {
    const word = gameState.targetWord;
    gameState.letterPositions = [];
    
    const usedPositions = [gameState.cookieMonsterPosition];
    
    // Place each letter of the word
    for (let i = 0; i < word.length; i++) {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * CONFIG.boardSize),
                y: Math.floor(Math.random() * CONFIG.boardSize)
            };
            // Make sure we don't place a letter where one already exists
        } while (isPositionUsed(position, usedPositions));
        
        usedPositions.push(position);
        gameState.letterPositions.push({ letter: word[i], position, collected: false });
        
        const cell = getCellAtPosition(position.x, position.y);
        const cookieLetter = document.createElement('div');
        cookieLetter.className = 'cookie-letter';
        cookieLetter.textContent = word[i];
        cookieLetter.dataset.letter = word[i];
        cookieLetter.dataset.index = i;
        
        cell.appendChild(cookieLetter);
    }
}

/**
 * Check if a position is already used
 */
function isPositionUsed(position, usedPositions) {
    return usedPositions.some(pos => pos.x === position.x && pos.y === position.y);
}

/**
 * Get a cell at a specific position
 */
function getCellAtPosition(x, y) {
    return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

/**
 * Move Cookie Monster in a direction
 */
function movePlayer(dx, dy) {
    if (!gameState.canMove) return;
    
    const newX = gameState.cookieMonsterPosition.x + dx;
    const newY = gameState.cookieMonsterPosition.y + dy;
    
    // Check if move is valid
    if (newX < 0 || newX >= CONFIG.boardSize || newY < 0 || newY >= CONFIG.boardSize) {
        return;
    }
    
    gameState.canMove = false;
    
    // Move Cookie Monster
    const oldCell = getCellAtPosition(gameState.cookieMonsterPosition.x, gameState.cookieMonsterPosition.y);
    const newCell = getCellAtPosition(newX, newY);
    
    const cookieMonster = oldCell.querySelector('.cookie-monster');
    oldCell.removeChild(cookieMonster);
    
    // Check if there's a letter at the new position
    const cookieLetter = newCell.querySelector('.cookie-letter');
    
    if (cookieLetter) {
        const letter = cookieLetter.dataset.letter;
        const letterIndex = parseInt(cookieLetter.dataset.index);
        
        // Check if this is the next letter we need
        if (gameState.collectedLetters.length === letterIndex) {
            // Collect the letter
            nomSound.play();
            newCell.removeChild(cookieLetter);
            
            // Update collected letters
            gameState.collectedLetters += letter;
            
            // Update the letter slot
            const slot = document.querySelector(`.letter-slot[data-index="${letterIndex}"]`);
            slot.textContent = letter;
            slot.classList.add('letter-collected');
            
            // Add points
            updateScore(CONFIG.pointsPerLetter);
            
            // Check if word is complete
            if (gameState.collectedLetters === gameState.targetWord) {
                setTimeout(completeWord, 500);
            } else {
                messageBox.textContent = 'Yum! Find the next letter!';
            }
        } else {
            // Wrong letter
            errorSound.play();
            messageBox.textContent = `Oops! Cookie Monster needs the letter "${gameState.targetWord[gameState.collectedLetters.length]}" next!`;
        }
    }
    
    // Place Cookie Monster at new position
    newCell.appendChild(cookieMonster);
    gameState.cookieMonsterPosition = { x: newX, y: newY };
    
    // Allow movement after a delay
    setTimeout(() => {
        gameState.canMove = true;
    }, CONFIG.movementDelay);
}

/**
 * Update the player's score
 */
function updateScore(points) {
    gameState.score += points;
    scoreDisplay.textContent = gameState.score;
    
    // Show score animation
    const scoreAnimation = document.createElement('div');
    scoreAnimation.textContent = `+${points}`;
    scoreAnimation.style.position = 'absolute';
    scoreAnimation.style.color = '#0078d7';
    scoreAnimation.style.fontWeight = 'bold';
    scoreAnimation.style.fontSize = '24px';
    scoreAnimation.style.top = `${scoreDisplay.getBoundingClientRect().top}px`;
    scoreAnimation.style.left = `${scoreDisplay.getBoundingClientRect().right + 10}px`;
    scoreAnimation.style.opacity = '1';
    scoreAnimation.style.transition = 'all 1s ease-out';
    
    document.body.appendChild(scoreAnimation);
    
    setTimeout(() => {
        scoreAnimation.style.transform = 'translateY(-20px)';
        scoreAnimation.style.opacity = '0';
    }, 50);
    
    setTimeout(() => {
        document.body.removeChild(scoreAnimation);
    }, 1000);
}

/**
 * Handle word completion
 */
function completeWord() {
    // Play completion sound
    completeSound.play();
    
    // Add bonus points
    updateScore(CONFIG.wordCompletionBonus);
    
    // Show completion modal
    completedWordDisplay.textContent = gameState.targetWord;
    wordMeaningDisplay.textContent = `(${gameState.currentWord.translation})`;
    levelCompleteModal.style.display = 'flex';
    
    // Adjust difficulty based on score
    if (gameState.score > 300) {
        gameState.difficulty = 3;
    } else if (gameState.score > 150) {
        gameState.difficulty = 2;
    }
}

// Initialize the game when the page loads
window.addEventListener('load', initGame);
