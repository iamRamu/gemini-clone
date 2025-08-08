// Chat Action Types
export const CHAT_ACTIONS = {
  CREATE_CHATROOM: 'CREATE_CHATROOM',
  CREATE_CHATROOM_WITH_ID: 'CREATE_CHATROOM_WITH_ID',
  DELETE_CHATROOM: 'DELETE_CHATROOM',
  SET_ACTIVE_CHAT: 'SET_ACTIVE_CHAT',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_STREAMING_MESSAGE: 'UPDATE_STREAMING_MESSAGE',
  START_STREAMING_MESSAGE: 'START_STREAMING_MESSAGE',
  END_STREAMING_MESSAGE: 'END_STREAMING_MESSAGE',
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
  isTyping: false,
  streamingMessage: null
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
      
    case CHAT_ACTIONS.START_STREAMING_MESSAGE:
      const { chatroomId: streamChatId, messageId } = action.payload
      
      const streamingMessage = {
        id: messageId,
        text: '',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isStreaming: true,
        chatroomId: streamChatId
      }
      
      return {
        ...state,
        streamingMessage
        // Don't add to messages array until we have content
      }
      
    case CHAT_ACTIONS.UPDATE_STREAMING_MESSAGE:
      const { messageId: updateMsgId, textChunk } = action.payload
      
      if (!state.streamingMessage || state.streamingMessage.id !== updateMsgId) {
        return state
      }
      
      const updatedStreamingMessage = {
        ...state.streamingMessage,
        text: state.streamingMessage.text + textChunk
      }
      
      // Check if this is the first chunk (message not in array yet)
      const chatroomMessages = state.messages[updatedStreamingMessage.chatroomId] || []
      const messageExists = chatroomMessages.some(msg => msg.id === updateMsgId)
      
      const updatedStreamingMessages = {
        ...state.messages,
        [updatedStreamingMessage.chatroomId]: messageExists 
          ? chatroomMessages.map(msg => msg.id === updateMsgId ? updatedStreamingMessage : msg)
          : [...chatroomMessages, updatedStreamingMessage]
      }
      
      return {
        ...state,
        streamingMessage: updatedStreamingMessage,
        messages: updatedStreamingMessages
      }
      
    case CHAT_ACTIONS.END_STREAMING_MESSAGE:
      const { messageId: endMsgId, finalText } = action.payload
      
      if (!state.streamingMessage || state.streamingMessage.id !== endMsgId) {
        return state
      }
      
      const finalMessage = {
        ...state.streamingMessage,
        text: finalText || state.streamingMessage.text,
        isStreaming: false
      }
      
      const finalMessages = {
        ...state.messages,
        [finalMessage.chatroomId]: state.messages[finalMessage.chatroomId].map(msg =>
          msg.id === endMsgId ? finalMessage : msg
        )
      }
      
      const finalChatrooms = state.chatrooms.map(chat => 
        chat.id === finalMessage.chatroomId 
          ? { 
              ...chat, 
              lastMessage: finalMessage.text.substring(0, 50) + (finalMessage.text.length > 50 ? '...' : ''),
              lastMessageTime: finalMessage.timestamp 
            }
          : chat
      )
      
      return {
        ...state,
        streamingMessage: null,
        messages: finalMessages,
        chatrooms: finalChatrooms
      }
      
    case CHAT_ACTIONS.INITIALIZE_SAMPLE_DATA:
      // Remove static initialization - app will start with empty state
      return state
      
    default:
      return state
  }
}

export default chatReducer