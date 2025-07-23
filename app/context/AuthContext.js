import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useNotification } from './NotificationContext';

// Storage keys
const STORAGE_KEYS = {
  SESSION: 'auth_session',
  USER_ROLE: 'user_role',
  BACKEND_PUSH_REGISTRATION: 'pushTokenSentToBackend',
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

// Send push token to backend
const sendTokenToBackend = async (userId, accessToken, expoPushToken) => {
  try {
    // Check if token was already sent to avoid duplicates
    const alreadySent = await AsyncStorage.getItem(STORAGE_KEYS.BACKEND_PUSH_REGISTRATION);
    if (alreadySent === 'true') {
      console.log('📦 Token already sent to backend. Skipping...');
      return true;
    }

    if (!expoPushToken) {
      console.log('❌ No push token available to send to backend');
      return false;
    }

    console.log('📤 Sending push token to backend...');
    console.log('👤 User ID:', userId);
    console.log('🔑 Token:', expoPushToken.substring(0, 20) + '...');
    console.log('📱 Device Type:', Platform.OS);

    const deviceType = Platform.OS;
    const requestBody = {
      user_id: userId,
      player_id: expoPushToken,
      device_type: deviceType,
    };

    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://water-supplier-2.onrender.com/api/k1/notifications/registerDevice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const responseData = await response.json();
      console.log('✅ Token registered with backend successfully');
      console.log('📦 Response data:', responseData);
      await AsyncStorage.setItem(STORAGE_KEYS.BACKEND_PUSH_REGISTRATION, 'true');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to register token with backend:', response.status, response.statusText);
      console.error('❌ Error response body:', errorText);
      
      // Try to parse error as JSON for more details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Parsed error:', errorJson);
      } catch (parseError) {
        console.error('❌ Could not parse error response as JSON');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending token to backend:', error);
    return false;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState('');

  // Function to store session data
  const storeSession = useCallback(async (session) => {
    try {
      if (session) {
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);
        await AsyncStorage.removeItem(STORAGE_KEYS.BACKEND_PUSH_REGISTRATION);
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

  // Function to handle token registration after login
  const handleTokenRegistration = useCallback(async (userId, accessToken) => {
    try {
      let storedToken = await AsyncStorage.getItem('expo_push_token');
      if (!storedToken) {
        // Wait a bit and try again (token may be generated soon)
        console.log('⏳ No push token found, retrying in 2 seconds...');
        await new Promise(res => setTimeout(res, 2000));
        storedToken = await AsyncStorage.getItem('expo_push_token');
        console.log('🔑 Stored token:', storedToken);
      }
      if (storedToken) {
        setExpoPushToken(storedToken);
        await sendTokenToBackend(userId, accessToken, storedToken);
      } else {
        console.log('📱 No push token available for registration (after retry)');
      }
    } catch (error) {
      console.error('❌ Error handling token registration:', error);
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
          
          // Handle token registration for existing session
          await handleTokenRegistration(session.user.id, session.access_token);
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
  }, [storeSession, fetchUserRole, handleTokenRegistration]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await storeSession(session);
        await fetchUserRole(session.user.id);
        
        // Handle token registration for new login
        if (event === 'SIGNED_IN') {
          await handleTokenRegistration(session.user.id, session.access_token);
        }
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
  }, [storeSession, fetchUserRole, handleTokenRegistration]);

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
        
        // Handle token registration after successful login
        await handleTokenRegistration(data.user.id, data.session.access_token);
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
      console.log('🚪 Starting logout process...');
      // Use notification context for device removal
      let removeDeviceToken, clearStoredNotificationData;
      try {
        ({ removeDeviceToken, clearStoredNotificationData } = useNotification());
      } catch (e) {
        // If not in a component, skip device removal
        removeDeviceToken = null;
        clearStoredNotificationData = null;
      }
      let accessToken = null;
      if (user?.id && expoPushToken && removeDeviceToken) {
        try {
          accessToken = await getAccessToken();
          const deviceRemovalPromise = removeDeviceToken(user.id, accessToken, expoPushToken);
          // Clear notification data immediately
          if (clearStoredNotificationData) await clearStoredNotificationData();
          // Wait for device removal with a maximum timeout
          try {
            await Promise.race([
              deviceRemovalPromise,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]);
          } catch (timeoutError) {
            console.log('Device removal timed out, proceeding with logout');
          }
        } catch (e) {
          console.log('Device removal failed, proceeding with logout');
        }
      }
      // Clear auth state immediately
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
      await storeSession(null);
      // Sign out from Supabase with timeout
      try {
        const logoutPromise = supabase.auth.signOut();
        await Promise.race([
          logoutPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Logout timeout')), 3000))
        ]);
        console.log('✅ Supabase logout successful');
      } catch (timeoutError) {
        console.log('⏰ Supabase logout timed out, continuing...');
      }
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Ensure auth state is cleared even if there's an error
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
      await storeSession(null);
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

  // Function to manually send token to backend (for testing)
  const sendTokenToBackendManually = useCallback(async () => {
    if (user?.id && expoPushToken) {
      const accessToken = await getAccessToken();
      if (accessToken) {
        return await sendTokenToBackend(user.id, accessToken, expoPushToken);
      }
    }
    return false;
  }, [user?.id, expoPushToken, getAccessToken]);

  const value = {
    user,
    loading,
    isAuthenticated,
    userRole,
    expoPushToken,
    login,
    signup,
    logout,
    updateUser,
    refreshToken,
    requestPasswordReset,
    resetPassword,
    fetchUserRole,
    getAccessToken,
    sendTokenToBackendManually,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 