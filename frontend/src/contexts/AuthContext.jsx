// frontend/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isLoggedIn, logout as apiLogout } from '../api/auth';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Start with false to avoid loading screen

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuthStatus = async () => {
      try {
        if (isLoggedIn()) {
          console.log('User has stored token, checking validity...');
          const userData = await getCurrentUser();
          console.log('User data received:', userData);
          setUser(userData);
        } else {
          console.log('No stored token found');
        }
      } catch (error) {
        console.warn('Auth check failed:', error);
        // Token might be expired, clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    // Delay auth check slightly to ensure React is fully mounted
    const timer = setTimeout(checkAuthStatus, 100);
    return () => clearTimeout(timer);
  }, []);

  const login = (userData) => {
    console.log('Setting user in context:', userData);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local state and tokens
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}