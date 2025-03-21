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
    movementDelay: 200,
    defaultMusicVolume: 0.5,
    broccoliCount: 1,  // Single broccoli that chases
    broccoliMoveDelay: 1000,  // How often broccoli moves (in ms)
    defaultWordsPerDifficulty: 5
};

// Game state
const gameState = {
    score: 0,
    currentWord: null,
    targetWord: '',
    collectedLetters: '',
    cookieMonsterPosition: { x: 0, y: 0 },
    letterPositions: [],
    broccoliPosition: null,  // Single broccoli position
    canMove: true,
    difficulty: CONFIG.initialDifficulty,
    musicPlaying: true,
    broccoliMoveTimer: null,  // Timer for broccoli movement
    isGameRunning: false
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

// Background music
const backgroundMusic = document.getElementById('background-music');
const toggleMusicButton = document.getElementById('toggle-music');
const musicIcon = document.getElementById('music-icon');
const volumeSlider = document.getElementById('volume-slider');

// Control buttons
const upButton = document.getElementById('up-btn');
const downButton = document.getElementById('down-btn');
const leftButton = document.getElementById('left-btn');
const rightButton = document.getElementById('right-btn');

// Additional DOM Elements for settings
const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const apiKeyInput = document.getElementById('api-key');
const saveApiKeyBtn = document.getElementById('save-api-key');
const generateVocabBtn = document.getElementById('generate-vocab');
const toggleVocabBtn = document.getElementById('toggle-vocab');
const wordCountInput = document.getElementById('word-count');
const apiStatus = document.getElementById('api-status');

// Additional DOM Elements
const startGameBtn = document.getElementById('start-game');
const stopGameBtn = document.getElementById('stop-game');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

/**
 * Initialize the game
 */
function initGame() {
    console.log('Initializing game...');
    
    // Make sure all DOM elements are available
    if (!gameBoard || !scoreDisplay || !currentWordDisplay || !wordTranslationDisplay || 
        !collectedLettersDisplay || !messageBox || !levelCompleteModal || 
        !completedWordDisplay || !wordMeaningDisplay || !nextWordButton ||
        !startGameBtn || !stopGameBtn) {
        console.error('Some game elements are missing from the DOM');
        return;
    }

    createGameBoard();
    setupEventListeners();
    setupBackgroundMusic();
    setupSettings();
    
    // Show initial message
    messageBox.textContent = 'Click "Start Game" to begin!';
}

/**
 * Set up background music
 */
function setupBackgroundMusic() {
    console.log("Setting up background music");
    
    // Set initial volume
    backgroundMusic.volume = CONFIG.defaultMusicVolume;
    volumeSlider.value = CONFIG.defaultMusicVolume;
    
    // Event for when the music is loaded
    backgroundMusic.addEventListener('canplaythrough', () => {
        console.log("Music loaded and ready to play");
    });
    
    // Event for if there's an error loading the music
    backgroundMusic.addEventListener('error', (e) => {
        console.error("Error loading music:", e);
        console.error("Music src:", backgroundMusic.src);
    });
    
    // Start playing the music with user interaction
    toggleMusicButton.addEventListener('click', toggleMusic);
    
    // Set up volume slider
    volumeSlider.addEventListener('input', () => {
        backgroundMusic.volume = volumeSlider.value;
    });
    
    // Try to autoplay (will likely be blocked by browsers)
    try {
        backgroundMusic.play()
            .then(() => {
                console.log("Music started playing");
                gameState.musicPlaying = true;
                musicIcon.textContent = '🔊';
            })
            .catch(error => {
                console.log('Autoplay prevented:', error);
                gameState.musicPlaying = false;
                musicIcon.textContent = '🔇';
                toggleMusicButton.classList.add('muted');
            });
    } catch (error) {
        console.log('Error trying to play music:', error);
        gameState.musicPlaying = false;
        musicIcon.textContent = '🔇';
        toggleMusicButton.classList.add('muted');
    }
}

/**
 * Toggle background music play/pause
 */
function toggleMusic() {
    console.log("Toggle music called. Current state:", gameState.musicPlaying);
    
    if (gameState.musicPlaying) {
        backgroundMusic.pause();
        musicIcon.textContent = '🔇';
        toggleMusicButton.classList.add('muted');
        gameState.musicPlaying = false;
        console.log("Music paused");
    } else {
        // Make sure the file is loaded
        backgroundMusic.load();
        backgroundMusic.play()
            .then(() => {
                console.log("Music started playing");
                musicIcon.textContent = '🔊';
                toggleMusicButton.classList.remove('muted');
                gameState.musicPlaying = true;
            })
            .catch(error => {
                console.error("Failed to play music:", error);
                // Show error message to user
                messageBox.textContent = "Could not play music. Click again to retry.";
            });
    }
}

/**
 * Create the game board grid
 */
function createGameBoard() {
    console.log('Creating game board...');
    
    // Clear existing board
    while (gameBoard.firstChild) {
        gameBoard.removeChild(gameBoard.firstChild);
    }

    gameBoard.style.gridTemplateColumns = `repeat(${CONFIG.boardSize}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${CONFIG.boardSize}, 1fr)`;
    
    let cellCount = 0;
    for (let y = 0; y < CONFIG.boardSize; y++) {
        for (let x = 0; x < CONFIG.boardSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            gameBoard.appendChild(cell);
            cellCount++;
        }
    }
    console.log(`Created ${cellCount} cells in the game board`);
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Game controls
    startGameBtn.addEventListener('click', startGame);
    stopGameBtn.addEventListener('click', stopGame);
    
    // Keyboard controls (only active when game is running)
    document.addEventListener('keydown', (event) => {
        if (!gameState.isGameRunning) return;
        handleKeyPress(event);
    });
    
    // Button controls (only active when game is running)
    upButton.addEventListener('click', () => {
        if (gameState.isGameRunning) movePlayer(0, -1);
    });
    downButton.addEventListener('click', () => {
        if (gameState.isGameRunning) movePlayer(0, 1);
    });
    leftButton.addEventListener('click', () => {
        if (gameState.isGameRunning) movePlayer(-1, 0);
    });
    rightButton.addEventListener('click', () => {
        if (gameState.isGameRunning) movePlayer(1, 0);
    });
    
    // Next word button
    nextWordButton.addEventListener('click', () => {
        if (gameState.isGameRunning) {
            levelCompleteModal.style.display = 'none';
            startNewWord();
        }
    });
    
    // Difficulty buttons
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Only allow difficulty change when game is not running
            if (!gameState.isGameRunning) {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameState.difficulty = parseInt(btn.dataset.difficulty);
            }
        });
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
        case 'm':
            // Toggle music with M key
            toggleMusic();
            event.preventDefault();
            break;
    }
}

