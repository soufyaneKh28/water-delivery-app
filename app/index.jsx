import 'react-native-reanimated';
import '../gesture-handler';

import * as Font from 'expo-font';

import { NavigationIndependentTree } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Toast, { BaseToast } from 'react-native-toast-message';
import { FONTS } from './constants/fonts';
import { AddressProvider } from './context/AddressContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppNavigator from './navigation/AppNavigator';

// Custom toast config with marginTop for top toasts
const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ 
        marginTop: 40, 
        borderLeftColor: '#4CAF50',
        zIndex: 9999,
        elevation: 9999, // for Android
      }}
      contentContainerStyle={{ 
        paddingHorizontal: 15,
        zIndex: 9999,
        elevation: 9999, // for Android
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
      }}
      text2Style={{
        fontSize: 14,
      }}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={{ 
        marginTop: 40, 
        borderLeftColor: '#FF3B30',
        zIndex: 9999,
        elevation: 9999, // for Android
      }}
      contentContainerStyle={{ 
        paddingHorizontal: 15,
        zIndex: 9999,
        elevation: 9999, // for Android
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
      }}
      text2Style={{
        fontSize: 14,
      }}
    />
  ),
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          [FONTS.regular]: require('../assets/fonts/IBMPlexSansArabic-Regular.ttf'),
          [FONTS.medium]: require('../assets/fonts/IBMPlexSansArabic-Medium.ttf'),
          [FONTS.semiBold]: require('../assets/fonts/IBMPlexSansArabic-SemiBold.ttf'),
          [FONTS.bold]: require('../assets/fonts/IBMPlexSansArabic-Bold.ttf'),
          [FONTS.light]: require('../assets/fonts/IBMPlexSansArabic-Light.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const linking = {
    prefixes: ['water-delivery-app://'],
    config: {
      screens: {
        Auth: {
          screens: {
            ResetPassword: 'reset-password',
            ForgotPassword: 'forgot-password',
            // Add other auth screens if needed
          },
        },
        // Add other navigators/screens if needed
      },
    },
  };

  return (
      <NavigationIndependentTree  linking={linking} fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#007AFF" /></View>}>
    <AuthProvider>
      <CartProvider>
      <AddressProvider>
        <AppNavigator />
      <Toast config={toastConfig} />
      </AddressProvider>
      </CartProvider>
    </AuthProvider>
      </NavigationIndependentTree>
  );
}