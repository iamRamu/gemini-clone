import { AlertTriangle, X, Trash2, LogOut, Info } from 'lucide-react'

function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to perform this action?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger" // danger, warning, info
}) {
  if (!isOpen) return null

  const typeStyles = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-red-500" />,
      confirmBg: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
      iconBg: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20",
      borderColor: "border-red-200 dark:border-red-800"
    },
    warning: {
      icon: <LogOut className="w-6 h-6 text-orange-500" />,
      confirmBg: "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800",
      iconBg: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20",
      borderColor: "border-orange-200 dark:border-orange-800"
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-500" />,
      confirmBg: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
      iconBg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20",
      borderColor: "border-blue-200 dark:border-blue-800"
    }
  }

  const currentStyle = typeStyles[type] || typeStyles.danger

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl w-full max-w-md shadow-2xl transform transition-all animate-scale-in border border-white/20 dark:border-gray-700/50 ring-1 ring-black/5 dark:ring-white/5">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl ${currentStyle.iconBg} shadow-lg`}>
              {currentStyle.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-600">
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200 border border-gray-300 dark:border-gray-500 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${currentStyle.confirmBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal