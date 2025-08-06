// Generate mock messages for pagination
export const generateMockMessages = (count = 10, page = 1) => {
  const messages = []
  const baseTime = new Date()
  baseTime.setHours(baseTime.getHours() - (page * 2)) // Go back in time for older messages
  
  const sampleMessages = [
    "What's the weather like today?",
    "Can you help me with a coding problem?",
    "I'm working on a new project and need some advice.",
    "How do you implement authentication in React?",
    "What are the best practices for state management?",
    "Can you explain how async/await works?",
    "I'm having trouble with CSS grid layout.",
    "What's the difference between React and Vue?",
    "How do I optimize my application's performance?",
    "Can you recommend some good development tools?",
    "I need help with database design.",
    "What are the latest trends in web development?",
    "How do I handle errors in JavaScript?",
    "Can you explain REST APIs?",
    "What's the best way to test React components?",
    "I'm learning TypeScript, any tips?",
    "How do I deploy my app to production?",
    "What's the difference between SQL and NoSQL?",
    "Can you help me understand algorithms?",
    "What are design patterns in programming?"
  ]
  
  const aiResponses = [
    "I'd be happy to help you with that! Let me break it down for you.",
    "That's a great question! Here's what I think about it.",
    "I understand your concern. Let me provide some guidance.",
    "Great point! I can definitely help you with that.",
    "That's an interesting challenge. Here's my approach to solving it.",
    "I see what you're getting at. Let me explain this concept.",
    "Excellent question! This is a common issue that many developers face.",
    "I appreciate you asking! Here's a comprehensive answer.",
    "That's a thoughtful inquiry. Let me walk you through this.",
    "I'm glad you brought this up! Here's what you need to know."
  ]
  
  for (let i = 0; i < count; i++) {
    const isUserMessage = Math.random() > 0.6 // 40% chance of user message
    const messageTime = new Date(baseTime.getTime() - (i * 300000)) // 5 minutes apart
    
    if (isUserMessage) {
      messages.push({
        id: `mock-${page}-${i}-user`,
        text: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
        sender: 'user',
        timestamp: messageTime.toISOString(),
        image: null
      })
    } else {
      messages.push({
        id: `mock-${page}-${i}-ai`,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: 'ai',
        timestamp: messageTime.toISOString(),
        image: null
      })
    }
  }
  
  return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}

// Generate loading skeleton items
export const generateSkeletonItems = (count = 5) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `skeleton-${index}`,
    type: 'skeleton'
  }))
}

// Mock API delay
export const mockApiDelay = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}