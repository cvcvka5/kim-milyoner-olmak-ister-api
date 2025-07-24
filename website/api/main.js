const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Congtrol-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Load all questions from JSON file
let questions = [];
let audioQuestions = [];
let nonAudioQuestions = [];

try {
  // Use relative path for Vercel compatibility
  const dataPath = path.join(__dirname, 'milyonist_data.json');
  const data = fs.readFileSync(dataPath, 'utf8');
  questions = JSON.parse(data);
  
  // Pre-filter questions with and without audio
  audioQuestions = questions.filter(question => question.audio != null);
  nonAudioQuestions = questions.filter(question => question.audio == null);
} catch (error) {
  console.error('Error loading questions:', error);
}

// Helper function to filter questions
function filterQuestions(filters) {
  let chooseFrom = questions;

  // Filter by audio presence
  if (filters.audio !== undefined) {
    if (filters.audio === 'true' || filters.audio === true) {
      chooseFrom = audioQuestions;
    } else {
      chooseFrom = nonAudioQuestions;
    }
  }

  // Filter by nth question number
  if (filters.nth !== undefined) {
    const nth = parseInt(filters.nth);
    chooseFrom = chooseFrom.filter(q => q.contestant['nth-question'] === nth);
  }

  // Filter by contestant name (case insensitive)
  if (filters.contestant !== undefined) {
    chooseFrom = chooseFrom.filter(q => 
      q.contestant.name.toLowerCase().includes(filters.contestant.toLowerCase())
    );
  }

  // Filter by correctness
  if (filters.correct !== undefined) {
    const correct = filters.correct === 'true' || filters.correct === true;
    chooseFrom = chooseFrom.filter(q => q.contestant.correct === correct);
  }

  return chooseFrom;
}

// Random question endpoint
app.get('/api/random', (req, res) => {
  try {
    const filteredQuestions = filterQuestions(req.query);
    
    if (filteredQuestions.length === 0) {
      return res.status(422).json({
        error: 'No question found matching the filter criteria.'
      });
    }

    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    res.json(randomQuestion);
  } catch (error) {
    console.error('Error in /api/random:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Index-based question endpoint
app.get('/api/index', (req, res) => {
  try {
    const filteredQuestions = filterQuestions(req.query);
    
    if (req.query.index !== undefined) {
      const index = parseInt(req.query.index);
      
      if (index < 0 || index >= filteredQuestions.length) {
        return res.status(422).json({
          error: `The requested index is out of range for the filtered questions list. Max value: ${filteredQuestions.length - 1}`
        });
      }
      
      res.json(filteredQuestions[index]);
    } else {
      res.json(filteredQuestions);
    }
  } catch (error) {
    console.error('Error in /api/index:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    totalQuestions: questions.length,
    audioQuestions: audioQuestions.length,
    nonAudioQuestions: nonAudioQuestions.length
  });
});

// Handle root path
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kim Milyoner Olmak İster API',
    endpoints: {
      '/api/random': 'Get a random question with optional filters',
      '/api/index': 'Get question by index with optional filters',
      '/api/health': 'Health check endpoint'
    }
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// For Vercel serverless functions
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; 
