import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import NotFoundPage from './pages/NotFoundPage'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import { useEffect, useState } from 'react'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useSelector(state => state.auth)
  const { isDarkMode } = useSelector(state => state.theme)
  const dispatch = useDispatch()

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Restore authentication state and prevent loading flash
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Clear any old auth localStorage entries that might conflict
        localStorage.removeItem('auth')
        
        // Initialize with test users if none exist (for development)
        const existingUsers = localStorage.getItem('gemini_users')
        if (!existingUsers) {
          const testUsers = [
            {
              id: 'test-user-1',
              name: 'Test User',
              email: 'test@example.com',
              phoneNumber: '1234567890',
              countryCode: '+1',
              joinedAt: new Date().toISOString()
            }
          ]
          localStorage.setItem('gemini_users', JSON.stringify(testUsers))
        }
        
        // Restore current user session
        const currentUser = localStorage.getItem('gemini_current_user')
        if (currentUser) {
          const user = JSON.parse(currentUser)
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: user
          })
        }
      } catch (error) {
        console.error('Error restoring auth state:', error)
        localStorage.removeItem('gemini_current_user')
      }
      
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 100)
      
      return () => clearTimeout(timer)
    }
    
    return initializeAuth()
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <Routes>
          <Route 
            path="/auth" 
            element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <Layout /> : <Navigate to="/auth" />}
          >
            <Route 
              path="dashboard" 
              element={<Dashboard />} 
            />
            <Route 
              path="chat/:chatId" 
              element={<Dashboard />} 
            />
            <Route 
              index
              element={<Navigate to="/dashboard" />} 
            />
          </Route>
          {/* Catch all route for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App