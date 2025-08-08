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

// Generate contextual AI responses based on user input
const generateContextualResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase()
  
  // Direct question patterns
  if (lowerMessage.includes('what is') || lowerMessage.includes('what are')) {
    return `Great question! Based on what you're asking about, I can explain that this is a topic that involves multiple aspects. Let me break it down for you in a way that's easy to understand.`
  }
  
  if (lowerMessage.includes('how to') || lowerMessage.includes('how do') || lowerMessage.includes('how can')) {
    return `I'd be happy to help you with that! Here's a step-by-step approach you can follow: First, you'll want to understand the basics, then practice with simple examples, and gradually work your way up to more complex scenarios.`
  }
  
  if (lowerMessage.includes('why') || lowerMessage.includes('reason')) {
    return `That's an excellent question about the reasoning behind this. There are several factors that contribute to this, including historical context, practical considerations, and current best practices in the field.`
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
    return `I'm here to help! Based on what you've described, I can definitely assist you with this. Let's work through this together step by step.`
  }
  
  if (lowerMessage.includes('explain') || lowerMessage.includes('describe')) {
    return `I'd be glad to explain this concept to you. This is actually quite interesting and has several important components that work together to create the overall effect you're asking about.`
  }
  
  // Math/calculation related
  if (lowerMessage.match(/\d+/) && (lowerMessage.includes('+') || lowerMessage.includes('-') || lowerMessage.includes('*') || lowerMessage.includes('/') || lowerMessage.includes('calculate'))) {
    return `I can help you with this calculation! For mathematical problems like this, it's important to follow the proper order of operations and double-check our work.`
  }
  
  // Programming related
  if (lowerMessage.match(/\b(code|programming|javascript|python|html|css|react|function|variable|array|object)\b/)) {
    return `Great programming question! This involves some key concepts in software development. Let me walk you through the approach and best practices for handling this type of problem.`
  }
  
  // General knowledge
  if (lowerMessage.includes('tell me about') || lowerMessage.includes('information about')) {
    return `I'd be happy to share some information about this topic! This is actually quite fascinating and has some interesting aspects that many people find surprising.`
  }
  
  // Default contextual response
  return `Thanks for your question! I understand you're asking about this topic, and I think I can provide some helpful insights. Let me address the key points you've raised.`
}

// Main function to generate AI response
export const generateAIResponse = async (userMessage, conversationHistory = [], images = []) => {
  // Shorter API delay for better UX
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500))
  
  let response = ''
  
  // Handle images if present
  if (images && images.length > 0) {
    response = `I can see you've shared ${images.length} image${images.length > 1 ? 's' : ''} with me. `
    
    // Add context about the message if provided
    if (userMessage && userMessage.trim() && !userMessage.includes('image')) {
      response += `Regarding your question: "${userMessage.trim()}" - I'd be happy to analyze the image${images.length > 1 ? 's' : ''} and provide insights based on what I can see.`
    } else {
      response += `What specific questions do you have about what you've shown me?`
    }
  } else {
    // Generate contextual response based on user message
    response = generateContextualResponse(userMessage)
  }
  
  // Add some variety to responses
  const endings = [
    ' Feel free to ask if you need more clarification!',
    ' Let me know if you have any follow-up questions.',
    ' I hope this helps! Is there anything specific you\'d like me to elaborate on?',
    ' Would you like me to go deeper into any particular aspect?',
    ' Does this answer your question, or would you like more details?'
  ]
  
  // Add an ending occasionally
  if (Math.random() > 0.3) {
    response += endings[Math.floor(Math.random() * endings.length)]
  }
  
  // Add conversation continuity
  if (conversationHistory.length > 2) {
    const continuity = [
      'Building on what we discussed earlier, ',
      'Following up on our conversation, ',
      'As we continue our discussion, ',
      'To expand on our previous topic, '
    ]
    if (Math.random() > 0.7) {
      response = continuity[Math.floor(Math.random() * continuity.length)] + response.toLowerCase()
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