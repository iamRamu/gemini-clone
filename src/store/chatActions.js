import { CHAT_ACTIONS } from './chatReducer'
import { generateMockMessages } from '../utils/mockData'
import { callGeminiAPI } from '../utils/geminiApi'
import { generateAIResponse, getTypingDuration } from '../utils/fakeAiApi'

// Action Creators
export const createChatroom = (title) => ({
  type: CHAT_ACTIONS.CREATE_CHATROOM,
  payload: title
})

export const deleteChatroom = (chatroomId) => ({
  type: CHAT_ACTIONS.DELETE_CHATROOM,
  payload: chatroomId
})

export const setActiveChat = (chatroomId) => ({
  type: CHAT_ACTIONS.SET_ACTIVE_CHAT,
  payload: chatroomId
})

export const addMessage = (chatroomId, message) => ({
  type: CHAT_ACTIONS.ADD_MESSAGE,
  payload: { chatroomId, message }
})

export const setSearchQuery = (query) => ({
  type: CHAT_ACTIONS.SET_SEARCH_QUERY,
  payload: query
})

export const setTyping = (isTyping) => ({
  type: CHAT_ACTIONS.SET_TYPING,
  payload: isTyping
})

export const initializeSampleData = () => ({
  type: CHAT_ACTIONS.INITIALIZE_SAMPLE_DATA
})

// Async Action for AI Response
export const sendAIResponse = (chatroomId, userMessage, conversationHistory = [], images = []) => {
  return async (dispatch, getState) => {
    dispatch(setTyping(true))
    
    try {
      // Try real Gemini API first
      const apiResponse = await callGeminiAPI(userMessage, conversationHistory, images)
      
      // Use shorter typing duration for better UX
      const typingDuration = Math.min(getTypingDuration(apiResponse.text.length), 1500) // Max 1.5 seconds
      
      // Shorter delay for typing effect
      await new Promise(resolve => setTimeout(resolve, typingDuration))
      
      const aiMessage = {
        text: apiResponse.text,
        sender: 'ai',
        isRealAPI: apiResponse.isRealAPI
      }
      
      dispatch(setTyping(false))
      dispatch(addMessage(chatroomId, aiMessage))
      
      // Show toast if using fallback
      if (!apiResponse.isRealAPI && apiResponse.fallbackReason) {
        console.log('Using fallback AI:', apiResponse.fallbackReason)
      }
      
    } catch (error) {
      dispatch(setTyping(false))
      console.error('AI Response Error:', error)
      
      // Fallback response
      const fallbackMessage = {
        text: "I apologize, but I'm having trouble processing your message right now. Could you please try again?",
        sender: 'ai',
        isRealAPI: false
      }
      dispatch(addMessage(chatroomId, fallbackMessage))
    }
  }
}

// Async Action for loading older messages
export const loadOlderMessages = (chatroomId, page) => {
  return async (dispatch) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const olderMessages = generateMockMessages(10, page)
      
      dispatch({
        type: CHAT_ACTIONS.LOAD_OLDER_MESSAGES,
        payload: { chatroomId, messages: olderMessages }
      })
      
    } catch (error) {
      console.error('Failed to load older messages:', error)
    }
  }
}