import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
const supabaseUrl = 'https://jbtsqrkociqzmbamqrfs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidHNxcmtvY2lxem1iYW1xcmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MTQ4NjMsImV4cCI6MjA2MjE5MDg2M30.4524I_MqvG4LcJUS3pxDpO4p7MxBZjpKNBoXhNrtLyI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 

// Handle app state changes manually to have more control over token refresh
let isRefreshing = false;
AppState.addEventListener('change', async (state) => {
  if (state === 'active' && !isRefreshing) {
    try {
      isRefreshing = true;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Only refresh if we have a valid session
        await supabase.auth.refreshSession();
      }
    } catch (error) {
      // Silently handle refresh errors
      console.log('Token refresh failed:', error);
    } finally {
      isRefreshing = false;
    }
  }
});

export const fetchWithAuth = async (url, options = {}) => {
  // Get the current access token from Supabase
  let { data: { session } } = await supabase.auth.getSession();
  let access_token = session?.access_token;

  let response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(access_token ? { Authorization: `Bearer ${access_token}` } : {}),
    },
  });

  if (response.status === 401) {
    // Try to refresh the session
    await supabase.auth.refreshSession();
    // Get the new access token
    ({ data: { session } } = await supabase.auth.getSession());
    access_token = session?.access_token;
    // Retry the request
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(access_token ? { Authorization: `Bearer ${access_token}` } : {}),
      },
    });
  }

  return response;
};

// Helper functions to store and retrieve the access token
export const storeAccessToken = async (token) => {
  try {
    await AsyncStorage.setItem('access_token', token);
  } catch (e) {
    console.log('Error storing access token:', e);
  }
};

export const getStoredAccessToken = async () => {
  try {
    return await AsyncStorage.getItem('access_token');
  } catch (e) {
    console.log('Error getting access token:', e);
    return null;
  }
};

// Listen for session changes and store the access token
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.access_token) {
    storeAccessToken(session.access_token);
  } else {
    // Remove token if session is null
    AsyncStorage.removeItem('access_token');
  }
});