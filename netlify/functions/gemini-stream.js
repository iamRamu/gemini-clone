const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_STREAM_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse';

// Rate limiting store
const requestCounts = new Map();
const RATE_LIMIT = 5; // Lower limit for streaming
const RATE_WINDOW = 60 * 1000;

const checkRateLimit = (ip) => {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || [];
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  return true;
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Rate limiting
    const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      };
    }

    if (!GEMINI_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    const { message, conversationHistory = [], images = [] } = JSON.parse(event.body);

    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Format contents for Gemini API (same as regular function)
    const contents = [];
    
    const limitedHistory = conversationHistory.slice(-5);
    limitedHistory.forEach(msg => {
      const parts = [{ text: msg.text }];
      
      if (msg.images && msg.images.length > 0) {
        msg.images.forEach(image => {
          if (image.src && image.src.startsWith('data:image/')) {
            const [mimeData, base64Data] = image.src.split(',');
            const mimeType = mimeData.split(':')[1].split(';')[0];
            parts.push({
              inline_data: { mime_type: mimeType, data: base64Data }
            });
          }
        });
      }
      
      contents.push({
        parts: parts,
        role: msg.sender === 'user' ? 'user' : 'model'
      });
    });
    
    const currentMessageParts = [{ text: message }];
    
    if (images && images.length > 0) {
      images.forEach(image => {
        if (image.src && image.src.startsWith('data:image/')) {
          const [mimeData, base64Data] = image.src.split(',');
          const mimeType = mimeData.split(':')[1].split(';')[0];
          currentMessageParts.push({
            inline_data: { mime_type: mimeType, data: base64Data }
          });
        }
      });
    }
    
    contents.push({
      parts: currentMessageParts,
      role: 'user'
    });

    // Call streaming Gemini API
    const response = await fetch(GEMINI_STREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: 'AI service temporarily unavailable',
          fallback: true
        }),
      };
    }

    // Stream the response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedText = '';

    // For Netlify Functions, we can't actually stream, so we'll collect and return
    // In a real streaming setup, you'd need WebSockets or Server-Sent Events
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataContent = trimmedLine.substring(6).trim();
            if (dataContent === '[DONE]') break;

            try {
              const jsonData = JSON.parse(dataContent);
              if (jsonData.candidates?.[0]?.content?.parts?.[0]?.text) {
                accumulatedText += jsonData.candidates[0].content.parts[0].text;
              }
            } catch (parseError) {
              // Ignore parsing errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        text: accumulatedText,
        isRealAPI: true
      }),
    };

  } catch (error) {
    console.error('Streaming function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        fallback: true
      }),
    };
  }
};