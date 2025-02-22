import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';
import type { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, fullName: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load user data
  const loadUser = async (token: string) => {
    try {
      const response = await auth.getCurrentUser();
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      // If we can't get user info, clear the tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  // Validate token on mount
  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Validate the token
        await auth.validateToken();
        // If valid, load user data
        await loadUser(token);
      } catch (error) {
        // If token is invalid, try to refresh it
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const response = await auth.refreshToken(refreshToken);
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            await loadUser(response.data.access_token);
          } catch (refreshError) {
            // If refresh fails, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            setUser(null);
          }
        } else {
          // No refresh token, clear everything
          localStorage.removeItem('token');
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login({ username: email, password });
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      await loadUser(access_token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const register = async (email: string, fullName: string, password: string) => {
    try {
      // First register the user
      const registerResponse = await auth.register({ 
        email, 
        full_name: fullName, 
        password 
      });
      
      // Get tokens from registration response
      const { access_token, refresh_token } = registerResponse.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Load user data
      await loadUser(access_token);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const googleLogin = async (token: string) => {
    try {
      const response = await auth.googleLogin(token);
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      await loadUser(access_token);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
    googleLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 