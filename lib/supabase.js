import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jbtsqrkociqzmbamqrfs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidHNxcmtvY2lxem1iYW1xcmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MTQ4NjMsImV4cCI6MjA2MjE5MDg2M30.4524I_MqvG4LcJUS3pxDpO4p7MxBZjpKNBoXhNrtLyI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 