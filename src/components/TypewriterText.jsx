import { useState, useEffect, useRef } from 'react'

const TypewriterText = ({ 
  text, 
  speed = 30, 
  onComplete = null,
  className = '',
  showCursor = true,
  isComplete = false,
  isStreaming = false
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const lastTextRef = useRef('')

  // Handle streaming text updates
  useEffect(() => {
    if (isStreaming) {
      // For streaming, show text immediately as it comes in
      setDisplayedText(text)
      setIsTyping(true)
      lastTextRef.current = text
    } else if (!isComplete && text && text !== lastTextRef.current) {
      // For non-streaming, use typewriter effect
      setDisplayedText('')
      setIsTyping(true)
      lastTextRef.current = text
      
      // Typewriter effect
      let currentIndex = 0
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.substring(0, currentIndex + 1))
          currentIndex++
          setTimeout(typeNextChar, speed + Math.random() * 20)
        } else {
          setIsTyping(false)
          if (onComplete) {
            onComplete()
          }
        }
      }
      
      // Start typing after a short delay
      setTimeout(typeNextChar, 100)
    } else if (isComplete) {
      // If text is complete, show it immediately
      setDisplayedText(text)
      setIsTyping(false)
    }
  }, [text, speed, onComplete, isComplete, isStreaming])

  // Handle completion
  useEffect(() => {
    if (isComplete && isTyping) {
      setDisplayedText(text)
      setIsTyping(false)
      if (onComplete) {
        onComplete()
      }
    }
  }, [isComplete, text, onComplete, isTyping])

  const shouldShowCursor = showCursor && (isTyping || (isStreaming && !isComplete))

  return (
    <span className={className}>
      <span className="whitespace-pre-wrap break-words">{displayedText}</span>
      {shouldShowCursor && (
        <span className="animate-pulse text-blue-500 ml-0.5 font-bold">▋</span>
      )}
    </span>
  )
}

export default TypewriterText