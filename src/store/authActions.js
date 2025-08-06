import { AUTH_ACTIONS } from './authReducer'

// Action Creators
export const setPhoneNumber = (phoneNumber) => ({
  type: AUTH_ACTIONS.SET_PHONE_NUMBER,
  payload: phoneNumber
})

export const setCountryCode = (countryCode) => ({
  type: AUTH_ACTIONS.SET_COUNTRY_CODE,
  payload: countryCode
})

export const logout = () => ({
  type: AUTH_ACTIONS.LOGOUT
})

export const resetOTP = () => ({
  type: AUTH_ACTIONS.RESET_OTP
})

export const setUserInfo = (userInfo) => ({
  type: AUTH_ACTIONS.SET_USER_INFO,
  payload: userInfo
})

// Async Action for sending OTP
export const sendOTP = (phoneNumber, countryCode, isLoginMode = true) => {
  return async (dispatch) => {
    dispatch({ type: AUTH_ACTIONS.SEND_OTP_START })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Check if user exists for login mode
      if (isLoginMode) {
        const existingUsers = JSON.parse(localStorage.getItem('gemini_users') || '[]')
        const userExists = existingUsers.find(user => 
          user.phoneNumber === phoneNumber && user.countryCode === countryCode
        )
        
        if (!userExists) {
          dispatch({
            type: AUTH_ACTIONS.SEND_OTP_ERROR,
            payload: 'No account found with this phone number. Please sign up first.'
          })
          return { success: false, error: 'No account found with this phone number. Please sign up first.' }
        }
      } else {
        // Check if user already exists for signup mode
        const existingUsers = JSON.parse(localStorage.getItem('gemini_users') || '[]')
        const userExists = existingUsers.find(user => 
          user.phoneNumber === phoneNumber && user.countryCode === countryCode
        )
        
        if (userExists) {
          dispatch({
            type: AUTH_ACTIONS.SEND_OTP_ERROR,
            payload: 'An account with this phone number already exists. Please login instead.'
          })
          return { success: false, error: 'An account with this phone number already exists. Please login instead.' }
        }
      }
      
      dispatch({
        type: AUTH_ACTIONS.SEND_OTP_SUCCESS,
        payload: { phoneNumber, countryCode, isLoginMode }
      })
      
      return { success: true }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SEND_OTP_ERROR,
        payload: 'Failed to send OTP'
      })
      return { success: false, error: 'Failed to send OTP' }
    }
  }
}

// Async Action for verifying OTP
export const verifyOTP = (otp, phoneNumber, countryCode, isLoginMode = true, userInfo = null) => {
  return async (dispatch, getState) => {
    dispatch({ type: AUTH_ACTIONS.VERIFY_OTP_START })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simple validation - accept any 6-digit OTP for demo
      if (otp.length === 6) {
        if (isLoginMode) {
          // Login flow - find existing user
          const existingUsers = JSON.parse(localStorage.getItem('gemini_users') || '[]')
          const user = existingUsers.find(user => 
            user.phoneNumber === phoneNumber && user.countryCode === countryCode
          )
          
          if (user) {
            // Save current user session
            localStorage.setItem('gemini_current_user', JSON.stringify(user))
            
            // Dispatch login success
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: user
            })
            
            return { success: true, showUserForm: false }
          } else {
            return { success: false, error: 'User not found' }
          }
        } else {
          // Signup flow - create new user
          if (userInfo) {
            const newUser = {
              id: Math.random().toString(36).substr(2, 9),
              name: userInfo.name,
              email: userInfo.email || '',
              phoneNumber: phoneNumber,
              countryCode: countryCode,
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
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: newUser
            })
            
            return { success: true, showUserForm: false }
          } else {
            // Need user info for signup
            dispatch({
              type: AUTH_ACTIONS.VERIFY_OTP_SUCCESS
            })
            return { success: true, showUserForm: true }
          }
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.VERIFY_OTP_ERROR,
          payload: 'Invalid OTP'
        })
        return { success: false, error: 'Invalid OTP' }
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.VERIFY_OTP_ERROR,
        payload: 'Failed to verify OTP'
      })
      return { success: false, error: 'Failed to verify OTP' }
    }
  }
}