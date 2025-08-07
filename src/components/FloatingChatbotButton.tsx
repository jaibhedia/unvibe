import { Button } from './ui/button'

/**
 * Props interface for the floating chatbot button
 */
interface FloatingChatbotButtonProps {
  onClick: () => void
  isActive: boolean
}

/**
 * Floating chatbot button that stays visible in the bottom-right corner
 * Provides quick access to the AI assistant from anywhere in the app
 */
const FloatingChatbotButton: React.FC<FloatingChatbotButtonProps> = ({ onClick, isActive }) => {
  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 z-40 ${
        isActive 
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 scale-110' 
          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-105'
      }`}
      title="Open AI Code Assistant"
    >
      {isActive ? (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )}
      
      {/* Notification pulse animation */}
      {!isActive && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse">
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
        </div>
      )}
    </Button>
  )
}

export default FloatingChatbotButton
