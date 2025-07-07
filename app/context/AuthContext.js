import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../../lib/supabase';


// Storage keys
const STORAGE_KEYS = {
  SESSION: 'auth_session',
  USER_ROLE: 'user_role',
};

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Function to store session data
  const storeSession = useCallback(async (session) => {
    try {
      if (session) {
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);
      }
    } catch (error) {
      console.error('Error storing session:', error);
    }
  }, []);

  // Function to load session from storage
  const loadSessionFromStorage = useCallback(async () => {
    try {
      const sessionData = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
      const storedUserRole = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
      
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return { session, userRole: storedUserRole };
      }
      return { session: null, userRole: null };
    } catch (error) {
      console.error('Error loading session from storage:', error);
      return { session: null, userRole: null };
    }
  }, []);

  // Function to fetch user role from profiles table
  const fetchUserRole = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role_name')
        .eq('id', userId)
        .single();
      
      if (error) throw error;

      const role = data?.role_name;
      setUserRole(role);
      
      // Store user role
      if (role) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role);

      }
      
      return role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);
      return null;
    }
  }, []);

  // Function to refresh the token
  const refreshToken = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        // Clear auth state if no valid session
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        await storeSession(null);
        return;
      }

      // Check if token is about to expire (within 5 minutes)
      const expiresAt = session.expires_at * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < 5 * 60 * 1000) {
        console.log('Refreshing token...');
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !data.session) {
          // Clear auth state if refresh fails
          setUser(null);
          setIsAuthenticated(false);
          setUserRole(null);
          await storeSession(null);
          return;
        }
        
        // Update with new session
        setUser(data.session.user);
        setIsAuthenticated(true);
        await storeSession(data.session);
        await fetchUserRole(data.session.user.id);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear auth state on error
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
      await storeSession(null);
    }
  }, [storeSession, fetchUserRole]);

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, try to get session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          // Valid session exists
          setUser(session.user);
          setIsAuthenticated(true);
          await storeSession(session);
          
          // Load user role from storage first, then fetch if needed
          const storedUserRole = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
          if (storedUserRole) {
            setUserRole(storedUserRole);
          }
          
          // Fetch fresh user role
          await fetchUserRole(session.user.id);
        } else {
          // No valid session, clear state
          setUser(null);
          setIsAuthenticated(false);
          setUserRole(null);
          await storeSession(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        await storeSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [storeSession, fetchUserRole]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await storeSession(session);
        await fetchUserRole(session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        await storeSession(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [storeSession, fetchUserRole]);

  // Handle app state changes for token refresh
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && isAuthenticated) {
        // App came to foreground, refresh token if authenticated
        refreshToken();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshToken, isAuthenticated]);

  // Login function
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        await storeSession(data.session);
        await fetchUserRole(data.user.id);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Signup function
  const signup = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username || "user",
            phone: userData.phone || null,
          }
        }
      });

      if (error) {
        if (error.code === '23505' || error.message?.includes('already registered')) {
          throw new Error('هذا البريد الإلكتروني مسجل بالفعل');
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {

      
      // Clear auth state
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
      
      // Clear stored session
      await storeSession(null);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Update user data
  const updateUser = async (newUserData) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: newUserData,
      });

      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        // Update stored session with new user data
        const currentSession = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
        if (currentSession) {
          const session = JSON.parse(currentSession);
          session.user = data.user;
          await storeSession(session);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://v0-expo-supabase-password-reset.vercel.app/reset-password',
      });
      if (error) throw error; 
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (newPassword, oldPassword) => {
    try {
      const token = await getAccessToken();
      const response = await axios.patch(
        'https://water-supplier-2.onrender.com/api/k1/users/updatePassword',
        {
          password: oldPassword, // current password
          newPassword: newPassword,
          confirmPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // After successful password change, log the user out
      setIsAuthenticated(false);
      setUser(null);
      await storeSession(null);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Function to get current access token
  const getAccessToken = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    userRole,
    login,
    signup,
    logout,
    updateUser,
    refreshToken,
    requestPasswordReset,
    resetPassword,
    fetchUserRole,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 