/**
 * Start a new word challenge
 */
function startNewWord() {
    console.log('Starting new word...');
    
    // Stop any existing broccoli movement
    if (gameState.broccoliMoveTimer) {
        clearInterval(gameState.broccoliMoveTimer);
        gameState.broccoliMoveTimer = null;
    }
    
    // Clear the board
    clearBoard();
    
    // Reset game state
    gameState.canMove = true;
    gameState.broccoliPosition = null;
    
    // Get a new random word
    gameState.currentWord = getRandomWord(gameState.difficulty);
    console.log('Selected word:', gameState.currentWord);
    
    gameState.targetWord = gameState.currentWord.word;
    gameState.collectedLetters = '';
    
    // Display the English translation instead of the German word
    currentWordDisplay.textContent = gameState.currentWord.translation.toUpperCase();
    
    // Don't show the German word - we're now asking the player to find it
    wordTranslationDisplay.textContent = '(Spell the German word!)';
    
    // Create letter slots
    createLetterSlots();
    
    // Place Cookie Monster
    console.log('Placing Cookie Monster...');
    placeCookieMonster();
    
    // Place letters on the board
    console.log('Placing letters...');
    placeLettersOnBoard();
    
    // Place broccoli obstacle
    console.log('Placing broccoli...');
    placeBroccoli();
    
    // Update message
    messageBox.textContent = 'Find the correct German spelling for this English word! Watch out for the angry broccoli!';
    console.log('New word setup complete');
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
    console.log('Cookie Monster position:', gameState.cookieMonsterPosition);
    
    const cell = getCellAtPosition(x, y);
    if (!cell) {
        console.error('Invalid cell position for Cookie Monster');
        return;
    }
    
    // Create Cookie Monster element
    const cookieMonster = document.createElement('div');
    cookieMonster.className = 'cookie-monster';
    
    // Create and add the image
    const cookieMonsterImg = document.createElement('img');
    cookieMonsterImg.src = 'cookie-monster.png';
    cookieMonsterImg.alt = 'Cookie Monster';
    cookieMonsterImg.className = 'cookie-monster-img';
    
    cookieMonster.appendChild(cookieMonsterImg);
    cell.appendChild(cookieMonster);
    console.log('Cookie Monster placed successfully');
}

