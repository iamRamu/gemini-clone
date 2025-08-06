import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { 
  Send, 
  Image as ImageIcon, 
  Sparkles,
  Lightbulb,
  Code,
  PenTool,
  MessageCircle,
  Mic
} from 'lucide-react'
import { addMessage, sendAIResponse, initializeSampleData } from '../store/chatActions'
import { callGeminiAPI } from '../utils/geminiApi'

function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { chatId } = useParams()
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  
  const [message, setMessage] = useState('')
  const [selectedImages, setSelectedImages] = useState([])
  
  const { user } = useSelector(state => state.auth)
  const { chatrooms, messages, isTyping } = useSelector(state => state.chat)
  const { isDarkMode } = useSelector(state => state.theme)
  
  // Get current chat and messages
  const currentChat = chatrooms.find(chat => chat.id === chatId)
  const chatMessages = messages[chatId] || []
  
  // No longer initialize sample data - start with empty state
  
  // Auto-redirect to latest chat if no chatId provided
  useEffect(() => {
    if (!chatId && chatrooms.length > 0) {
      const latestChat = chatrooms.reduce((latest, chat) => 
        new Date(chat.lastMessageTime) > new Date(latest.lastMessageTime) ? chat : latest
      )
      navigate(`/chat/${latestChat.id}`, { replace: true })
    }
  }, [chatId, chatrooms, navigate])
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages.length, isTyping])
  
  const handleSendMessage = async () => {
    if (!message.trim() && selectedImages.length === 0) return
    
    let targetChatId = chatId
    
    // If no chat selected, create a new one
    if (!targetChatId) {
      targetChatId = Math.random().toString(36).substr(2, 9)
      const chatTitle = message.trim().slice(0, 30) + (message.length > 30 ? '...' : '') || 'Images'
      
      dispatch({
        type: 'CREATE_CHATROOM_WITH_ID',
        payload: { title: chatTitle, id: targetChatId }
      })
      
      navigate(`/chat/${targetChatId}`, { replace: true })
    }
    
    const messageData = {
      text: message.trim() || (selectedImages.length > 0 ? `${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}` : ''),
      sender: 'user',
      images: selectedImages.length > 0 ? selectedImages : null
    }
    
    // Add user message
    dispatch(addMessage(targetChatId, messageData))
    
    // Clear input
    setMessage('')
    setSelectedImages([])
    
    // Send AI response with conversation history
    setTimeout(() => {
      const conversationHistory = (messages[targetChatId] || []).slice(-5)
      dispatch(sendAIResponse(targetChatId, messageData.text, conversationHistory, selectedImages))
    }, 100) // Reduced delay
  }
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  const handleImageUpload = (e) => {
    try {
      const files = Array.from(e.target.files)
      
      if (!files || files.length === 0) return
      
      if (selectedImages.length + files.length > 5) {
        toast.error('You can only upload up to 5 images at once')
        return
      }
      
      // Validate file types
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      const invalidFiles = files.filter(file => !validTypes.includes(file.type))
      
      if (invalidFiles.length > 0) {
        toast.error(`Only JPEG, PNG, GIF, and WebP images are allowed`)
        return
      }
      
      files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Image size must be less than 5MB`)
          return
        }
        
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            setSelectedImages(prev => [...prev, {
              id: Math.random().toString(36).substr(2, 9),
              src: e.target.result,
              name: file.name
            }])
          } catch (error) {
            console.error('Error processing image:', error)
            toast.error(`Failed to process ${file.name}`)
          }
        }
        reader.onerror = () => {
          toast.error(`Failed to read ${file.name}`)
        }
        reader.readAsDataURL(file)
      })
      
      // Reset file input
      e.target.value = ''
    } catch (error) {
      console.error('Error handling image upload:', error)
      toast.error('Failed to upload images. Please try again.')
    }
  }

  const removeImage = (imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId))
  }
  
  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion)
  }
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  const suggestions = [
    {
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Give me ideas",
      subtitle: "for a birthday party theme for a 10-year-old"
    },
    {
      icon: <Code className="w-4 h-4" />,
      title: "Help me code",
      subtitle: "a simple React component for a todo list"
    },
    {
      icon: <PenTool className="w-4 h-4" />,
      title: "Write for me",
      subtitle: "a professional email to schedule a meeting"
    },
    {
      icon: <MessageCircle className="w-4 h-4" />,
      title: "Explain this",
      subtitle: "concept in simple terms"
    }
  ]

  // Show welcome screen if no chat is selected
  if (!chatId || !currentChat) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto">
          {/* Gemini Logo */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-gemini-blue to-gemini-purple p-4 rounded-2xl mb-4">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-light text-gray-900 dark:text-white text-center">
              Hello, {user?.name || 'there'}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 text-center mt-2">
              How can I help you today?
            </p>
          </div>

          {/* Quick Start Actions */}
          {chatrooms.length === 0 && (
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Get Started
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start your first conversation with Gemini by typing a message below or clicking on one of these suggestions.
              </p>
            </div>
          )}

          {/* Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(`${suggestion.title} ${suggestion.subtitle}`)}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left group"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-gemini-blue mt-1">
                    {suggestion.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-gemini-blue transition-colors">
                      {suggestion.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {suggestion.subtitle}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-3xl mx-auto">
            {/* Images preview */}
            {selectedImages.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedImages.map((image) => (
                  <div key={image.id} className="relative">
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors text-xs w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-end space-x-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
              {/* Image upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                aria-label="Upload image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {/* Message input */}
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message Gemini..."
                  rows={1}
                  className="w-full bg-transparent border-none focus:outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  style={{ minHeight: '24px', maxHeight: '120px' }}
                />
              </div>
              
              {/* Send button */}
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() && selectedImages.length === 0}
                className="p-2 bg-gemini-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
              
              {/* Voice input button */}
              <button
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                aria-label="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Gemini may display inaccurate info, including about people, so double-check its responses.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show chat interface if chat is selected
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-gemini-blue to-gemini-purple rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentChat.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isTyping ? 'Gemini is typing...' : 'Online'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-[80%] lg:max-w-[70%]">
              {msg.sender === 'ai' && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-gemini-blue to-gemini-purple rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Gemini</span>
                </div>
              )}
              
              <div
                className={`rounded-2xl p-4 ${
                  msg.sender === 'user'
                    ? 'bg-gemini-blue text-white ml-auto'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                {/* Display multiple images */}
                {msg.images && msg.images.length > 0 && (
                  <div className={`mb-3 ${msg.images.length === 1 ? '' : 'grid grid-cols-2 gap-2'}`}>
                    {msg.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.src}
                        alt={image.name || `Image ${index + 1}`}
                        className="w-full rounded-lg max-h-64 object-cover"
                      />
                    ))}
                  </div>
                )}
                {/* Backward compatibility for single image */}
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Uploaded"
                    className="w-full rounded-lg mb-3 max-h-64 object-cover"
                  />
                )}
                <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
              </div>
              
              <p className={`text-xs text-gray-500 mt-2 ${
                msg.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[80%] lg:max-w-[70%]">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-r from-gemini-blue to-gemini-purple rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Gemini</span>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        {/* Images preview */}
        {selectedImages.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedImages.map((image) => (
              <div key={image.id} className="relative">
                <img
                  src={image.src}
                  alt={image.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors text-xs w-5 h-5 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end space-x-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
          {/* Image upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            aria-label="Upload image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {/* Message input */}
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Message Gemini..."
              rows={1}
              className="w-full bg-transparent border-none focus:outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />
          </div>
          
          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() && selectedImages.length === 0}
            className="p-2 bg-gemini-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
          
          {/* Voice input button */}
          <button
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            aria-label="Voice input"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Gemini may display inaccurate info, including about people, so double-check its responses.
        </p>
      </div>
    </div>
  )
}

export default Dashboard