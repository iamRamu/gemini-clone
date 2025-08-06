// Theme Action Types
export const THEME_ACTIONS = {
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_THEME: 'SET_THEME'
}

// Initial State
const initialState = {
  isDarkMode: false
}

// Reducer
const themeReducer = (state = initialState, action) => {
  switch (action.type) {
    case THEME_ACTIONS.TOGGLE_THEME:
      return {
        ...state,
        isDarkMode: !state.isDarkMode
      }
      
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        isDarkMode: action.payload
      }
      
    default:
      return state
  }
}

export default themeReducer