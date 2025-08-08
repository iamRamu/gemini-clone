const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Rate limiting store (in production, use Redis or similar)
const requestCounts = new Map();
const RATE_LIMIT = 10; // requests per minute per IP
const RATE_WINDOW = 60 * 1000; // 1 minute

const checkRateLimit = (ip) => {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || [];
  
  // Remove old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  return true;
};

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
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

    // Validate API key
    if (!GEMINI_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    // Parse request body
    const { message, conversationHistory = [], images = [] } = JSON.parse(event.body);

    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Format conversation history for Gemini API
    const contents = [];
    
    // Add conversation history (limit to last 5 for performance)
    const limitedHistory = conversationHistory.slice(-5);
    limitedHistory.forEach(msg => {
      const parts = [{ text: msg.text }];
      
      if (msg.images && msg.images.length > 0) {
        msg.images.forEach(image => {
          if (image.src && image.src.startsWith('data:image/')) {
            const [mimeData, base64Data] = image.src.split(',');
            const mimeType = mimeData.split(':')[1].split(';')[0];
            
            parts.push({
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            });
          }
        });
      }
      
      contents.push({
        parts: parts,
        role: msg.sender === 'user' ? 'user' : 'model'
      });
    });
    
    // Add current user message
    const currentMessageParts = [{ text: message }];
    
    if (images && images.length > 0) {
      images.forEach(image => {
        if (image.src && image.src.startsWith('data:image/')) {
          const [mimeData, base64Data] = image.src.split(',');
          const mimeType = mimeData.split(':')[1].split(';')[0];
          
          currentMessageParts.push({
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          });
        }
      });
    }
    
    contents.push({
      parts: currentMessageParts,
      role: 'user'
    });

    // Call Gemini API
    const response = await fetch(GEMINI_API_URL, {
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
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', response.status, errorData);
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: 'AI service temporarily unavailable',
          fallback: true
        }),
      };
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          text: data.candidates[0].content.parts[0].text,
          isRealAPI: true
        }),
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid response format',
          fallback: true
        }),
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    
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