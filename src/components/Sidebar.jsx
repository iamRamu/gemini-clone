import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'
import { useDebounce } from '../hooks/useDebounce'
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Trash2, 
  LogOut, 
  Moon, 
  Sun,
  Sparkles,
  Clock,
  Menu,
  X,
  Edit3
} from 'lucide-react'
import { logout } from '../store/authActions'
import { createChatroom, deleteChatroom, setSearchQuery as setStoreSearchQuery } from '../store/chatActions'
import { toggleTheme } from '../store/themeActions'
import ConfirmModal from './ConfirmModal'

function Sidebar({ isOpen, onToggle }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { chatId } = useParams()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [newChatTitle, setNewChatTitle] = useState('')
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, chatId: null, chatTitle: '' })
  const [logoutModal, setLogoutModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)
  
  const { user } = useSelector(state => state.auth)
  const { chatrooms, searchQuery: storeSearchQuery } = useSelector(state => state.chat)
  const { isDarkMode } = useSelector(state => state.theme)

  // Debounce search query with 3000ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 3000)
  
  // Filter chatrooms based on debounced search query
  const filteredChatrooms = chatrooms.filter(chat =>
    chat.title.toLowerCase().includes((debouncedSearchQuery || '').toLowerCase())
  )

  const handleCreateChat = () => {
    if (!newChatTitle.trim()) {
      toast.error('Please enter a chat title')
      return
    }
    
    const newChatId = Math.random().toString(36).substr(2, 9)
    
    dispatch({
      type: 'CREATE_CHATROOM_WITH_ID',
      payload: { title: newChatTitle.trim(), id: newChatId }
    })
    
    setNewChatTitle('')
    setShowNewChatDialog(false)
    toast.success('Chat created successfully!')
    
    navigate(`/chat/${newChatId}`)
    
    // Close sidebar on mobile after creating chat
    if (window.innerWidth < 768) {
      onToggle()
    }
  }

  const handleDeleteChat = (chatIdToDelete, chatTitle, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    setDeleteModal({
      isOpen: true,
      chatId: chatIdToDelete,
      chatTitle: chatTitle
    })
  }

  const confirmDeleteChat = () => {
    const { chatId: chatIdToDelete } = deleteModal
    
    dispatch(deleteChatroom(chatIdToDelete))
    toast.success('Chat deleted successfully!')
    
    // If deleting current chat, redirect to dashboard
    if (chatIdToDelete === chatId) {
      navigate('/dashboard')
    }
    
    setDeleteModal({ isOpen: false, chatId: null, chatTitle: '' })
  }

  const handleLogout = () => {
    setLogoutModal(true)
  }


  const confirmLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully!')
    setLogoutModal(false)
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-500 ease-in-out"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        transition-all duration-500 ease-in-out
        ${isOpen ? 'w-80 md:w-64 lg:w-80' : 'w-0'}
        fixed top-0 left-0 h-full z-50 md:relative md:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        overflow-hidden
      `}>
        <div className={`w-80 md:w-64 lg:w-80 h-full flex flex-col ${!isOpen ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-gemini-blue to-gemini-purple p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Gemini Clone
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI Assistant
                </p>
              </div>
            </div>
            
            {/* Mobile close button */}
            <button
              onClick={onToggle}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ml-auto"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          {/* New Chat Button */}
          <button
            onClick={() => setShowNewChatDialog(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-gemini-blue to-gemini-purple text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1">
            {filteredChatrooms.length === 0 ? (
              <div className="p-4 text-center">
                <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {searchQuery ? 'No chats found' : 'No conversations yet'}
                </p>
                {!searchQuery && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Start a new chat to begin your conversation with Gemini
                  </p>
                )}
              </div>
            ) : (
              <div className="p-2">
                {filteredChatrooms.map((chat) => (
                  <Link
                    key={chat.id}
                    to={`/chat/${chat.id}`}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        onToggle()
                      }
                    }}
                    className={`
                      group flex items-center p-3 rounded-lg transition-all duration-200 mb-1
                      ${chatId === chat.id 
                        ? 'bg-gradient-to-r from-gemini-blue/10 to-gemini-purple/10 border-l-4 border-gemini-blue' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-gemini-blue to-gemini-purple rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex-1 ml-3 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {chat.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {chat.lastMessage}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {formatTime(chat.lastMessageTime)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, chat.title, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Bottom Section with User Menu */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="relative" ref={userMenuRef}>
              {/* User Menu Toggle Button */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center space-x-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-gemini-blue to-gemini-purple rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Click to expand
                  </p>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-2 z-50 animate-scale-in">
                  {/* User Info Section */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-gemini-blue to-gemini-purple rounded-full flex items-center justify-center text-white font-medium text-lg shadow-lg">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {user?.name || 'User'}
                        </p>
                        {user?.email && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        )}
                        {user?.phoneNumber && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {user.countryCode} {user.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Options */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        dispatch(toggleTheme())
                        setShowUserMenu(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {isDarkMode ? (
                        <Sun className="w-5 h-5" />
                      ) : (
                        <Moon className="w-5 h-5" />
                      )}
                      <span className="font-medium">{isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* New Chat Dialog */}
      {showNewChatDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create New Chat
              </h3>
              
              <input
                type="text"
                placeholder="Enter chat title..."
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateChat()
                  } else if (e.key === 'Escape') {
                    setShowNewChatDialog(false)
                  }
                }}
                className="input-field mb-4"
                autoFocus
                autoComplete="off"
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateChat}
                  className="flex-1 btn-primary"
                >
                  Create Chat
                </button>
                <button
                  onClick={() => {
                    setShowNewChatDialog(false)
                    setNewChatTitle('')
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, chatId: null, chatTitle: '' })}
        onConfirm={confirmDeleteChat}
        title="Delete Chat"
        message={`Are you sure you want to delete "${deleteModal.chatTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout? You'll need to sign in again to continue."
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
    </>
  )
}

export default Sidebar