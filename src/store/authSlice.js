import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunks
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async ({ phoneNumber, countryCode }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      return { phoneNumber, countryCode }
    } catch (error) {
      return rejectWithValue('Failed to send OTP')
    }
  }
)

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ otp, phoneNumber, countryCode }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simple validation - accept any 6-digit OTP for demo
      if (otp.length === 6) {
        const user = {
          id: Math.random().toString(36).substr(2, 9),
          phoneNumber,
          countryCode,
          name: `User ${Math.floor(Math.random() * 1000)}`
        }
        
        return user
      } else {
        return rejectWithValue('Invalid OTP')
      }
    } catch (error) {
      return rejectWithValue('Failed to verify OTP')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
    phoneNumber: '',
    countryCode: '',
    otpSent: false,
    loading: false,
    error: null
  },
  reducers: {
    setPhoneNumber: (state, action) => {
      state.phoneNumber = action.payload
    },
    setCountryCode: (state, action) => {
      state.countryCode = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.phoneNumber = ''
      state.countryCode = ''
      state.otpSent = false
      state.error = null
    },
    resetOTP: (state) => {
      state.otpSent = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.loading = false
        state.otpSent = true
        state.phoneNumber = action.payload.phoneNumber
        state.countryCode = action.payload.countryCode
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
        state.otpSent = false
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { setPhoneNumber, setCountryCode, logout, resetOTP, clearError } = authSlice.actions
export default authSlice.reducer