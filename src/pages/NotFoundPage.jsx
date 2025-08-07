import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Sparkles } from 'lucide-react'
import { useSelector } from 'react-redux'

function NotFoundPage() {
  const { isDarkMode } = useSelector(state => state.theme)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Logo */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-gemini-blue to-gemini-purple p-6 rounded-2xl mb-6 inline-block">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-gemini-blue to-gemini-purple text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Go to Dashboard</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Suggestions */}
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>You can also try:</p>
          <ul className="mt-2 space-y-1">
            <li>
              <Link to="/dashboard" className="text-gemini-blue hover:underline">
                Starting a new conversation
              </Link>
            </li>
            <li>Checking the URL for typos</li>
            <li>Using the navigation menu</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage