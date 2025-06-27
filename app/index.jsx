import 'react-native-reanimated';
import '../gesture-handler';

import { NavigationIndependentTree } from '@react-navigation/native';
import * as Font from 'expo-font';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Toast, { BaseToast } from 'react-native-toast-message';
import { FONTS } from './constants/fonts';
import { AddressProvider } from './context/AddressContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppNavigator from './navigation/AppNavigator';
// Include the OneSignal package
import { LogLevel, OneSignal } from 'react-native-onesignal';
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
  // Initialize OneSignal in useEffect to ensure it runs only once
  useEffect(() => {
    // Enable verbose logging for debugging (remove in production)
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    // Initialize with your OneSignal App ID
    OneSignal.initialize('385eb07-724a-4a80-a88f-3b426b6a1210');
    // Use this method to prompt for push notifications.
    // We recommend removing this method after testing and instead use In-App Messages to prompt for notification permission.
    OneSignal.Notifications.requestPermission(false);
    }, []); // Ensure this only runs once on app mount
  
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  // const resetPasswordURL = Linking.createURL("resetPassword"); 
  const linking = {
    prefixes: [Linking.createURL('/'),'water-delivery-app:/'],
    config: {
      screens: {
        Auth: {
          screens: {
            ResetPassword: 'reset-password',
            ForgotPassword: 'forgot-password',
            Splash: 'splash',
            Onboarding: 'onboarding',
            Login: 'login',
            SignUp: 'signup',
            Verification: 'verification',
          },
        },
        Admin: '*',
        Client: '*',
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