// Chat Action Types
export const CHAT_ACTIONS = {
  CREATE_CHATROOM: 'CREATE_CHATROOM',
  CREATE_CHATROOM_WITH_ID: 'CREATE_CHATROOM_WITH_ID',
  DELETE_CHATROOM: 'DELETE_CHATROOM',
  SET_ACTIVE_CHAT: 'SET_ACTIVE_CHAT',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_TYPING: 'SET_TYPING',
  LOAD_OLDER_MESSAGES: 'LOAD_OLDER_MESSAGES',
  INITIALIZE_SAMPLE_DATA: 'INITIALIZE_SAMPLE_DATA'
}

// Initial State
const initialState = {
  chatrooms: [],
  messages: {},
  activeChat: null,
  searchQuery: '',
  isTyping: false
}

// Reducer
const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHAT_ACTIONS.CREATE_CHATROOM:
      const newChatroom = {
        id: Math.random().toString(36).substr(2, 9),
        title: action.payload || `Chat ${state.chatrooms.length + 1}`,
        createdAt: new Date().toISOString(),
        lastMessage: 'Chat created',
        lastMessageTime: new Date().toISOString()
      }
      
      return {
        ...state,
        chatrooms: [newChatroom, ...state.chatrooms],
        messages: {
          ...state.messages,
          [newChatroom.id]: []
        }
      }
      
    case CHAT_ACTIONS.CREATE_CHATROOM_WITH_ID:
      const { title, id } = action.payload
      const chatroomWithId = {
        id,
        title,
        createdAt: new Date().toISOString(),
        lastMessage: 'Chat created',
        lastMessageTime: new Date().toISOString()
      }
      
      return {
        ...state,
        chatrooms: [chatroomWithId, ...state.chatrooms],
        messages: {
          ...state.messages,
          [id]: []
        }
      }
      
    case CHAT_ACTIONS.DELETE_CHATROOM:
      const chatroomId = action.payload
      const newMessages = { ...state.messages }
      delete newMessages[chatroomId]
      
      return {
        ...state,
        chatrooms: state.chatrooms.filter(chat => chat.id !== chatroomId),
        messages: newMessages,
        activeChat: state.activeChat === chatroomId ? null : state.activeChat
      }
      
    case CHAT_ACTIONS.SET_ACTIVE_CHAT:
      return {
        ...state,
        activeChat: action.payload
      }
      
    case CHAT_ACTIONS.ADD_MESSAGE:
      const { chatroomId: chatId, message } = action.payload
      
      const newMessage = {
        id: Math.random().toString(36).substr(2, 9),
        text: message.text,
        sender: message.sender || 'user',
        timestamp: new Date().toISOString(),
        image: message.image || null, // Backward compatibility
        images: message.images || null // New multiple images support
      }
      
      const updatedMessages = {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), newMessage]
      }
      
      const updatedChatrooms = state.chatrooms.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              lastMessage: newMessage.text.substring(0, 50) + (newMessage.text.length > 50 ? '...' : ''),
              lastMessageTime: newMessage.timestamp 
            }
          : chat
      )
      
      return {
        ...state,
        messages: updatedMessages,
        chatrooms: updatedChatrooms
      }
      
    case CHAT_ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      }
      
    case CHAT_ACTIONS.SET_TYPING:
      return {
        ...state,
        isTyping: action.payload
      }
      
    case CHAT_ACTIONS.LOAD_OLDER_MESSAGES:
      const { chatroomId: loadChatId, messages: olderMessages } = action.payload
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [loadChatId]: [...olderMessages, ...(state.messages[loadChatId] || [])]
        }
      }
      
    case CHAT_ACTIONS.INITIALIZE_SAMPLE_DATA:
      // Remove static initialization - app will start with empty state
      return state
      
    default:
      return state
  }
}

export default chatReducer