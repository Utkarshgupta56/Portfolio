// Netlify Function: /api/chat -> /.netlify/functions/chat

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing GROQ_API_KEY on server' }) };
  }

  try {
    const { message, history } = JSON.parse(event.body || '{}');
    if (!message || typeof message !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing message' }) };
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: "You are a concise assistant for Utkarsh's portfolio site. Be brief and helpful." },
          ...(Array.isArray(history) ? history : []),
          { role: 'user', content: message }
        ],
        temperature: 0.3
      })
    });

    const data = await groqRes.json();
    if (!groqRes.ok) {
      return { statusCode: groqRes.status, body: JSON.stringify({ error: data.error || 'Groq API error' }) };
    }

    const reply = data.choices?.[0]?.message?.content || '';
    return { statusCode: 200, body: JSON.stringify({ reply }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Upstream error', details: String(err) }) };
  }
};


