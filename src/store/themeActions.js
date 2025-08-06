import { THEME_ACTIONS } from './themeReducer'

// Action Creators
export const toggleTheme = () => ({
  type: THEME_ACTIONS.TOGGLE_THEME
})

export const setTheme = (isDarkMode) => ({
  type: THEME_ACTIONS.SET_THEME,
  payload: isDarkMode
})