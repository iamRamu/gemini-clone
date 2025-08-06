// Fake AI API responses for more realistic chat experience
const aiPersonalities = {
  helpful: [
    "I'd be happy to help you with that! Let me break it down step by step.",
    "Great question! Here's what I think about that topic.",
    "I understand what you're looking for. Let me provide some insights.",
    "That's an interesting perspective! Here's how I would approach it.",
    "I can definitely help you with that. Let me explain it clearly."
  ],
  creative: [
    "What a fascinating idea! Let me explore this creatively with you.",
    "I love where your mind is going with this! Here's an interesting angle.",
    "That sparks my imagination! Let me build on that thought.",
    "What an creative way to think about it! Here's my take.",
    "I'm inspired by your question! Let me share some creative insights."
  ],
  technical: [
    "From a technical standpoint, here's what I would recommend.",
    "Let me break down the technical aspects of this for you.",
    "That's a solid technical question. Here's the approach I'd suggest.",
    "Technically speaking, there are several ways to handle this.",
    "Great technical inquiry! Let me walk you through the solution."
  ],
  casual: [
    "Oh, that's a cool question! Here's what I'm thinking.",
    "Nice! I've got some thoughts on that for sure.",
    "Totally get what you mean! Here's my take on it.",
    "That's awesome you asked! Let me share what I know.",
    "Right on! I can definitely help you out with that."
  ]
}

const topicResponses = {
  greeting: [
    "Hello! Great to chat with you today. What's on your mind?",
    "Hi there! I'm here and ready to help with whatever you need.",
    "Hey! Welcome to our conversation. How can I assist you today?",
    "Hello! It's wonderful to meet you. What would you like to talk about?",
    "Hi! I'm excited to chat with you. What can I help you with?"
  ],
  technology: [
    "Technology is such an exciting field! There are always new innovations emerging.",
    "I love discussing tech topics! The pace of innovation is incredible these days.",
    "Technology continues to transform how we live and work in amazing ways.",
    "The world of technology offers endless possibilities for solving problems.",
    "Tech discussions are some of my favorites! There's always something new to explore."
  ],
  creative: [
    "Creativity is one of humanity's greatest gifts! I love exploring creative ideas.",
    "There's something magical about the creative process, don't you think?",
    "Creative thinking can lead to the most unexpected and wonderful solutions.",
    "I find creative projects so inspiring! They bring out the best in people.",
    "Art and creativity have this amazing power to connect us all."
  ],
  learning: [
    "Learning is a lifelong adventure! I'm always excited to explore new topics.",
    "There's nothing quite like the joy of discovering something new, is there?",
    "I believe learning should be fun and engaging. What interests you most?",
    "Every question is an opportunity to learn something fascinating!",
    "The best part about learning is how it opens up new ways of thinking."
  ],
  help: [
    "I'm here to help in any way I can! What specific challenge are you facing?",
    "Let's work through this together. I'm confident we can find a solution.",
    "No problem is too big or small. I'm here to support you!",
    "I love helping people solve problems. Let's tackle this step by step.",
    "You've come to the right place for help! I'm ready to assist."
  ]
}

// Function to detect topic from user message
function detectTopic(message) {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.match(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/)) {
    return 'greeting'
  }
  if (lowerMessage.match(/\b(tech|technology|computer|software|app|code|programming|ai|artificial intelligence)\b/)) {
    return 'technology'
  }
  if (lowerMessage.match(/\b(creative|art|design|music|writing|draw|paint|create)\b/)) {
    return 'creative'
  }
  if (lowerMessage.match(/\b(learn|study|education|teach|explain|understand|how)\b/)) {
    return 'learning'
  }
  if (lowerMessage.match(/\b(help|problem|issue|stuck|trouble|assist|support)\b/)) {
    return 'help'
  }
  
  return 'general'
}

// Function to detect personality based on message tone
function detectPersonality(message) {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.match(/\b(technical|code|algorithm|system|database|api|function)\b/)) {
    return 'technical'
  }
  if (lowerMessage.match(/\b(creative|artistic|imaginative|innovative|design)\b/)) {
    return 'creative'
  }
  if (lowerMessage.match(/\b(cool|awesome|nice|great|hey|yo)\b/)) {
    return 'casual'
  }
  
  return 'helpful'
}

// Main function to generate AI response
export const generateAIResponse = async (userMessage, conversationHistory = [], images = []) => {
  // Shorter API delay for better UX
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500))
  
  const topic = detectTopic(userMessage)
  const personality = detectPersonality(userMessage)
  
  let response = ''
  
  // Handle images if present
  if (images && images.length > 0) {
    const imageResponses = [
      `I can see you've shared ${images.length} image${images.length > 1 ? 's' : ''} with me. Let me analyze what I see.`,
      `Thanks for sharing the image${images.length > 1 ? 's' : ''}! I can help you understand or work with what you've shown me.`,
      `I notice you've uploaded ${images.length} image${images.length > 1 ? 's' : ''}. What would you like to know about ${images.length > 1 ? 'them' : 'it'}?`,
      `Great! I can see the image${images.length > 1 ? 's' : ''} you've shared. How can I help you with ${images.length > 1 ? 'them' : 'it'}?`,
      `I've received your image${images.length > 1 ? 's' : ''}. What specific questions do you have about what you've shown me?`
    ]
    response = imageResponses[Math.floor(Math.random() * imageResponses.length)]
    
    // Add context about the message if provided
    if (userMessage && userMessage.trim() && !userMessage.includes('image')) {
      response += ` Regarding your question: "${userMessage.trim()}" - I'd be happy to help!`
    }
  } else {
    // First try topic-specific responses
    if (topicResponses[topic]) {
      response = topicResponses[topic][Math.floor(Math.random() * topicResponses[topic].length)]
    } else {
      // Fall back to personality-based responses
      const personalityResponses = aiPersonalities[personality]
      response = personalityResponses[Math.floor(Math.random() * personalityResponses.length)]
    }
  }
  
  // Add contextual follow-up based on message length
  if (userMessage.length > 100) {
    const followUps = [
      " That's quite a detailed question you've asked!",
      " I appreciate you providing so much context.",
      " You've given me a lot to think about here.",
      " Thanks for the comprehensive question!"
    ]
    response += followUps[Math.floor(Math.random() * followUps.length)]
  }
  
  // Add conversation continuity
  if (conversationHistory.length > 3) {
    const continuity = [
      " Building on our earlier conversation,",
      " As we've been discussing,",
      " Following up on what we talked about,",
      " Continuing our chat,"
    ]
    if (Math.random() > 0.7) {
      response = continuity[Math.floor(Math.random() * continuity.length)] + " " + response.toLowerCase()
    }
  }
  
  return response
}

// Function to get typing indicator duration  
export const getTypingDuration = (messageLength) => {
  const baseTime = 500 // Reduced base time
  const extraTime = Math.min(messageLength * 20, 800) // Max 800ms extra, reduced multiplier
  return baseTime + extraTime + (Math.random() * 200) // Reduced random variance
}