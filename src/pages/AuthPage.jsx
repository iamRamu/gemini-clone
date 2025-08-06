import { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { sendOTP, verifyOTP, resetOTP, setUserInfo } from '../store/authActions'
import { fetchCountries, searchCountries } from '../utils/countryApi'
import { getPhonePattern, validatePhoneNumber, formatPhoneInput, formatOTPInput, getPhoneValidationMessage } from '../utils/phoneValidation'
import { Phone, ChevronDown, Loader2, Sparkles } from 'lucide-react'

// Dynamic validation schemas
const createPhoneSchema = (countryCode) => z.object({
  countryCode: z.string().min(1, 'Please select a country.'),
  phoneNumber: z.string()
    .regex(/^\d+$/, 'Phone number must contain only digits.')
    .refine(
      (phone) => validatePhoneNumber(phone, countryCode),
      { message: getPhoneValidationMessage(countryCode) }
    )
})

const otpSchema = z.object({
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits.')
    .regex(/^\d+$/, 'OTP must contain only digits.')
})

const userInfoSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name must be at most 50 characters.')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces.'),
  email: z.string()
    .email('Please enter a valid email address.')
    .optional()
    .or(z.literal(''))
})

function AuthPage() {
  const dispatch = useDispatch()
  const { otpSent, loading, showUserInfoForm, phoneNumber: storedPhoneNumber, countryCode: storedCountryCode } = useSelector(state => state.auth)
  const [isLoginMode, setIsLoginMode] = useState(true)

  const [countries, setCountries] = useState([])
  const [filteredCountries, setFilteredCountries] = useState([])
  const [countrySearch, setCountrySearch] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [countriesLoading, setCountriesLoading] = useState(true)

  // Phone form - will be recreated when country changes
  const phoneForm = useForm({
    resolver: selectedCountry
      ? zodResolver(
        z.object({
          ...createPhoneSchema(selectedCountry.dialCode).shape,
          ...(!isLoginMode
            ? {
              name: z.string()
                .min(2, 'Name must be at least 2 characters.')
                .max(50, 'Name must be at most 50 characters.')
                .regex(/^[A-Za-z\s]+$/, 'Name must contain only letters and spaces.'),
              email: z.string()
                .email('Please enter a valid email address.')
                .optional()
                .or(z.literal(''))
            }
            : {})
        })
      )
      : undefined,
    defaultValues: {
      countryCode: storedCountryCode || '',
      phoneNumber: storedPhoneNumber || '',
      ...(!isLoginMode ? { name: '', email: '' } : {})
    }
  })


  // OTP form
  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ''
    }
  })

  // User info form
  const userInfoForm = useForm({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      name: '',
      email: ''
    }
  })

  // Memoized function to load countries
  const loadCountries = useCallback(async () => {
    if (countries.length > 0) return // Don't load if already loaded

    try {
      const countryData = await fetchCountries()

      setCountries(countryData)
      setFilteredCountries(countryData)

      // Set default country (US)
      const defaultCountry = countryData.find(c => c.code === 'US') || countryData[0]
      if (defaultCountry && !storedCountryCode) {
        setSelectedCountry(defaultCountry)
        phoneForm.setValue('countryCode', defaultCountry.dialCode)
      } else if (storedCountryCode) {
        const storedCountry = countryData.find(c => c.dialCode === storedCountryCode)
        if (storedCountry) {
          setSelectedCountry(storedCountry)
        }
      }
    } catch (error) {
      toast.error('Failed to load countries.')
    } finally {
      setCountriesLoading(false)
    }
  }, [countries.length, storedCountryCode, phoneForm])

  // Load countries on component mount
  useEffect(() => {
    loadCountries()
  }, [loadCountries])

  // Handle country search
  useEffect(() => {
    const filtered = searchCountries(countries, countrySearch)
    setFilteredCountries(filtered)
  }, [countries, countrySearch])

  // Handle phone form submission
  const onPhoneSubmit = async (data) => {
    try {
      const result = await dispatch(sendOTP(data.phoneNumber, data.countryCode, isLoginMode))
      if (result.success) {
        toast.success('OTP sent successfully!')
      } else {
        toast.error(result.error || 'Failed to send OTP.')
      }
    } catch (error) {
      console.error('Phone submission error:', error)
      toast.error('Failed to send OTP.')
    }
  }

  // Handle OTP form submission
  const onOTPSubmit = async (data) => {
    try {
      let userInfo = null
      if (!isLoginMode) {
        // For signup, get user info from form
        userInfo = {
          name: phoneForm.getValues('name'),
          email: phoneForm.getValues('email') || ''
        }
      }

      const result = await dispatch(verifyOTP(data.otp, storedPhoneNumber, storedCountryCode, isLoginMode, userInfo))
      console.log('OTP verification result:', result)

      if (result.success) {
        if (result.showUserForm) {
          toast.success('OTP verified! Please complete your profile.')
        } else {
          toast.success(isLoginMode ? 'Login successful!' : 'Account created successfully!')
          // Navigation should happen automatically via Redux state change
        }
      } else {
        toast.error(result.error || 'Invalid OTP.')
      }
    } catch (error) {
      toast.error('Failed to verify OTP.')
    }
  }

  // Handle user info form submission
  const onUserInfoSubmit = async (data) => {
    try {
      const userInfo = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        email: data.email || '',
        phoneNumber: storedPhoneNumber,
        countryCode: storedCountryCode,
        joinedAt: new Date().toISOString()
      }

      dispatch(setUserInfo(userInfo))
      toast.success(`Welcome, ${data.name}! Your account has been created.`)
    } catch (error) {
      toast.error('Failed to create account.')
    }
  }

  // Handle country selection
  const handleCountrySelect = (country) => {
    setSelectedCountry(country)
    phoneForm.setValue('countryCode', country.dialCode)
    phoneForm.setValue('phoneNumber', '') // Clear phone number when country changes
    setShowCountryDropdown(false)
    setCountrySearch('')
  }

  // Handle phone number input formatting
  const handlePhoneNumberChange = (e) => {
    const formatted = formatPhoneInput(e.target.value)
    const pattern = selectedCountry ? getPhonePattern(selectedCountry.dialCode) : getPhonePattern('default')

    if (formatted.length <= pattern.maxLength) {
      phoneForm.setValue('phoneNumber', formatted)
    }
  }

  // Handle OTP input formatting  
  const handleOTPChange = (e) => {
    const formatted = formatOTPInput(e.target.value)
    otpForm.setValue('otp', formatted)
    otpForm.trigger('otp')
  }

  // Handle back to phone input
  const handleBackToPhone = () => {
    dispatch(resetOTP())
    otpForm.reset()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gemini-blue via-gemini-purple to-gemini-teal flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-md w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-3 sm:p-4">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm sm:text-base text-white/80">
            {isLoginMode ? 'Sign in to continue your conversation' : 'Join Gemini Clone today'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="card p-4 sm:p-6">
          {showUserInfoForm ? (
            // User Info Form
            <form onSubmit={userInfoForm.handleSubmit(onUserInfoSubmit)} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Complete Your Profile
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Just a few more details to get started
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...userInfoForm.register('name')}
                  type="text"
                  placeholder="Enter your full name"
                  className="input-field"
                  autoFocus
                />
                {userInfoForm.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {userInfoForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address (Optional)
                </label>
                <input
                  {...userInfoForm.register('email')}
                  type="email"
                  placeholder="Enter your email address"
                  className="input-field"
                />
                {userInfoForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {userInfoForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Complete Signup</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => dispatch(resetOTP())}
                  className="w-full btn-secondary"
                >
                  Back to Phone
                </button>
              </div>
            </form>
          ) : !otpSent ? (
            // Phone Number Form (with optional signup fields)
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
              {/* Name Field - Only show in signup mode */}
              {!isLoginMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...phoneForm.register('name')}
                    type="text"
                    placeholder="Enter your full name"
                    className="input-field"
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                      phoneForm.trigger('name') // clears error when valid
                    }}
                  />
                  {phoneForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {phoneForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
              )}

              {/* Email Field - Only show in signup mode */}
              {!isLoginMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address (Optional)
                  </label>
                  <input
                    {...phoneForm.register('email')}
                    type="email"
                    placeholder="Enter your email address"
                    className="input-field"
                    onInput={() => phoneForm.trigger('email')}
                  />
                  {phoneForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {phoneForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>

                {/* Country Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    disabled={countriesLoading}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    {countriesLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : selectedCountry ? (
                      <>
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Select</span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Country Dropdown */}
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
                      <div className="p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700">
                        <input
                          type="text"
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountrySelect(country)}
                            className="w-full flex items-center space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            <span className="text-base sm:text-lg">{country.flag}</span>
                            <span className="flex-1 text-xs sm:text-sm truncate">{country.name}</span>
                            <span className="text-xs sm:text-sm text-gray-500">{country.dialCode}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Input */}
                <div className="flex">
                  <div className="flex-1">
                    <input
                      {...phoneForm.register('phoneNumber')}
                      type="tel"
                      placeholder={selectedCountry ? getPhonePattern(selectedCountry.dialCode).placeholder : "Enter your phone number"}
                      maxLength={selectedCountry ? getPhonePattern(selectedCountry.dialCode).maxLength : 15}
                      className="input-field rounded-l-none"
                      onChange={(e) => {
                        handlePhoneNumberChange(e);
                        phoneForm.trigger('phoneNumber'); // ✅ clear error when valid
                      }}
                      onKeyPress={(e) => {
                        // Only allow digits
                        if (!/[\d]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                          e.preventDefault()
                        }
                      }}
                    />
                  </div>
                </div>

                {phoneForm.formState.errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {phoneForm.formState.errors.phoneNumber.message}
                  </p>
                )}
                {phoneForm.formState.errors.countryCode && (
                  <p className="text-red-500 text-sm mt-1">
                    {phoneForm.formState.errors.countryCode.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    <span>Send OTP</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {isLoginMode ? 'Sign up' : 'Login'}
                  </button>
                </p>
              </div>
            </form>
          ) : (
            // OTP Verification Form
            <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Verify OTP
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Enter the 6-digit code sent to<br />
                  <span className="font-medium">
                    {selectedCountry?.dialCode} {storedPhoneNumber}
                  </span>
                </p>
              </div>

              <div>
                <input
                  {...otpForm.register('otp')}
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="input-field text-center text-base sm:text-lg tracking-widest"
                  onChange={handleOTPChange}
                  onKeyPress={(e) => {
                    // Only allow digits
                    if (!/[\d]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                      e.preventDefault()
                    }
                  }}
                  autoFocus
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-red-500 text-sm mt-1">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>{isLoginMode ? 'Verify & Login' : 'Verify & Create Account'}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToPhone}
                  className="w-full btn-secondary"
                >
                  Back to Phone Number
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={() => onPhoneSubmit({ phoneNumber: storedPhoneNumber, countryCode: storedCountryCode })}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Demo Note */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-white/70 text-xs sm:text-sm px-2">
            Demo: Enter any 6-digit number as OTP to login
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage