import { useState, useEffect, useRef } from 'react'

const StreamingTypewriter = ({ 
  onTextChunk = null,
  className = '',
  showCursor = true,
  isActive = false
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const textQueueRef = useRef([])
  const isProcessingRef = useRef(false)
  const timeoutRef = useRef(null)

  // Method to add new text chunks
  const addTextChunk = (chunk) => {
    textQueueRef.current.push(...chunk.split(''))
    if (!isProcessingRef.current) {
      processTextQueue()
    }
  }

  // Method to complete text immediately
  const completeText = () => {
    if (textQueueRef.current.length > 0) {
      const remainingText = textQueueRef.current.join('')
      setDisplayedText(prev => prev + remainingText)
      textQueueRef.current = []
    }
    setIsTyping(false)
    isProcessingRef.current = false
  }

  // Method to clear all text
  const clearText = () => {
    setDisplayedText('')
    textQueueRef.current = []
    setIsTyping(false)
    isProcessingRef.current = false
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  // Process the text queue character by character
  const processTextQueue = async () => {
    if (isProcessingRef.current) return
    
    isProcessingRef.current = true
    setIsTyping(true)

    while (textQueueRef.current.length > 0) {
      const char = textQueueRef.current.shift()
      
      setDisplayedText(prev => {
        const newText = prev + char
        if (onTextChunk) {
          onTextChunk(newText)
        }
        return newText
      })

      // Variable delay based on character type
      let delay = 30
      if (char === ' ') delay = 50
      if (['.', '!', '?'].includes(char)) delay = 100
      if ([',', ';', ':'].includes(char)) delay = 80
      if (char === '\n') delay = 120

      // Add slight randomness for natural effect
      delay += Math.random() * 20

      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, delay)
      })
    }

    setIsTyping(false)
    isProcessingRef.current = false
  }

  // Reset when component becomes active/inactive
  useEffect(() => {
    if (!isActive) {
      clearText()
    }
  }, [isActive])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Expose methods via ref (parent can access these)
  useEffect(() => {
    if (window.streamingTypewriterMethods) {
      window.streamingTypewriterMethods.addTextChunk = addTextChunk
      window.streamingTypewriterMethods.completeText = completeText
      window.streamingTypewriterMethods.clearText = clearText
    }
  }, [])

  return (
    <span className={className}>
      <span className="whitespace-pre-wrap break-words">{displayedText}</span>
      {showCursor && (isTyping || isActive) && (
        <span className="animate-pulse text-blue-400 ml-0.5">▋</span>
      )}
    </span>
  )
}

export default StreamingTypewriter