/**
 * Place letters on the board as cookies
 */
function placeLettersOnBoard() {
    const word = gameState.targetWord;
    console.log('Placing letters for word:', word);
    
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
        } while (isPositionUsed(position, usedPositions));
        
        usedPositions.push(position);
        gameState.letterPositions.push({ letter: word[i], position, collected: false });
        
        const cell = getCellAtPosition(position.x, position.y);
        if (!cell) {
            console.error('Invalid cell position for letter:', word[i], position);
            continue;
        }
        
        const cookieLetter = document.createElement('div');
        cookieLetter.className = 'cookie-letter';
        cookieLetter.textContent = word[i];
        cookieLetter.dataset.letter = word[i];
        cookieLetter.dataset.index = i;
        
        cell.appendChild(cookieLetter);
        console.log('Placed letter:', word[i], 'at position:', position);
    }
    console.log('All letters placed');
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
    const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    if (!cell) {
        console.error('Could not find cell at position:', x, y);
    }
    return cell;
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
    
    // Check if there's a broccoli at the new position
    if (gameState.broccoliPosition && 
        gameState.broccoliPosition.x === newX && 
        gameState.broccoliPosition.y === newY) {
        handleBroccoliCatch();
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

/**
 * Place broccoli on the board
 */
function placeBroccoli() {
    // Start broccoli at the opposite corner from Cookie Monster
    const position = {
        x: gameState.cookieMonsterPosition.x === 0 ? CONFIG.boardSize - 1 : 0,
        y: gameState.cookieMonsterPosition.y === 0 ? CONFIG.boardSize - 1 : 0
    };
    
    gameState.broccoliPosition = position;
    
    const cell = getCellAtPosition(position.x, position.y);
    
    // Create broccoli container
    const broccoliContainer = document.createElement('div');
    broccoliContainer.className = 'broccoli-container';
    
    // Create broccoli
    const broccoli = document.createElement('div');
    broccoli.className = 'broccoli angry'; // Make it look angry since it's chasing
    
    // Create broccoli stem
    const stem = document.createElement('div');
    stem.className = 'broccoli-stem';
    broccoli.appendChild(stem);
    
    // Create broccoli head
    const head = document.createElement('div');
    head.className = 'broccoli-head';
    broccoli.appendChild(head);
    
    // Create broccoli eyes
    const eyes = document.createElement('div');
    eyes.className = 'broccoli-eyes';
    
    const leftEye = document.createElement('div');
    leftEye.className = 'broccoli-eye left';
    eyes.appendChild(leftEye);
    
    const rightEye = document.createElement('div');
    rightEye.className = 'broccoli-eye right';
    eyes.appendChild(rightEye);
    
    broccoli.appendChild(eyes);
    broccoliContainer.appendChild(broccoli);
    cell.appendChild(broccoliContainer);
    
    // Start broccoli movement
    startBroccoliMovement();
}

/**
 * Move broccoli towards Cookie Monster
 */
function moveBroccoli() {
    if (!gameState.broccoliPosition) return;
    
    // Calculate direction to move (simple chase AI)
    const dx = Math.sign(gameState.cookieMonsterPosition.x - gameState.broccoliPosition.x);
    const dy = Math.sign(gameState.cookieMonsterPosition.y - gameState.broccoliPosition.y);
    
    // Choose horizontal or vertical movement based on which gets closer
    const moveHorizontal = Math.abs(gameState.cookieMonsterPosition.x - gameState.broccoliPosition.x) > 
                          Math.abs(gameState.cookieMonsterPosition.y - gameState.broccoliPosition.y);
    
    const newX = gameState.broccoliPosition.x + (moveHorizontal ? dx : 0);
    const newY = gameState.broccoliPosition.y + (!moveHorizontal ? dy : 0);
    
    // Check if move is valid
    if (newX < 0 || newX >= CONFIG.boardSize || newY < 0 || newY >= CONFIG.boardSize) {
        return;
    }
    
    // Check if new position has a letter
    const newCell = getCellAtPosition(newX, newY);
    if (newCell.querySelector('.cookie-letter')) {
        return;
    }
    
    // Move broccoli
    const oldCell = getCellAtPosition(gameState.broccoliPosition.x, gameState.broccoliPosition.y);
    const broccoliElement = oldCell.querySelector('.broccoli-container');
    oldCell.removeChild(broccoliElement);
    newCell.appendChild(broccoliElement);
    
    // Update position
    gameState.broccoliPosition = { x: newX, y: newY };
    
    // Check if caught Cookie Monster
    if (newX === gameState.cookieMonsterPosition.x && newY === gameState.cookieMonsterPosition.y) {
        handleBroccoliCatch();
    }
}

/**
 * Start broccoli movement timer
 */
function startBroccoliMovement() {
    if (gameState.broccoliMoveTimer) {
        clearInterval(gameState.broccoliMoveTimer);
    }
    gameState.broccoliMoveTimer = setInterval(moveBroccoli, CONFIG.broccoliMoveDelay);
}

/**
 * Handle when broccoli catches Cookie Monster
 */
function handleBroccoliCatch() {
    errorSound.play();
    messageBox.textContent = 'Oh no! The broccoli caught Cookie Monster!';
    gameState.canMove = false;
    
    // Stop broccoli movement
    if (gameState.broccoliMoveTimer) {
        clearInterval(gameState.broccoliMoveTimer);
    }
    
    // Restart the current word after a delay
    setTimeout(() => {
        startNewWord();
    }, 2000);
}

/**
 * Set up settings panel and vocabulary generation
 */
function setupSettings() {
    // Settings toggle
    settingsToggle.addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
    });
    
    // Generate new vocabulary
    generateVocabBtn.addEventListener('click', async () => {
        const wordsPerDifficulty = parseInt(wordCountInput.value) || CONFIG.defaultWordsPerDifficulty;
        
        generateVocabBtn.disabled = true;
        showApiStatus('Generating new vocabulary...');
        
        try {
            // Generate words for each difficulty level
            const allWords = [];
            for (let difficulty = 1; difficulty <= 3; difficulty++) {
                const response = await fetch('/api/generate-vocabulary', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        count: wordsPerDifficulty,
                        difficulty: difficulty
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to generate vocabulary');
                }
                
                const words = await response.json();
                allWords.push(...words);
            }
            
            // Update the vocabulary
            dynamicGermanWords = allWords;
            germanWords = [...dynamicGermanWords];
            isUsingDynamicWords = true;
            
            showApiStatus('New vocabulary generated successfully!');
            startNewWord(); // Start a new word with the new vocabulary
            
        } catch (error) {
            console.error('Error generating vocabulary:', error);
            showApiStatus('Failed to generate vocabulary. Using built-in words.', true);
            
            // Fallback to static vocabulary
            germanWords = [...staticGermanWords];
            isUsingDynamicWords = false;
            
        } finally {
            generateVocabBtn.disabled = false;
        }
    });
    
    // Toggle vocabulary mode
    toggleVocabBtn.addEventListener('click', () => {
        const isUsingDynamic = toggleVocabularyMode();
        toggleVocabBtn.textContent = isUsingDynamic ? 'Use Static Words' : 'Use Dynamic Words';
        showApiStatus(`Switched to ${isUsingDynamic ? 'dynamic' : 'static'} vocabulary`);
        startNewWord(); // Start a new word with the selected vocabulary
    });
}

