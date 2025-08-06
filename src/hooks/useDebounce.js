import { useState, useEffect } from 'react'

// Custom hook for debouncing values
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for debouncing async functions
export function useAsyncDebounce(asyncFunction, delay) {
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    let timeoutId
    
    const debouncedFunction = (...args) => {
      setLoading(true)
      clearTimeout(timeoutId)
      
      timeoutId = setTimeout(async () => {
        try {
          await asyncFunction(...args)
        } finally {
          setLoading(false)
        }
      }, delay)
    }
    
    return debouncedFunction
  }, [asyncFunction, delay])
  
  return { loading }
}