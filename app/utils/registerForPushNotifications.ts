// utils/registerForPushNotifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function registerPushToken(userId: string, accessToken: string) {
  const alreadySent = await AsyncStorage.getItem('pushTokenSent');
  if (alreadySent === 'true') return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const expoPushToken = tokenData.data;
  const deviceType = Platform.OS;

  try {
    const res = await fetch('https://water-supplier-2.onrender.com/api/k1/notifications/registerDevice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        user_id: userId,
        expo_push_token: expoPushToken,
        device_type: deviceType,
      }),
    });

    if (res.ok) {
      await AsyncStorage.setItem('pushTokenSent', 'true');
      console.log('✅ Push token sent to server');
    } else {
      console.error('❌ Failed to register push token');
    }
  } catch (err) {
    console.error('❌ Error registering push token:', err);
  }
}
