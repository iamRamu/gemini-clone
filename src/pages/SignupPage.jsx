import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { fetchCountries, searchCountries } from '../utils/countryApi'
import { getPhonePattern, validatePhoneNumber, formatPhoneInput, formatOTPInput, getPhoneValidationMessage } from '../utils/phoneValidation'
import { Phone, ChevronDown, Loader2, Sparkles, User, Mail } from 'lucide-react'

// Validation schemas
const createSignupSchema = (countryCode) => z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  countryCode: z.string().min(1, 'Please select a country'),
  phoneNumber: z.string()
    .regex(/^\d+$/, 'Phone number must contain only digits')
    .refine(
      (phone) => validatePhoneNumber(phone, countryCode),
      { message: getPhoneValidationMessage(countryCode) }
    )
})

const otpSchema = z.object({
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits')
})

function SignupPage() {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [storedData, setStoredData] = useState({})

  const [countries, setCountries] = useState([])
  const [filteredCountries, setFilteredCountries] = useState([])
  const [countrySearch, setCountrySearch] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [countriesLoading, setCountriesLoading] = useState(true)

  // Signup form
  const signupForm = useForm({
    resolver: selectedCountry ? zodResolver(createSignupSchema(selectedCountry.dialCode)) : undefined,
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      countryCode: '',
      phoneNumber: ''
    }
  })

  // OTP form
  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      otp: ''
    }
  })

  // Load countries
  const loadCountries = useCallback(async () => {
    if (countries.length > 0) return

    try {
      const countryData = await fetchCountries()
      setCountries(countryData)
      setFilteredCountries(countryData)

      // Set default country (US)
      const defaultCountry = countryData.find(c => c.code === 'US') || countryData[0]
      if (defaultCountry) {
        setSelectedCountry(defaultCountry)
        signupForm.setValue('countryCode', defaultCountry.dialCode)
      }
    } catch (error) {
      toast.error('Failed to load countries')
    } finally {
      setCountriesLoading(false)
    }
  }, [countries.length, signupForm])

  useEffect(() => {
    loadCountries()
  }, [loadCountries])

  // Handle country search
  useEffect(() => {
    const filtered = searchCountries(countries, countrySearch)
    setFilteredCountries(filtered)
  }, [countries, countrySearch])


  // Handle signup form submission
  const onSignupSubmit = async (data) => {
    if (loading) return // Prevent double submission

    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('gemini_users') || '[]')
      const userExists = existingUsers.find(user =>
        user.phoneNumber === data.phoneNumber && user.countryCode === data.countryCode
      )

      if (userExists) {
        toast.error('An account with this phone number already exists. Please login instead.')
        setLoading(false)
        return
      }

      setStoredData(data)
      setOtpSent(true)
      toast.success('OTP sent successfully!')

    } catch (error) {
      toast.error('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP form submission
  const onOTPSubmit = async (data) => {
    if (loading) return // Prevent double submission

    setLoading(true)

    try {
      // Clear any existing errors
      otpForm.clearErrors()

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Validate OTP (accept any 6-digit number for demo)
      if (data.otp.length === 6) {
        // Create new user
        const newUser = {
          id: Math.random().toString(36).substr(2, 9),
          name: storedData.name,
          email: storedData.email || '',
          phoneNumber: storedData.phoneNumber,
          countryCode: storedData.countryCode,
          joinedAt: new Date().toISOString()
        }

        // Save to localStorage
        const existingUsers = JSON.parse(localStorage.getItem('gemini_users') || '[]')
        existingUsers.push(newUser)
        localStorage.setItem('gemini_users', JSON.stringify(existingUsers))

        // Save current user session
        localStorage.setItem('gemini_current_user', JSON.stringify(newUser))

        // Dispatch login success
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: newUser
        })

        toast.success(`Welcome, ${newUser.name}! Your account has been created.`)
      } else {
        otpForm.setError('otp', { message: 'Please enter a valid 6-digit OTP' })
        toast.error('Invalid OTP')
      }
    } catch (error) {
      toast.error('Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleCountrySelect = (country) => {
    setSelectedCountry(country)
    signupForm.setValue('countryCode', country.dialCode, { shouldValidate: true })
    signupForm.setValue('phoneNumber', '', { shouldValidate: true })
    setShowCountryDropdown(false)
    setCountrySearch('')
  }

  const handlePhoneNumberChange = (e) => {
    const formatted = formatPhoneInput(e.target.value)
    const pattern = selectedCountry ? getPhonePattern(selectedCountry?.dialCode) : getPhonePattern('default')

    if (formatted.length <= pattern.maxLength) {
      signupForm.setValue('phoneNumber', formatted, { shouldValidate: true })
    }
  }

  const handleOTPChange = (e) => {
    const formatted = formatOTPInput(e.target.value)
    otpForm.setValue('otp', formatted, { shouldValidate: true })
  }

  const handleBackToSignup = () => {
    setOtpSent(false)
    setStoredData({})
    otpForm.reset()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gemini-blue via-gemini-purple to-gemini-teal flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="header-icon">
              <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </div>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Gemini Clone today</p>
        </div>

        {/* Auth Card */}
        <div className="card p-6 sm:p-8 animate-bounce-in">
          {!otpSent ? (
            // Signup Form
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4 md:space-y-5" autoComplete="off" data-form-type="signup">
              {/* Name Field */}
              <div className="form-field">
                <label className="form-label-required">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...signupForm.register('name')}
                    type="text"
                    placeholder="Enter your full name"
                    className="input-field pl-9"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                  />
                </div>
                {signupForm.formState.errors.name && (
                  <p className="form-error">
                    {signupForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="form-field">
                <label className="form-label">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...signupForm.register('email')}
                    type="text"
                    placeholder="Enter your email address"
                    className="input-field pl-9"
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                  />
                </div>
                {signupForm.formState.errors.email && (
                  <p className="form-error">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Number Field */}
              <div className="form-field">
                <label className="form-label-required">
                  Phone Number
                </label>

                {/* Country Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    disabled={countriesLoading}
                    className="country-button"
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
                    <div className="country-dropdown animate-scale-in">
                      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                        <input
                          type="text"
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm"
                          autoComplete="off"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto scrollbar-hide">
                        {filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountrySelect(country)}
                            className="country-item"
                          >
                            <span className="text-xl">{country.flag}</span>
                            <span className="flex-1 text-sm font-medium truncate">{country.name}</span>
                            <span className="text-sm text-gray-500 font-mono">{country.dialCode}</span>
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
                      {...signupForm.register('phoneNumber')}
                      type="text"
                      placeholder={selectedCountry ? getPhonePattern(selectedCountry.dialCode).placeholder : "Enter your phone number"}
                      maxLength={selectedCountry ? getPhonePattern(selectedCountry.dialCode).maxLength : 15}
                      className="input-field rounded-l-none border-l-0 focus:border-l focus:border-blue-500"
                      onChange={handlePhoneNumberChange}
                      onKeyPress={(e) => {
                        if (!/[\d]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                          e.preventDefault()
                        }
                      }}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                    />
                  </div>
                </div>

                {signupForm.formState.errors.phoneNumber && (
                  <p className="form-error">
                    {signupForm.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || countriesLoading}
                className={`w-full btn-primary flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 ${loading ? 'btn-loading' : ''}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    <span>Send OTP</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            // OTP Verification Form
            <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-5 md:space-y-6 animate-fade-in" autoComplete="off" data-form-type="otp">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Verify Your Phone
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Enter the 6-digit code sent to<br />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedCountry?.dialCode} {storedData.phoneNumber}
                  </span>
                </p>
              </div>

              <div className="form-field">
                <input
                  {...otpForm.register('otp')}
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="otp-input"
                  onChange={handleOTPChange}
                  onKeyPress={(e) => {
                    if (!/[\d]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                      e.preventDefault()
                    }
                  }}
                  autoFocus
                  autoComplete="one-time-code"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                />
                {otpForm.formState.errors.otp && (
                  <p className="form-error">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading || !otpForm.watch('otp') || otpForm.watch('otp').length !== 6}
                  className={`w-full btn-primary flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 ${loading ? 'btn-loading' : ''}`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Create Account</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToSignup}
                  className="w-full btn-secondary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Signup
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={() => onSignupSubmit(storedData)}
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
        <div className="text-center mt-6 sm:mt-8">
          <div className="demo-note">
            <p className="font-medium">
              Demo: Enter any 6-digit number as OTP to create account
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage