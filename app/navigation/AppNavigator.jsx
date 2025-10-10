// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { CardStyleInterpolators } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
// Import navigators
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, Image, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AdminNavigator from './AdminNavigator';
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import GuestNavigator from './GuestNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, userRole, loading } = useAuth();
  const [roleTimeout, setRoleTimeout] = useState(false);

  // Reset timeout when authentication state changes
  useEffect(() => {
    if (!isAuthenticated || userRole) {
      setRoleTimeout(false);
    }
  }, [isAuthenticated, userRole]);

  // Set up timeout for role fetching
  useEffect(() => {
    let timeoutId;
    
    if (isAuthenticated && !userRole && !loading) {
      console.log('⏰ Starting role fetch timeout timer (15 seconds)');
      timeoutId = setTimeout(() => {
        console.log('⚠️ Role fetch timeout reached, defaulting to client navigator');
        setRoleTimeout(true);
      }, 15000); // 15 seconds timeout
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAuthenticated, userRole, loading]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={{flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' , gap:10}}>
        <Image source={require('../../assets/icon.png')} style={{width: 200, height: 200}} resizeMode="contain" />
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  // Show loading screen while fetching user role (with timeout)
  if (isAuthenticated && !userRole && !roleTimeout) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' , gap:10}}>
        <Image source={require('../../assets/icon.png')} style={{width: 200, height: 200}} />
        <ActivityIndicator size='small' color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      gestureDirection: "horizontal-inverted"
    }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="Guest" component={GuestNavigator} />
        </>
      ) : userRole === 'admin' ? (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      ) : (
        // Default to Client navigator if role is 'client' or if timeout occurred
        <Stack.Screen name="Client" component={ClientNavigator} />
      )}
    </Stack.Navigator>
  );
}