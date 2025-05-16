import 'react-native-reanimated';
import '../gesture-handler';

import * as Font from 'expo-font';

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { FONTS } from './constants/fonts';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

// Enable RTL layout direction
// I18nManager.forceRTL(true);
// // Allow RTL on Android (optional)
// I18nManager.allowRTL(true);
// if (I18nManager.isRTL !== true) {
//   I18nManager.forceRTL(true);
//   RNRestart.Restart(); // Use the react-native-restart library for app restarts
// }

// console.log('RTL enabled:', I18nManager.isRTL);

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
      <AppNavigator />
      {/* <Text>RTL enabled: {I18nManager.isRTL ? 'Yes' : 'No'}</Text> */}
    </AuthProvider>
  );
}