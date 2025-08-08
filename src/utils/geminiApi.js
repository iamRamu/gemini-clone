// Real Gemini API integration
const GEMINI_API_KEY =  'AIzaSyAZfRy66NEcrEkzn2X3fvqjoN-3-Iy-qmI'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const GEMINI_STREAM_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse'

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

// Stream response function for typewriter effect
export const callGeminiAPIStream = async (message, conversationHistory = [], images = [], onChunk) => {
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
    })

    if (!response.ok) {
      throw new Error(`Gemini API Stream Error: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let accumulatedText = ''
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          
          if (trimmedLine.startsWith('data: ')) {
            const dataContent = trimmedLine.substring(6).trim()
            
            if (dataContent === '[DONE]') {
              break
            }
            
            try {
              const jsonData = JSON.parse(dataContent)
              
              if (jsonData.candidates?.[0]?.content?.parts?.[0]?.text) {
                const newText = jsonData.candidates[0].content.parts[0].text
                accumulatedText += newText
                if (onChunk) {
                  onChunk(newText)
                }
              }
            } catch (parseError) {
              console.log('Parse error for line:', dataContent, parseError)
              // Ignore parsing errors for incomplete JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return {
      success: true,
      text: accumulatedText,
      isRealAPI: true
    }

  } catch (error) {
    console.error('Gemini Stream API Error:', error)
    console.log('Falling back to fake streaming response')
    
    // Fallback to fake streaming response
    return await streamFakeResponse(message, conversationHistory, images, onChunk)
  }
}

// Fake streaming response for fallback
export const streamFakeResponse = async (message, conversationHistory = [], images = [], onChunk) => {
  const { generateAIResponse } = await import('./fakeAiApi')
  const fullResponse = await generateAIResponse(message, conversationHistory, images)
  
  // Simulate more realistic streaming by sending character chunks
  const characters = fullResponse.split('')
  
  for (let i = 0; i < characters.length; i++) {
    const char = characters[i]
    
    if (onChunk) {
      onChunk(char)
    }
    
    // Variable delays for more realistic typing
    let delay = 20 + Math.random() * 40 // Base delay 20-60ms
    
    // Longer delays for punctuation
    if (['.', '!', '?'].includes(char)) {
      delay = 100 + Math.random() * 100 // 100-200ms for sentence endings
    } else if ([',', ';', ':'].includes(char)) {
      delay = 50 + Math.random() * 50 // 50-100ms for pauses
    } else if (char === ' ') {
      delay = 30 + Math.random() * 30 // 30-60ms for spaces
    } else if (char === '\n') {
      delay = 80 + Math.random() * 80 // 80-160ms for line breaks
    }
    
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  return {
    success: true,
    text: fullResponse,
    isRealAPI: false
  }
}

// Function to get realistic typing duration based on response length
export const getTypingDuration = (responseLength) => {
  const baseTime = 400 // Reduced base time
  const wordsPerMinute = 500 // Faster typing speed
  const estimatedTime = (responseLength / 5) * (60000 / wordsPerMinute) // 5 chars per word average
  return Math.min(baseTime + estimatedTime, 1200) // Max 1.2 seconds
}