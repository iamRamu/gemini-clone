import { createStore, combineReducers, applyMiddleware } from 'redux'
import authReducer from './authReducer'
import themeReducer from './themeReducer'
import chatReducer from './chatReducer'

// Simple thunk middleware for async actions
const thunk = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState)
  }
  return next(action)
}

// Load initial state from localStorage
const loadInitialState = () => {
  try {
    const themeState = localStorage.getItem('theme')
    const chatState = localStorage.getItem('chat')
    
    // Don't load auth state here - let App.jsx handle it
    return {
      theme: themeState ? JSON.parse(themeState) : undefined,
      chat: chatState ? JSON.parse(chatState) : undefined
    }
  } catch (error) {
    console.log('Error loading saved state:', error)
    return {}
  }
}

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  chat: chatReducer
})

// Create store with initial state and thunk middleware
const initialState = loadInitialState()
const store = createStore(rootReducer, initialState, applyMiddleware(thunk))

// Save to localStorage whenever state changes
store.subscribe(() => {
  const state = store.getState()
  
  try {
    // Don't save auth state here - handled by individual auth actions
    
    // Save theme state
    localStorage.setItem('theme', JSON.stringify(state.theme))
    
    // Save chat state
    localStorage.setItem('chat', JSON.stringify({
      chatrooms: state.chat.chatrooms,
      messages: state.chat.messages
    }))
  } catch (error) {
    console.log('Error saving state:', error)
  }
})

export default store