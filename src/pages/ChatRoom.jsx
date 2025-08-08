import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon, 
  Copy, 
  MoreVertical,
  Trash2,
  Moon,
  Sun,
  Loader2,
  ChevronUp,
  Square
} from 'lucide-react'
import { addMessage, sendAIResponse, deleteChatroom, loadOlderMessages } from '../store/chatActions'
import { toggleTheme } from '../store/themeActions'
import { generateSkeletonItems } from '../utils/mockData'
import TypewriterText from '../components/TypewriterText'

function ChatRoom() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const fileInputRef = useRef(null)
  
  const [message, setMessage] = useState('')
  const [selectedImages, setSelectedImages] = useState([])
  const [page, setPage] = useState(1)
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const { chatrooms, messages, isTyping, streamingMessage } = useSelector(state => state.chat)
  const { isDarkMode } = useSelector(state => state.theme)
  
  const currentChat = chatrooms.find(chat => chat.id === chatId)
  const chatMessages = messages[chatId] || []
  
  // Auto-scroll to bottom when new messages arrive or streaming updates
  useEffect(() => {
    scrollToBottom()
  }, [chatMessages.length, isTyping, streamingMessage?.text])

  // Continuous scroll during streaming to follow the cursor
  useEffect(() => {
    if (streamingMessage && streamingMessage.text) {
      // Scroll more frequently during streaming for smooth following
      const scrollTimer = setTimeout(() => {
        scrollToBottom()
      }, 50) // Very frequent scrolling during streaming
      
      return () => clearTimeout(scrollTimer)
    }
  }, [streamingMessage?.text])

  // Also scroll on every character for immediate following
  useEffect(() => {
    if (streamingMessage) {
      scrollToBottom()
    }
  }, [streamingMessage?.text?.length])
  
  // Handle initial load
  useEffect(() => {
    if (!currentChat) {
      navigate('/dashboard')
      return
    }
  }, [currentChat, navigate])
  
  const scrollToBottom = () => {
    // Use immediate scroll during streaming for better UX
    if (messagesEndRef.current) {
      const behavior = streamingMessage ? 'instant' : 'smooth'
      messagesEndRef.current.scrollIntoView({ 
        behavior, 
        block: 'end', 
        inline: 'nearest' 
      })
    }
  }
  
  const handleSendMessage = async () => {
    if (!message.trim() && selectedImages.length === 0) return
    if (isGenerating) return // Prevent sending while generating
    
    const messageData = {
      text: message.trim() || (selectedImages.length > 0 ? `${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}` : ''),
      sender: 'user',
      images: selectedImages.length > 0 ? selectedImages : null
    }
    
    // Add user message
    dispatch(addMessage(chatId, messageData))
    
    // Clear input and set generating state
    setMessage('')
    setSelectedImages([])
    setIsGenerating(true)
    
    // Send AI response with conversation history
    setTimeout(() => {
      const conversationHistory = chatMessages.slice(-5) // Last 5 messages for context
      dispatch(sendAIResponse(chatId, messageData.text, conversationHistory, selectedImages))
        .finally(() => {
          setIsGenerating(false)
        })
    }, 100)
  }
  
  const handleStopGeneration = () => {
    setIsGenerating(false)
    // You could add logic here to actually cancel the API request
    // For now, we'll just stop the visual indicators
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
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
  
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Message copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy message')
    }
  }
  
  const handleDeleteChat = () => {
    if (window.confirm(`Are you sure you want to delete "${currentChat?.title}"?`)) {
      dispatch(deleteChatroom(chatId))
      toast.success('Chat deleted successfully!')
      navigate('/dashboard')
    }
  }
  
  const loadMore = async () => {
    if (loadingOlderMessages || !hasMoreMessages) return
    
    setLoadingOlderMessages(true)
    const nextPage = page + 1
    
    try {
      await dispatch(loadOlderMessages(chatId, nextPage))
      setPage(nextPage)
      
      // Simulate reaching end of messages after 5 pages
      if (nextPage >= 5) {
        setHasMoreMessages(false)
      }
    } catch (error) {
      toast.error('Failed to load older messages')
    } finally {
      setLoadingOlderMessages(false)
    }
  }
  
  const handleScroll = () => {
    const container = messagesContainerRef.current
    if (container.scrollTop === 0 && hasMoreMessages && !loadingOlderMessages) {
      loadMore()
    }
  }
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  if (!currentChat) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Chat not found
          </h2>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col relative overflow-hidden"
         style={{ height: '100vh', height: '100dvh' }}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <Link
              to="/dashboard"
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                {currentChat.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {(isGenerating || isTyping) && (!streamingMessage || streamingMessage.text === '') ? 'Gemini is thinking...' : streamingMessage ? 'Gemini is typing...' : 'Online'}
              </p>
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            
            <div className="relative group">
              <button className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 whitespace-nowrap">
                <button
                  onClick={handleDeleteChat}
                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full text-left text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete Chat</span>
                  <span className="sm:hidden">Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 pt-4 pb-4 space-y-3 sm:space-y-4"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          maxHeight: 'calc(100vh - 140px)',
          maxHeight: 'calc(100dvh - 140px)'
        }}
      >
        {/* Top spacer for first message visibility */}
        <div className="h-2 sm:h-4"></div>
        
        {/* Load more button */}
        {hasMoreMessages && (
          <div className="text-center">
            <button
              onClick={loadMore}
              disabled={loadingOlderMessages}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {loadingOlderMessages ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Load older messages</span>
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Loading skeletons */}
        {loadingOlderMessages && (
          <div className="space-y-4">
            {generateSkeletonItems(3).map((item) => (
              <div key={item.id} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Messages */}
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="group max-w-[85%] sm:max-w-xs lg:max-w-md">
              <div
                className={`message-bubble ${
                  msg.sender === 'user' ? 'message-user' : 'message-ai'
                } ${(msg.images && msg.images.length > 0) || msg.image ? 'pb-2' : ''} text-sm sm:text-base`}
              >
                {/* Display multiple images */}
                {msg.images && msg.images.length > 0 && (
                  <div className={`mb-2 ${msg.images.length === 1 ? '' : 'grid grid-cols-2 gap-2'}`}>
                    {msg.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.src}
                        alt={image.name || `Image ${index + 1}`}
                        className="w-full rounded-lg max-h-32 sm:max-h-48 object-cover"
                      />
                    ))}
                  </div>
                )}
                {/* Backward compatibility for single image */}
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Uploaded"
                    className="w-full rounded-lg mb-2 max-h-32 sm:max-h-48 object-cover"
                  />
                )}
                {msg.sender === 'ai' ? (
                  <TypewriterText 
                    text={msg.text}
                    speed={30}
                    showCursor={true}
                    isComplete={!msg.isStreaming}
                    isStreaming={msg.isStreaming || false}
                    className="whitespace-pre-wrap break-words"
                  />
                ) : (
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                )}
                
                {/* Copy button */}
                <button
                  onClick={() => copyToClipboard(msg.text)}
                  className="absolute -top-2 -right-2 p-1 bg-gray-800 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Copy message"
                >
                  <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
              
              <p className={`text-xs text-gray-500 mt-1 ${
                msg.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {/* Show loader while waiting for response (before any streaming content) */}
        {(isGenerating || isTyping) && !streamingMessage && (
          <div className="flex justify-start">
            <div className="message-bubble message-ai">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} className="pb-4 sm:pb-6" />
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 sm:p-4 flex-shrink-0"
           style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {/* Images preview */}
        {selectedImages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedImages.map((image) => (
              <div key={image.id} className="relative">
                <img
                  src={image.src}
                  alt={image.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end space-x-1 sm:space-x-3">
          {/* Image upload */}
          <button
            onClick={() => !isGenerating && !isTyping && !streamingMessage && fileInputRef.current?.click()}
            disabled={isGenerating || isTyping || streamingMessage}
            className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Upload image"
          >
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            autoComplete="off"
          />
          
          {/* Message input */}
          <div className="flex-1 min-w-0">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isGenerating || isTyping || streamingMessage ? "AI is responding..." : "Type a message..."}
              rows={1}
              disabled={isGenerating || isTyping || streamingMessage}
              className="w-full max-h-24 sm:max-h-32 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ minHeight: '38px', fontSize: '16px' }}
              autoComplete="off"
            />
          </div>
          
          {/* Send/Stop button */}
          {isGenerating || isTyping || streamingMessage ? (
            <button
              onClick={handleStopGeneration}
              className="p-1.5 sm:p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
              aria-label="Stop generation"
            >
              <Square className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : (
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() && selectedImages.length === 0}
              className="p-1.5 sm:p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatRoom