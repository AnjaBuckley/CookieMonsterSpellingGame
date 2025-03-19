/**
 * German vocabulary words for Cookie Monster's German Adventure
 * Each word has a translation and difficulty level
 */
const germanWords = [
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
    
    const randomIndex = Math.floor(Math.random() * wordList.length);
    return wordList[randomIndex];
}
