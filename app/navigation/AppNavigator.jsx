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
  const PENDING_ROLE = '__PENDING__';

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size='large' color="#007AFF" />
      </View>
    );
  }

  // Do not block on userRole; default to client flow while role loads

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
      ) : userRole === PENDING_ROLE ? (
        // While role is pending, show a minimal loader instead of flashing client UI
        <Stack.Screen name="LoadingPendingRole" component={() => (
          <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
            <ActivityIndicator size='large' color="#007AFF" />
          </View>
        )} />
      ) : (
        <Stack.Screen name="Client" component={ClientNavigator} options={{ animationEnabled: true }} />
      )}
    </Stack.Navigator>
  );
} 