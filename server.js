// Simple proxy server for Groq Chat Completions
// Usage: GROQ_API_KEY=your_key node server.js

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // v2
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files (index.html, assets, etc.) from project root
app.use(express.static(path.join(__dirname)));

// Root route -> index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing message' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing GROQ_API_KEY' });
  }

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a concise assistant for Utkarsh\'s portfolio site. Be brief and helpful.' },
          ...(Array.isArray(history) ? history : []),
          { role: 'user', content: message }
        ],
        temperature: 0.3
      })
    });

    const data = await groqResponse.json();
    if (!groqResponse.ok) {
      return res.status(groqResponse.status).json({ error: data.error || 'Groq API error' });
    }

    const reply = data.choices?.[0]?.message?.content || '';
    return res.json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'Upstream error', details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