/**
 * Show status message in the settings panel
 */
function showApiStatus(message, isError = false) {
    apiStatus.textContent = message;
    apiStatus.className = 'api-status' + (isError ? ' error' : ' success');
}

/**
 * Start the game
 */
function startGame() {
    console.log('Starting game...');
    gameState.isGameRunning = true;
    gameState.score = 0;
    scoreDisplay.textContent = '0';
    
    // Update button states
    startGameBtn.disabled = true;
    stopGameBtn.disabled = false;
    
    // Disable difficulty selection
    difficultyBtns.forEach(btn => {
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    });
    
    // Start first word
    startNewWord();
}

/**
 * Stop the game
 */
function stopGame() {
    console.log('Stopping game...');
    gameState.isGameRunning = false;
    
    // Clear the board
    clearBoard();
    
    // Stop broccoli movement
    if (gameState.broccoliMoveTimer) {
        clearInterval(gameState.broccoliMoveTimer);
        gameState.broccoliMoveTimer = null;
    }
    
    // Update button states
    startGameBtn.disabled = false;
    stopGameBtn.disabled = true;
    
    // Enable difficulty selection
    difficultyBtns.forEach(btn => {
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    });
    
    // Show game over message
    messageBox.textContent = `Game Over! Final Score: ${gameState.score}`;
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    setTimeout(initGame, 100); // Small delay to ensure all resources are loaded
});
