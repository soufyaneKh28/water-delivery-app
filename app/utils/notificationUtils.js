import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Send push notification
export async function sendPushNotification(expoPushToken, title = 'Notification', body = 'You have a new notification!') {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: { someData: 'goes here' },
  };

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    console.log('Notification sent successfully');
    console.log("message", message);
    console.log("expoPushToken", expoPushToken);
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

// Handle registration errors
export function handleRegistrationError(errorMessage) {
  console.error('Registration error:', errorMessage);
  throw new Error(errorMessage);
}

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log("pushTokenStringggggg", pushTokenString);
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

// Setup notification listeners
export function setupNotificationListeners(setNotification) {
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    setNotification(notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification response:', response);
  });

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}

// Send admin-specific notifications
export const adminNotifications = {
  // New order notification
  sendNewOrderNotification: (expoPushToken, orderNumber) => {
    return sendPushNotification(
      expoPushToken,
      'طلب جديد',
      `لديك طلب جديد برقم #${orderNumber}`
    );
  },

  // Order status update notification
  sendOrderStatusUpdateNotification: (expoPushToken, orderNumber, status) => {
    return sendPushNotification(
      expoPushToken,
      'تحديث حالة الطلب',
      `تم تحديث حالة الطلب #${orderNumber} إلى ${status}`
    );
  },

  // Low stock notification
  sendLowStockNotification: (expoPushToken, productName) => {
    return sendPushNotification(
      expoPushToken,
      'تنبيه المخزون',
      `المنتج ${productName} منخفض في المخزون`
    );
  },

  // Daily summary notification
  sendDailySummaryNotification: (expoPushToken, ordersCount, totalProfit) => {
    return sendPushNotification(
      expoPushToken,
      'ملخص اليوم',
      `تم إنجاز ${ordersCount} طلب بإجمالي ربح ${totalProfit} دينار`
    );
  }
}; 