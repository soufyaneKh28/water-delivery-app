import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // Check active sessions and listen for auth changes
  useEffect(() => {
    // Check for existing session
    // logout();
    console.log("check for existing user",user);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log("session user",session.user);
        
        setUser(session.user);
        setIsAuthenticated(true);
        console.log("user after set",user);
        
        // Fetch user role from profiles table
        fetchUserRole(session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        // Fetch user role from profiles table
        await fetchUserRole(session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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

      // Fetch user role after successful login
      console.log("data after login",data);
      
      if (data.user) {
        console.log("data.user.id",data.user.id);
        
        await fetchUserRole(data.user.id);
      }

      return data;
    } catch (error) {
      console.error('Error during login:', error);
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserRole(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
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

  const value = {
    user,
    loading,
    isAuthenticated,
    userRole,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 