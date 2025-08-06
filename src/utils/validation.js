// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhoneNumber = (phone, countryCode) => {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Basic validation - should have at least 7 digits
  if (cleanPhone.length < 7) {
    return false
  }
  
  // Country-specific validation
  switch (countryCode) {
    case '+1': // US/Canada
      return cleanPhone.length === 10
    case '+91': // India
      return cleanPhone.length === 10
    case '+44': // UK
      return cleanPhone.length >= 10 && cleanPhone.length <= 11
    case '+33': // France
      return cleanPhone.length === 10
    case '+49': // Germany
      return cleanPhone.length >= 10 && cleanPhone.length <= 12
    case '+81': // Japan
      return cleanPhone.length >= 10 && cleanPhone.length <= 11
    case '+86': // China
      return cleanPhone.length === 11
    case '+7': // Russia
      return cleanPhone.length === 10
    case '+55': // Brazil
      return cleanPhone.length >= 10 && cleanPhone.length <= 11
    case '+61': // Australia
      return cleanPhone.length === 9
    default:
      // Generic validation for other countries
      return cleanPhone.length >= 7 && cleanPhone.length <= 15
  }
}

export const validateOTP = (otp) => {
  const cleanOTP = otp.replace(/\D/g, '')
  return cleanOTP.length === 6
}

export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters long' }
  }
  
  if (name.trim().length > 50) {
    return { valid: false, message: 'Name must be less than 50 characters' }
  }
  
  const nameRegex = /^[a-zA-Z\s]+$/
  if (!nameRegex.test(name.trim())) {
    return { valid: false, message: 'Name can only contain letters and spaces' }
  }
  
  return { valid: true }
}

export const validateImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, message: 'Only JPEG, PNG, GIF, and WebP images are allowed' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, message: 'Image size must be less than 5MB' }
  }
  
  return { valid: true }
}

export const validateImageCollection = (images, newFiles = []) => {
  const totalImages = images.length + newFiles.length
  
  if (totalImages > 5) {
    return { valid: false, message: 'You can only upload up to 5 images at once' }
  }
  
  // Validate each new file
  for (const file of newFiles) {
    const imageValidation = validateImage(file)
    if (!imageValidation.valid) {
      return { valid: false, message: `${file.name}: ${imageValidation.message}` }
    }
  }
  
  return { valid: true }
}

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  // Remove potential XSS patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

export const formatError = (error) => {
  if (typeof error === 'string') return error
  
  if (error?.message) return error.message
  
  if (error?.response?.data?.message) return error.response.data.message
  
  return 'An unexpected error occurred'
}