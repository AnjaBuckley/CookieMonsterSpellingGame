/**
 * Server for Cookie Monster's German Adventure
 * Handles serving static files and secure API key access
 */

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Load environment variables from .env file
dotenv.config();

// Check if OpenAI API key is available
if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key not found in environment variables');
    process.exit(1);
}

const app = express();
app.use(express.json()); // Add JSON body parsing

// Try to use the specified port or find an available one dynamically
const PORT = process.env.PORT || 3000;
const MAX_PORT_ATTEMPTS = 10;
let currentPort = PORT;

// Function to find an available port
const findAvailablePort = (startPort, maxAttempts) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const tryPort = (port) => {
      const testServer = require('http').createServer();
      
      testServer.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is in use, trying next port...`);
          if (attempts < maxAttempts) {
            attempts++;
            tryPort(port + 1);
          } else {
            reject(new Error(`Could not find an available port after ${maxAttempts} attempts`));
          }
        } else {
          reject(err);
        }
      });
      
      testServer.once('listening', () => {
        testServer.close(() => {
          resolve(port);
        });
      });
      
      testServer.listen(port);
    };
    
    tryPort(startPort);
  });
};

// Serve static files
app.use(express.static(path.join(__dirname)));

// API endpoint to generate vocabulary
app.post('/api/generate-vocabulary', async (req, res) => {
    try {
        const { count = 5, difficulty = 1 } = req.body;
        console.log(`Generating ${count} words for difficulty ${difficulty}`);
        
        // Convert difficulty to descriptive term
        const difficultyLevel = 
            difficulty === 1 ? "easy (3-4 letters)" : 
            difficulty === 2 ? "medium (5-6 letters)" : 
            "challenging (7+ letters)";

        const prompt = `Generate ${count} ${difficultyLevel} German vocabulary words with their English translations.
        Respond with a raw JSON array only, no markdown formatting, no code blocks, no additional text.
        Each word object must have exactly difficulty level ${difficulty} (not 4 or 5).
        Format:
        [{"word": "GERMAN_WORD", "translation": "english_translation", "difficulty": ${difficulty}}]
        Requirements:
        - All German words must be in ALL CAPS
        - Words must be appropriate for children's education
        - Difficulty must be exactly ${difficulty}
        - No markdown or code block formatting`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a direct assistant that returns only raw JSON arrays of German vocabulary words. No markdown, no explanations, no code blocks.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('OpenAI API error:', error);
            throw new Error(`OpenAI API request failed with status ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content;
        console.log('Raw OpenAI response:', content);
        
        // Clean up the response - remove any markdown or code block formatting
        content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
        
        try {
            const words = JSON.parse(content);
            
            // Validate the words
            const validWords = words.filter(word => {
                return word.word && 
                       word.translation && 
                       word.difficulty === difficulty && 
                       word.word === word.word.toUpperCase();
            });
            
            if (validWords.length === 0) {
                throw new Error('No valid words in the response');
            }
            
            console.log('Parsed and validated words:', validWords);
            res.json(validWords);
        } catch (parseError) {
            console.error('Failed to parse OpenAI response:', parseError);
            console.log('Cleaned response:', content);
            res.status(500).json({ error: 'Failed to parse vocabulary data' });
        }
    } catch (error) {
        console.error('Error generating vocabulary:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start the server with dynamic port finding
findAvailablePort(currentPort, MAX_PORT_ATTEMPTS)
  .then(availablePort => {
    const server = app.listen(availablePort, () => {
      console.log(`Server running at http://localhost:${availablePort}`);
    });

    // Add graceful shutdown handling
    process.on('SIGINT', () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
