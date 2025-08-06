import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

import authReducer from './authSlice'
import themeReducer from './themeSlice'
import chatReducer from './chatSlice'

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'theme', 'chat'] // Only persist these reducers
}

// Auth persist config
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['isAuthenticated', 'user'] // Only persist auth state
}

// Chat persist config  
const chatPersistConfig = {
  key: 'chat',
  storage,
  whitelist: ['chatrooms', 'messages'] // Only persist chatrooms and messages
}

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  theme: themeReducer,
  chat: persistReducer(chatPersistConfig, chatReducer)
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
})

export const persistor = persistStore(store)

export default store