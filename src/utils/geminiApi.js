// Real Gemini API integration
const GEMINI_API_KEY =  'AIzaSyAZfRy66NEcrEkzn2X3fvqjoN-3-Iy-qmI'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export const callGeminiAPI = async (message, conversationHistory = [], images = []) => {
  try {
    // Format conversation history for Gemini API
    const contents = []
    
    // Add conversation history
    conversationHistory.forEach(msg => {
      const parts = [{ text: msg.text }]
      
      // Add images if they exist in conversation history
      if (msg.images && msg.images.length > 0) {
        msg.images.forEach(image => {
          if (image.src && image.src.startsWith('data:image/')) {
            // Extract base64 data and mime type
            const [mimeData, base64Data] = image.src.split(',')
            const mimeType = mimeData.split(':')[1].split(';')[0]
            
            parts.push({
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            })
          }
        })
      }
      
      contents.push({
        parts: parts,
        role: msg.sender === 'user' ? 'user' : 'model'
      })
    })
    
    // Add current user message with images
    const currentMessageParts = [{ text: message }]
    
    // Add current images if they exist
    if (images && images.length > 0) {
      images.forEach(image => {
        if (image.src && image.src.startsWith('data:image/')) {
          // Extract base64 data and mime type
          const [mimeData, base64Data] = image.src.split(',')
          const mimeType = mimeData.split(':')[1].split(';')[0]
          
          currentMessageParts.push({
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          })
        }
      })
    }
    
    contents.push({
      parts: currentMessageParts,
      role: 'user'
    })

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
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Gemini API Error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return {
        success: true,
        text: data.candidates[0].content.parts[0].text,
        isRealAPI: true
      }
    } else {
      throw new Error('Invalid response format from Gemini API')
    }

  } catch (error) {
    console.error('Gemini API Error:', error)
    
    // Fallback to fake API if real API fails
    const { generateAIResponse } = await import('./fakeAiApi')
    const fallbackResponse = await generateAIResponse(message, conversationHistory, images)
    
    return {
      success: true,
      text: fallbackResponse,
      isRealAPI: false,
      fallbackReason: error.message
    }
  }
}

// Function to get realistic typing duration based on response length
export const getTypingDuration = (responseLength) => {
  const baseTime = 400 // Reduced base time
  const wordsPerMinute = 500 // Faster typing speed
  const estimatedTime = (responseLength / 5) * (60000 / wordsPerMinute) // 5 chars per word average
  return Math.min(baseTime + estimatedTime, 1200) // Max 1.2 seconds
}