// Secure API integration via Netlify Functions
const API_BASE_URL = import.meta.env.DEV ? '' : '/.netlify/functions'
const IS_LOCAL_DEV = import.meta.env.DEV

export const callGeminiAPI = async (message, conversationHistory = [], images = []) => {
  // Use fake API in local development
  if (IS_LOCAL_DEV) {
    console.log('Using fake API for local development')
    const { generateAIResponse } = await import('./fakeAiApi')
    const fallbackResponse = await generateAIResponse(message, conversationHistory, images)
    
    return {
      success: true,
      text: fallbackResponse,
      isRealAPI: false,
      fallbackReason: 'Local development mode'
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/gemini-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        images
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      if (data.fallback) {
        // Server suggested fallback
        throw new Error(data.error)
      }
      throw new Error(data.error || `Server error: ${response.status}`)
    }

    return {
      success: true,
      text: data.text,
      isRealAPI: data.isRealAPI
    }

  } catch (error) {
    console.error('Secure API Error:', error)
    
    // Fallback to fake API if server fails
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
  // Use fake streaming in local development
  if (IS_LOCAL_DEV) {
    console.log('Using fake streaming for local development')
    return await streamFakeResponse(message, conversationHistory, images, onChunk)
  }

  try {
    // For now, use the regular secure API and simulate streaming
    // Real streaming would require WebSockets or Server-Sent Events
    const response = await fetch(`${API_BASE_URL}/gemini-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        images
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      if (data.fallback) {
        // Server suggested fallback
        throw new Error(data.error)
      }
      throw new Error(data.error || `Server error: ${response.status}`)
    }

    // Simulate streaming by sending the response character by character
    const fullText = data.text
    for (let i = 0; i < fullText.length; i++) {
      const char = fullText[i]
      if (onChunk) {
        onChunk(char)
      }
      
      // Add realistic delays
      let delay = 20 + Math.random() * 40
      if (['.', '!', '?'].includes(char)) {
        delay = 100 + Math.random() * 100
      } else if ([',', ';', ':'].includes(char)) {
        delay = 50 + Math.random() * 50
      } else if (char === ' ') {
        delay = 30 + Math.random() * 30
      } else if (char === '\n') {
        delay = 80 + Math.random() * 80
      }
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    return {
      success: true,
      text: fullText,
      isRealAPI: data.isRealAPI
    }

  } catch (error) {
    console.error('Secure Streaming API Error:', error)
    
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