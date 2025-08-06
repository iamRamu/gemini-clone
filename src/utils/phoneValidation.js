// Phone number patterns for different countries
export const phonePatterns = {
  // North America (US, Canada) - 10 digits
  '+1': {
    pattern: /^\d{10}$/,
    placeholder: '1234567890',
    maxLength: 10,
    example: '1234567890'
  },
  // UK - 10-11 digits
  '+44': {
    pattern: /^\d{10,11}$/,
    placeholder: '12345678901',
    maxLength: 11,
    example: '12345678901'
  },
  // Australia - 9 digits
  '+61': {
    pattern: /^\d{9}$/,
    placeholder: '123456789',
    maxLength: 9,
    example: '123456789'
  },
  // Germany - 10-12 digits
  '+49': {
    pattern: /^\d{10,12}$/,
    placeholder: '123456789012',
    maxLength: 12,
    example: '123456789012'
  },  
  // France - 9-10 digits
  '+33': {
    pattern: /^\d{9,10}$/,
    placeholder: '1234567890',
    maxLength: 10,
    example: '1234567890'
  },
  // Japan - 10-11 digits
  '+81': {
    pattern: /^\d{10,11}$/,
    placeholder: '12345678901',
    maxLength: 11,
    example: '12345678901'
  },
  // China - 11 digits
  '+86': {
    pattern: /^\d{11}$/,
    placeholder: '12345678901',
    maxLength: 11,
    example: '12345678901'
  },
  // India - 10 digits
  '+91': {
    pattern: /^\d{10}$/,
    placeholder: '1234567890',
    maxLength: 10,
    example: '1234567890'
  },
  // Brazil - 10-11 digits
  '+55': {
    pattern: /^\d{10,11}$/,
    placeholder: '12345678901',
    maxLength: 11,
    example: '12345678901'
  },
  // Mexico - 10 digits
  '+52': {
    pattern: /^\d{10}$/,
    placeholder: '1234567890',
    maxLength: 10,
    example: '1234567890'
  },
  // South Korea - 8-11 digits
  '+82': {
    pattern: /^\d{8,11}$/,
    placeholder: '12345678901',
    maxLength: 11,
    example: '12345678901'
  },
  // Default pattern for other countries - 6-15 digits
  'default': {
    pattern: /^\d{6,15}$/,
    placeholder: '123456789012345',
    maxLength: 15,
    example: '123456789012345'
  }
}

// Get phone pattern for a country code
export const getPhonePattern = (countryCode) => {
  return phonePatterns[countryCode] || phonePatterns.default
}

// Validate phone number for specific country
export const validatePhoneNumber = (phoneNumber, countryCode) => {
  const pattern = getPhonePattern(countryCode)
  return pattern.pattern.test(phoneNumber)
}

// Format phone number input - only allow digits
export const formatPhoneInput = (value) => {
  return value.replace(/\D/g, '')
}

// Format OTP input - only allow digits, max 6 characters
export const formatOTPInput = (value) => {
  return value.replace(/\D/g, '').slice(0, 6)
}

// Get phone number validation message
export const getPhoneValidationMessage = (countryCode) => {
  const pattern = getPhonePattern(countryCode)
  const minLength = pattern.pattern.source.includes('{') 
    ? pattern.pattern.source.match(/\{(\d+)/)[1] 
    : pattern.maxLength
  const maxLength = pattern.maxLength
  
  if (minLength === maxLength) {
    return `Phone number must be exactly ${minLength} digits`
  } else {
    return `Phone number must be between ${minLength}-${maxLength} digits`
  }
}