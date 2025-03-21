/**
 * German vocabulary words for Cookie Monster's German Adventure
 * Includes both static vocabulary and OpenAI-generated vocabulary
 */

// Static fallback vocabulary
const staticGermanWords = [
    // Level 1 - Easy words (3-4 letters)
    { 
        word: "HUND", 
        translation: "dog", 
        difficulty: 1 
    },
    { 
        word: "KATZE", 
        translation: "cat", 
        difficulty: 1 
    },
    { 
        word: "HAUS", 
        translation: "house", 
        difficulty: 1 
    },
    { 
        word: "BALL", 
        translation: "ball", 
        difficulty: 1 
    },
    { 
        word: "EINS", 
        translation: "one", 
        difficulty: 1 
    },
    { 
        word: "ZWEI", 
        translation: "two", 
        difficulty: 1 
    },
    { 
        word: "ROT", 
        translation: "red", 
        difficulty: 1 
    },
    { 
        word: "BLAU", 
        translation: "blue", 
        difficulty: 1 
    },
    
    // Level 2 - Medium words (5-6 letters)
    { 
        word: "APFEL", 
        translation: "apple", 
        difficulty: 2 
    },
    { 
        word: "MILCH", 
        translation: "milk", 
        difficulty: 2 
    },
    { 
        word: "GARTEN", 
        translation: "garden", 
        difficulty: 2 
    },
    { 
        word: "SCHULE", 
        translation: "school", 
        difficulty: 2 
    },
    { 
        word: "WASSER", 
        translation: "water", 
        difficulty: 2 
    },
    { 
        word: "BÄCKER", 
        translation: "baker", 
        difficulty: 2 
    },
    { 
        word: "FREUND", 
        translation: "friend", 
        difficulty: 2 
    },
    { 
        word: "KINDER", 
        translation: "children", 
        difficulty: 2 
    },
    
    // Level 3 - Harder words (7+ letters)
    { 
        word: "GUMMIBÄR", 
        translation: "gummy bear", 
        difficulty: 3 
    },
    { 
        word: "SCHOKOLADE", 
        translation: "chocolate", 
        difficulty: 3 
    },
    { 
        word: "SPIELPLATZ", 
        translation: "playground", 
        difficulty: 3 
    },
    { 
        word: "GEBURTSTAG", 
        translation: "birthday", 
        difficulty: 3 
    },
    { 
        word: "KEKSE", 
        translation: "cookies", 
        difficulty: 3 
    },
    { 
        word: "TEDDYBÄR", 
        translation: "teddy bear", 
        difficulty: 3 
    },
    { 
        word: "FRÜHSTÜCK", 
        translation: "breakfast", 
        difficulty: 3 
    },
    { 
        word: "REGENBOGEN", 
        translation: "rainbow", 
        difficulty: 3 
    }
];

// Dynamic vocabulary from OpenAI API
let dynamicGermanWords = [];
let isUsingDynamicWords = false;

// Combined vocabulary
let germanWords = [...staticGermanWords];

// Make variables and functions available globally
window.staticGermanWords = staticGermanWords;
window.dynamicGermanWords = dynamicGermanWords;
window.isUsingDynamicWords = isUsingDynamicWords;
window.germanWords = germanWords;
window.getRandomWord = getRandomWord;
window.getWordsByDifficulty = getWordsByDifficulty;
window.toggleVocabularyMode = toggleVocabularyMode;
window.loadDynamicVocabulary = loadDynamicVocabulary;

/**
 * Load vocabulary from server
 * @param {number} countPerDifficulty - Number of words to generate per difficulty level
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
async function loadDynamicVocabulary(countPerDifficulty = 5) {
    try {
        // Show loading message
        updateGameMessage('Generating new German vocabulary...');
        
        // Clear previous dynamic words
        dynamicGermanWords = [];
        
        // Generate words for each difficulty level
        for (let difficulty = 1; difficulty <= 3; difficulty++) {
            const response = await fetch('/api/generate-vocabulary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    count: countPerDifficulty,
                    difficulty: difficulty
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate vocabulary');
            }
            
            const words = await response.json();
            dynamicGermanWords = [...dynamicGermanWords, ...words];
        }
        
        // Update the combined vocabulary
        germanWords = [...dynamicGermanWords];
        isUsingDynamicWords = true;
        
        // Update game message
        updateGameMessage('New vocabulary loaded! Ready to play!');
        console.log(`Loaded ${dynamicGermanWords.length} dynamic vocabulary words`);
        
        return true;
    } catch (error) {
        console.error('Failed to load dynamic vocabulary:', error);
        
        // Fallback to static vocabulary
        germanWords = [...staticGermanWords];
        isUsingDynamicWords = false;
        
        // Update game message
        updateGameMessage('Could not load new vocabulary. Using built-in words.');
        
        return false;
    }
}

/**
 * Toggle between static and dynamic vocabulary
 * @returns {boolean} - Whether now using dynamic vocabulary
 */
function toggleVocabularyMode() {
    if (dynamicGermanWords.length === 0) {
        console.log('No dynamic vocabulary available');
        return false;
    }
    
    isUsingDynamicWords = !isUsingDynamicWords;
    germanWords = isUsingDynamicWords ? [...dynamicGermanWords] : [...staticGermanWords];
    
    console.log(`Switched to ${isUsingDynamicWords ? 'dynamic' : 'static'} vocabulary`);
    return isUsingDynamicWords;
}

/**
 * Update the game message (defined in game.js)
 */
function updateGameMessage(message) {
    // This function is expected to be defined in game.js
    if (typeof messageBox !== 'undefined' && messageBox) {
        messageBox.textContent = message;
    } else {
        console.log('Game message:', message);
    }
}

// Function to get words of a specific difficulty
function getWordsByDifficulty(difficulty) {
    return germanWords.filter(word => word.difficulty === difficulty);
}

// Function to get a random word from the list
function getRandomWord(difficulty = null) {
    let wordList = germanWords;
    
    if (difficulty !== null) {
        wordList = getWordsByDifficulty(difficulty);
    }
    
    // Fallback to all words if no words found for the given difficulty
    if (wordList.length === 0) {
        wordList = germanWords;
        console.warn(`No words found for difficulty ${difficulty}, using all words`);
    }
    
    const randomIndex = Math.floor(Math.random() * wordList.length);
    return wordList[randomIndex];
}
