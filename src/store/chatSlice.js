import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { generateMockMessages } from '../utils/mockData'

// Async thunks
export const sendAIResponse = createAsyncThunk(
  'chat/sendAIResponse',
  async ({ chatroomId, userMessage }, { dispatch }) => {
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500))
    
    const aiResponses = [
      "That's an interesting question! Let me help you with that.",
      "I understand what you're asking. Here's my perspective on it.",
      "Great point! I think we can approach this from several angles.",
      "Thanks for sharing that. Let me provide some insights.",
      "I see what you mean. Here's what I would suggest.",
      "That's a thoughtful question. Let me break it down for you.",
      "Interesting! I'd be happy to help you explore this further.",
      "I appreciate you bringing this up. Here's my take on it."
    ]
    
    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
    
    const aiMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text: randomResponse,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      image: null
    }
    
    dispatch(addMessage({ chatroomId, message: aiMessage }))
    return aiMessage
  }
)

export const loadOlderMessages = createAsyncThunk(
  'chat/loadOlderMessages',
  async ({ chatroomId, page }) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const olderMessages = generateMockMessages(10, page)
    return { chatroomId, messages: olderMessages }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chatrooms: [],
    messages: {},
    activeChat: null,
    searchQuery: '',
    isTyping: false,
    loading: false
  },
  reducers: {
    createChatroom: (state, action) => {
      const title = action.payload || `Chat ${state.chatrooms.length + 1}`
      const newChatroom = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        createdAt: new Date().toISOString(),
        lastMessage: 'Chat created',
        lastMessageTime: new Date().toISOString()
      }
      
      state.chatrooms.unshift(newChatroom)
      state.messages[newChatroom.id] = []
      
      return newChatroom.id
    },
    
    deleteChatroom: (state, action) => {
      const chatroomId = action.payload
      state.chatrooms = state.chatrooms.filter(chat => chat.id !== chatroomId)
      delete state.messages[chatroomId]
      
      if (state.activeChat === chatroomId) {
        state.activeChat = null
      }
    },
    
    setActiveChat: (state, action) => {
      state.activeChat = action.payload
    },
    
    addMessage: (state, action) => {
      const { chatroomId, message } = action.payload
      
      const newMessage = {
        id: Math.random().toString(36).substr(2, 9),
        text: message.text,
        sender: message.sender || 'user',
        timestamp: new Date().toISOString(),
        image: message.image || null
      }
      
      if (!state.messages[chatroomId]) {
        state.messages[chatroomId] = []
      }
      
      state.messages[chatroomId].push(newMessage)
      
      // Update chatroom last message
      const chatroom = state.chatrooms.find(chat => chat.id === chatroomId)
      if (chatroom) {
        chatroom.lastMessage = newMessage.text.substring(0, 50) + (newMessage.text.length > 50 ? '...' : '')
        chatroom.lastMessageTime = newMessage.timestamp
      }
    },
    
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    
    initializeSampleData: (state) => {
      if (state.chatrooms.length === 0) {
        const sampleChats = [
          { title: 'General Discussion', lastMessage: 'Hello! How can I help you today?' },
          { title: 'Tech Questions', lastMessage: 'Let me know if you have any tech questions!' },
          { title: 'Creative Writing', lastMessage: 'I\'d love to help with your creative projects!' }
        ]
        
        sampleChats.forEach(chat => {
          const chatId = Math.random().toString(36).substr(2, 9)
          const newChatroom = {
            id: chatId,
            title: chat.title,
            createdAt: new Date().toISOString(),
            lastMessage: chat.lastMessage,
            lastMessageTime: new Date().toISOString()
          }
          
          state.chatrooms.push(newChatroom)
          state.messages[chatId] = [{
            id: Math.random().toString(36).substr(2, 9),
            text: chat.lastMessage,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            image: null
          }]
        })
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Send AI Response
      .addCase(sendAIResponse.pending, (state) => {
        state.isTyping = true
      })
      .addCase(sendAIResponse.fulfilled, (state) => {
        state.isTyping = false
      })
      .addCase(sendAIResponse.rejected, (state) => {
        state.isTyping = false
      })
      // Load Older Messages
      .addCase(loadOlderMessages.pending, (state) => {
        state.loading = true
      })
      .addCase(loadOlderMessages.fulfilled, (state, action) => {
        const { chatroomId, messages } = action.payload
        if (state.messages[chatroomId]) {
          state.messages[chatroomId] = [...messages, ...state.messages[chatroomId]]
        }
        state.loading = false
      })
      .addCase(loadOlderMessages.rejected, (state) => {
        state.loading = false
      })
  }
})

export const {
  createChatroom,
  deleteChatroom,
  setActiveChat,
  addMessage,
  setSearchQuery,
  initializeSampleData
} = chatSlice.actions

export default chatSlice.reducer