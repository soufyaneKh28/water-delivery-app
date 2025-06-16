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