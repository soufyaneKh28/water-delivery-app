// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { CardStyleInterpolators } from '@react-navigation/stack';
import React from 'react';

// Import navigators
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AdminNavigator from './AdminNavigator';
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import GuestNavigator from './GuestNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, userRole, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size='large' color="#007AFF" />
      </View>
    );
  }

  // Show loading screen while fetching user role
  if (isAuthenticated && !userRole) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size='large' color="#007AFF" />
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
        <Stack.Screen name="Client" component={ClientNavigator} />
      )}
    </Stack.Navigator>
  );
} 