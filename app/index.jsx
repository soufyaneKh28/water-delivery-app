import 'react-native-reanimated';
import '../gesture-handler';

import * as Font from 'expo-font';

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { FONTS } from './constants/fonts';
import { AddressProvider } from './context/AddressContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppNavigator from './navigation/AppNavigator';

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

  return (
    <AuthProvider>
      <CartProvider>
      <AddressProvider>
      <AppNavigator />
      </AddressProvider>
      </CartProvider>
    </AuthProvider>
  );
}