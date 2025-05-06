// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { CardStyleInterpolators } from '@react-navigation/stack';
import React, { useState } from 'react';

// Import navigators
import { useNavigation } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import AdminNavigator from './AdminNavigator';
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  // TODO: Replace with actual auth state management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(
    "client"
  );
  const navigation = useNavigation();
  return (
    // <NavigationContainer>
      <>
      {/* <StatusBar style="dark" /> */}
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
    // </NavigationContainer>
  );
} 