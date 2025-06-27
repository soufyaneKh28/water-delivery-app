import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../../lib/supabase';

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
  const [refreshTokenInterval, setRefreshTokenInterval] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Function to refresh the token
  const refreshToken = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        // If there's an error getting the session, just clear the auth state
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        return;
      }

      if (session) {
        // Check if token is about to expire (within 5 minutes)
        const expiresAt = session.expires_at * 1000; // Convert to milliseconds
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        if (timeUntilExpiry < 5 * 60 * 1000) { // 5 minutes in milliseconds
          console.log('Refreshing token...');
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            // If refresh fails, just clear the auth state without showing an alert
            setUser(null);
            setIsAuthenticated(false);
            setUserRole(null);
            return;
          }
          
          if (data.session) {
            setUser(data.session.user);
            setIsAuthenticated(true);
            setAccessToken(data.session.access_token);
            AsyncStorage.setItem('access_token', data.session.access_token);
            await fetchUserRole(data.session.user.id);
          }
        }
      } else {
        // No session, clear auth state
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setAccessToken(null);
        AsyncStorage.removeItem('access_token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear auth state without showing an alert
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
      setAccessToken(null);
      AsyncStorage.removeItem('access_token');
    }
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    // Clear any existing interval
    if (refreshTokenInterval) {
      clearInterval(refreshTokenInterval);
    }

    // Set up new interval to check token every minute
    const interval = setInterval(refreshToken, 60 * 1000); // Check every minute
    setRefreshTokenInterval(interval);

    // Clean up interval on unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [refreshToken]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground, refresh token
        refreshToken();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshToken]);

  // On app start, load token from AsyncStorage
  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) setAccessToken(token);
    };
    loadToken();
  }, []);

  // Check active sessions and listen for auth changes
  useEffect(() => {
    let mounted = true;

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        setAccessToken(session.access_token);
        AsyncStorage.setItem('access_token', session.access_token);
        // Fetch user role from profiles table
        fetchUserRole(session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setAccessToken(null);
        AsyncStorage.removeItem('access_token');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        setAccessToken(session.access_token);
        AsyncStorage.setItem('access_token', session.access_token);
        // Fetch user role from profiles table
        await fetchUserRole(session.user.id);
      } else {
        // Clear auth state without showing alerts
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
        setAccessToken(null);
        AsyncStorage.removeItem('access_token');
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Function to fetch user role from profiles table
  const fetchUserRole = async (userId) => {
    console.log("userId", userId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role_name')
        .eq('id', userId)
        .single()
      if (error) throw error;

      console.log("data after fetchUserRole", data);
      setUserRole(data.role_name);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };

  console.log("user",user);
  
  // Login function
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      if (data.user) {
        // Fetch user role from profiles table
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
      options:{
        data: {
          username: "soufyane",
          phone: '01234567890',
      }

      }
      });

      if (error) {
        if (error.code === '23505' || error.message?.includes('already registered')) {
          throw new Error('هذا البريد الإلكتروني مسجل بالفعل');
        }
        throw error;
      }

      console.log(data);
      
      // If user is created, insert profile
      const userId = data?.user?.id;

      // if (userId && isAuthenticated) {
      //   const { data, error: profileError } = await supabase
      //     .from('profiles')
      //     .upsert({
      //       id: userId,
      //       username: userData.username || email,
      //       phone: userData.phone || null,
      //       full_name: userData.full_name || null,
      //       updated_at: new Date(),
      //       role: userData.role || 'client',
      //     });

      //   if (profileError) {
      //     if (profileError.code === '23505') {
      //       throw new Error('هذا البريد الإلكتروني مسجل بالفعل');
      //     }
      //     throw profileError;
      //   }
      // }

      // return data;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear auth state first to prevent any token-related alerts
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
      setAccessToken(null);
      AsyncStorage.removeItem('access_token');
      
      // Then sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
      // Don't throw error to prevent alerts
    }
  };

  // Update user data
  const updateUser = async (newUserData) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: newUserData,
      });

      if (error) throw error;
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  // Request password reset (send email)
  const requestPasswordReset = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://v0-expo-supabase-password-reset.vercel.app/reset-password', // Updated to external web page
      });
      if (error) throw error; 
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Reset password (after user clicks email link)
  const resetPassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    userRole,
    accessToken,
    login,
    signup,
    logout,
    updateUser,
    refreshToken,
    setIsAuthenticated,
    requestPasswordReset,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 