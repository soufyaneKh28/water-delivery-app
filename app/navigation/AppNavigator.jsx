// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { CardStyleInterpolators } from '@react-navigation/stack';
import React from 'react';

// Import navigators
import { useNavigation } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../screens/LoadingScreen';
import AdminNavigator from './AdminNavigator';
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const navigation = useNavigation();
  const { isAuthenticated, userRole, loading } = useAuth();

  if (isAuthenticated && !userRole) {
    return <LoadingScreen />;
  }

  return (

      <>
      <StatusBar style="dark" backgroundColor='transparent' translucent />
      <Stack.Navigator   screenOptions={{
        headerShown:false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // default (right-to-left)
        // 👇 Replace with left-to-right:
        gestureDirection: "horizontal-inverted"
      }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : userRole === 'admin' ? (
          <Stack.Screen name="Admin" component={AdminNavigator} />
        ) : (
          <Stack.Screen name="Client" component={ClientNavigator} />
        )}
      </Stack.Navigator>
    </>
  
  );
} 