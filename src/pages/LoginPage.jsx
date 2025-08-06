import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { fetchCountries, searchCountries } from '../utils/countryApi'
import { getPhonePattern, validatePhoneNumber, formatPhoneInput, formatOTPInput, getPhoneValidationMessage } from '../utils/phoneValidation'
import { Phone, ChevronDown, Loader2, Sparkles } from 'lucide-react'

// Validation schemas
const createPhoneSchema = (countryCode) => z.object({
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

function LoginPage() {
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

  // Phone form
  const phoneForm = useForm({
    resolver: selectedCountry ? zodResolver(createPhoneSchema(selectedCountry.dialCode)) : undefined,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: {
      countryCode: '',
      phoneNumber: ''
    }
  })

  // OTP form
  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
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
        phoneForm.setValue('countryCode', defaultCountry.dialCode)
      }
    } catch (error) {
      toast.error('Failed to load countries')
    } finally {
      setCountriesLoading(false)
    }
  }, [countries.length, phoneForm])

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
    if (loading) return // Prevent double submission
    
    setLoading(true)
    
    try {
      // Clear any existing errors
      phoneForm.clearErrors()
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if user exists
      const existingUsers = JSON.parse(localStorage.getItem('gemini_users') || '[]')
      const userExists = existingUsers.find(user => 
        user.phoneNumber === data.phoneNumber && user.countryCode === data.countryCode
      )
      
      if (!userExists) {
        toast.error('No account found with this phone number. Please sign up first.')
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
        // Get user from localStorage
        const existingUsers = JSON.parse(localStorage.getItem('gemini_users') || '[]')
        const user = existingUsers.find(user => 
          user.phoneNumber === storedData.phoneNumber && user.countryCode === storedData.countryCode
        )
        
        if (user) {
          // Save current user session
          localStorage.setItem('gemini_current_user', JSON.stringify(user))
          
          // Dispatch login success
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: user
          })
          
          toast.success('Login successful!')
        } else {
          toast.error('User not found')
        }
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
    phoneForm.setValue('countryCode', country.dialCode)
    phoneForm.setValue('phoneNumber', '')
    setShowCountryDropdown(false)
    setCountrySearch('')
    // Clear country code error since a country is selected
    phoneForm.clearErrors('countryCode')
    // Also clear phone number error since we're resetting it
    phoneForm.clearErrors('phoneNumber')
  }
  
  const handlePhoneNumberChange = (e) => {
    const formatted = formatPhoneInput(e.target.value)
    const pattern = selectedCountry ? getPhonePattern(selectedCountry.dialCode) : getPhonePattern('default')
    
    if (formatted.length <= pattern.maxLength) {
      phoneForm.setValue('phoneNumber', formatted)
    }
  }
  
  const handlePhoneNumberFocus = () => {
    phoneForm.clearErrors('phoneNumber')
  }
  
  const handleOTPChange = (e) => {
    const formatted = formatOTPInput(e.target.value)
    otpForm.setValue('otp', formatted)
  }
  
  const handleOTPFocus = () => {
    otpForm.clearErrors('otp')
  }

  const handleBackToPhone = () => {
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
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {/* Auth Card */}
        <div className="card p-6 sm:p-8 animate-bounce-in">
          {!otpSent ? (
            // Phone Number Form
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-5 md:space-y-6">
              <div className="form-field">
                <label className="form-label">
                  Phone Number *
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
                      {...phoneForm.register('phoneNumber')}
                      type="tel"
                      placeholder={selectedCountry ? getPhonePattern(selectedCountry.dialCode).placeholder : "Enter your phone number"}
                      maxLength={selectedCountry ? getPhonePattern(selectedCountry.dialCode).maxLength : 15}
                      className="input-field rounded-l-none border-l-0 focus:border-l focus:border-blue-500"
                      onFocus={handlePhoneNumberFocus}
                      onChange={handlePhoneNumberChange}
                      onKeyPress={(e) => {
                        if (!/[\d]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                          e.preventDefault()
                        }
                      }}
                    />
                  </div>
                </div>
                
                {phoneForm.formState.errors.phoneNumber && (
                  <p className="form-error">
                    {phoneForm.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
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
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            // OTP Verification Form
            <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-5 md:space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
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
                  onFocus={handleOTPFocus}
                  onChange={handleOTPChange}
                  onKeyPress={(e) => {
                    if (!/[\d]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                      e.preventDefault()
                    }
                  }}
                  autoFocus
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
                  disabled={loading}
                  className={`w-full btn-primary flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 ${loading ? 'btn-loading' : ''}`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Login</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToPhone}
                  className="w-full btn-secondary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Phone Number
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={() => onPhoneSubmit(storedData)}
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
              Demo: Enter any 6-digit number as OTP to login
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage