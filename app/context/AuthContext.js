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
  const [authInitialized, setAuthInitialized] = useState(false);

  // Function to clear all auth data
  const clearAuthData = useCallback(async () => {
    console.log('🧹 Clearing all auth data...');
    setUser(null);
    setIsAuthenticated(false);
    setUserRole(null);
    setExpoPushToken('');
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SESSION,
        STORAGE_KEYS.USER_ROLE,
        STORAGE_KEYS.BACKEND_PUSH_REGISTRATION
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }, []);

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
  const fetchUserRole = useCallback(async (userId, accessToken = null) => {
    if (!userId) {
      console.log('❌ No userId provided for role fetch');
      return null;
    }
    
    console.log('🔍 Fetching user role for:', userId);
    
    try {
      // Check if we have a valid session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('❌ No valid session found, clearing auth data');
        await clearAuthData();
        return null;
      }

      // Check if token is expired
      const now = Date.now() / 1000;
      if (session.expires_at && now > session.expires_at) {
        console.log('🕐 Session expired, attempting refresh...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.log('❌ Token refresh failed, clearing auth data');
          await clearAuthData();
          return null;
        }
        
        // Update session after refresh
        console.log('✅ Token refreshed successfully');
        await storeSession(refreshData.session);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role_name')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching user role:', error);
        
        // If it's an auth error, clear everything
        if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
          console.log('🚨 Authentication error detected, clearing auth data');
          await clearAuthData();
          return null;
        }
        
        throw error;
      }

      const role = data?.role_name;
      console.log('✅ User role fetched:', role);
      setUserRole(role);
      
      // Store user role
      if (role) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
      }
      
      return role;
    } catch (error) {
      console.error('❌ Error in fetchUserRole:', error);
      
      // On any error, clear the role and stored data
      setUserRole(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);
      
      // If it seems like an auth issue, clear everything
      if (error.message?.includes('JWT') || error.message?.includes('expired') || error.code === 'PGRST301') {
        console.log('🚨 Auth-related error, clearing all auth data');
        await clearAuthData();
      }
      
      return null;
    }
  }, [clearAuthData, storeSession]);

  // Function to handle token registration after login
  const handleTokenRegistration = useCallback(async (userId, accessToken) => {
    try {
      console.log('🔄 ========== AUTH: HANDLING TOKEN REGISTRATION ==========');
      let storedToken = await AsyncStorage.getItem('expo_push_token');
      if (!storedToken) {
        // Wait a bit and try again (token may be generated soon)
        console.log('⏳ No push token found, retrying in 2 seconds...');
        await new Promise(res => setTimeout(res, 2000));
        storedToken = await AsyncStorage.getItem('expo_push_token');
      }
      if (storedToken) {
        console.log('✅ ========== AUTH: TOKEN FOUND FOR REGISTRATION ==========');
        console.log('🔑 FULL EXPO PUSH TOKEN:', storedToken);
        console.log('📏 Token length:', storedToken.length);
        console.log('👤 User ID:', userId);
        console.log('✅ =====================================================');
        setExpoPushToken(storedToken);
        await sendTokenToBackend(userId, accessToken, storedToken);
      } else {
        console.log('⚠️ No push token available for registration (after retry)');
      }
      console.log('🔄 ======================================================');
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
        console.log('❌ No valid session during refresh, clearing auth data');
        await clearAuthData();
        return;
      }

      // Check if token is about to expire (within 5 minutes)
      const expiresAt = session.expires_at * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < 5 * 60 * 1000) {
        console.log('🔄 Refreshing token...');
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !data.session) {
          // Clear auth state if refresh fails
          console.log('❌ Token refresh failed, clearing auth data');
          await clearAuthData();
          return;
        }
        
        // Update with new session
        setUser(data.session.user);
        setIsAuthenticated(true);
        await storeSession(data.session);
        await fetchUserRole(data.session.user.id);
      }
    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      // Clear auth state on error
      await clearAuthData();
    }
  }, [clearAuthData, storeSession, fetchUserRole]);

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Initializing auth...');
      setLoading(true);
      
      try {
        // First, try to get session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          await clearAuthData();
          return;
        }

        if (session?.user) {
          console.log('✅ Valid session found for user:', session.user.id);
          
          // Check if token is expired
          const now = Date.now() / 1000;
          if (session.expires_at && now > session.expires_at) {
            console.log('🕐 Session expired on init, attempting refresh...');
            
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError || !refreshData.session) {
              console.log('❌ Token refresh failed on init, clearing auth data');
              await clearAuthData();
              return;
            }
            
            console.log('✅ Token refreshed successfully on init');
            // Use the refreshed session
            const refreshedSession = refreshData.session;
            setUser(refreshedSession.user);
            setIsAuthenticated(true);
            await storeSession(refreshedSession);
            
            // Fetch user role with timeout
            const rolePromise = fetchUserRole(refreshedSession.user.id, refreshedSession.access_token);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Role fetch timeout')), 10000)
            );
            
            try {
              await Promise.race([rolePromise, timeoutPromise]);
            } catch (timeoutError) {
              console.log('⏰ Role fetch timed out, but user is authenticated');
              // Don't clear auth data, just set a default or handle gracefully
              setUserRole('client'); // or however you want to handle this
            }
            
            // Handle token registration
            await handleTokenRegistration(refreshedSession.user.id, refreshedSession.access_token);
          } else {
            // Session is still valid
            setUser(session.user);
            setIsAuthenticated(true);
            await storeSession(session);
            
            // Load user role from storage first for faster UI
            const storedUserRole = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
            if (storedUserRole) {
              console.log('📱 Loaded role from storage:', storedUserRole);
              setUserRole(storedUserRole);
            }
            
            // Fetch fresh user role with timeout
            const rolePromise = fetchUserRole(session.user.id, session.access_token);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Role fetch timeout')), 10000)
            );
            
            try {
              await Promise.race([rolePromise, timeoutPromise]);
            } catch (timeoutError) {
              console.log('⏰ Role fetch timed out');
              // If we have a stored role, keep it; otherwise set default
              if (!storedUserRole) {
                console.log('📝 Setting default role due to timeout');
                setUserRole('client');
              }
            }
            
            // Handle token registration
            await handleTokenRegistration(session.user.id, session.access_token);
          }
        } else {
          // No valid session, clear state
          console.log('❌ No valid session found, clearing auth data');
          await clearAuthData();
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        await clearAuthData();
      } finally {
        setAuthInitialized(true);
        setLoading(false);
        console.log('✅ Auth initialization complete');
      }
    };

    initializeAuth();
  }, []); // Remove dependencies to avoid re-running

  // Listen for auth state changes
  useEffect(() => {
    // Only set up listener after initial auth is complete
    if (!authInitialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await storeSession(session);
        
        // Only fetch role if we don't have one or if it's a new login
        if (!userRole || event === 'SIGNED_IN') {
          await fetchUserRole(session.user.id);
        }
        
        // Handle token registration for new login
        if (event === 'SIGNED_IN') {
          await handleTokenRegistration(session.user.id, session.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        await clearAuthData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [authInitialized, userRole, storeSession, fetchUserRole, handleTokenRegistration, clearAuthData]);

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
      await clearAuthData();
      
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
      await clearAuthData();
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
      await clearAuthData();
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};