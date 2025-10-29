import { useState, useEffect } from 'react';

/**
 * Custom hook that persists state to localStorage
 *
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - The default value if nothing is in localStorage
 * @returns {[any, Function]} - [state, setState] tuple like useState
 */
export const usePersistedState = (key, defaultValue) => {
  // Initialize state from localStorage or use default
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Update localStorage whenever state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
};

/**
 * Clear persisted navigation state (for logout)
 */
export const clearNavigationState = () => {
  try {
    window.localStorage.removeItem('mantrix-selectedTab');
    window.localStorage.removeItem('mantrix-stoxView');
    window.localStorage.removeItem('mantrix-drawerOpen');
    window.localStorage.removeItem('mantrix-markets-enabled-categories');
  } catch (error) {
    console.error('Error clearing navigation state:', error);
  }
};

export default usePersistedState;
