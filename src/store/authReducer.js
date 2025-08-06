// Auth Action Types
export const AUTH_ACTIONS = {
  SEND_OTP_START: 'SEND_OTP_START',
  SEND_OTP_SUCCESS: 'SEND_OTP_SUCCESS',
  SEND_OTP_ERROR: 'SEND_OTP_ERROR',
  VERIFY_OTP_START: 'VERIFY_OTP_START',
  VERIFY_OTP_SUCCESS: 'VERIFY_OTP_SUCCESS',
  VERIFY_OTP_ERROR: 'VERIFY_OTP_ERROR',
  SET_USER_INFO: 'SET_USER_INFO',
  SET_PHONE_NUMBER: 'SET_PHONE_NUMBER',
  SET_COUNTRY_CODE: 'SET_COUNTRY_CODE',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  RESET_OTP: 'RESET_OTP'
}

// Initial State
const initialState = {
  isAuthenticated: false,
  user: null,
  phoneNumber: '',
  countryCode: '',
  otpSent: false,
  otpVerified: false,
  showUserInfoForm: false,
  loading: false,
  error: null
}

// Reducer
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_PHONE_NUMBER:
      return {
        ...state,
        phoneNumber: action.payload
      }
      
    case AUTH_ACTIONS.SET_COUNTRY_CODE:
      return {
        ...state,
        countryCode: action.payload
      }
      
    case AUTH_ACTIONS.SEND_OTP_START:
      return {
        ...state,
        loading: true,
        otpSent: false,
        error: null
      }
      
    case AUTH_ACTIONS.SEND_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        otpSent: true,
        phoneNumber: action.payload.phoneNumber,
        countryCode: action.payload.countryCode
      }
      
    case AUTH_ACTIONS.SEND_OTP_ERROR:
      return {
        ...state,
        loading: false,
        otpSent: false,
        error: action.payload
      }
      
    case AUTH_ACTIONS.VERIFY_OTP_START:
      return {
        ...state,
        loading: true,
        error: null
      }
      
    case AUTH_ACTIONS.VERIFY_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        otpVerified: true,
        showUserInfoForm: true,
        otpSent: false
      }
      
    case AUTH_ACTIONS.SET_USER_INFO:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        showUserInfoForm: false,
        otpVerified: false
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        otpSent: false,
        otpVerified: false,
        showUserInfoForm: false,
        error: null
      }
      
    case AUTH_ACTIONS.VERIFY_OTP_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
      
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        phoneNumber: '',
        countryCode: '',
        otpSent: false,
        otpVerified: false,
        showUserInfoForm: false,
        error: null
      }
      
    case AUTH_ACTIONS.RESET_OTP:
      return {
        ...state,
        otpSent: false,
        otpVerified: false,
        showUserInfoForm: false,
        error: null
      }
      
    default:
      return state
  }
}

export default authReducer