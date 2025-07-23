import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NotificationContext = createContext();

// Storage keys
const STORAGE_KEYS = {
  PUSH_TOKEN: 'expo_push_token',
  NOTIFICATION_PERMISSION: 'admin_notification_permission',
};

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
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

// Handle registration errors
function handleRegistrationError(errorMessage) {
  console.error('Registration error:', errorMessage);
  throw new Error(errorMessage);
}

// Register for push notifications
async function registerForPushNotificationsAsync() {
  console.log('🔧 Starting push token registration...');
  
  if (Platform.OS === 'android') {
    console.log('🤖 Setting up Android notification channel...');
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    console.log('📱 Device detected, checking permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('📋 Existing permission status:', existingStatus);
    
    if (existingStatus !== 'granted') {
      console.log('❌ Permission not granted, cannot get push token');
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return null;
    }
    
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      console.log('❌ Project ID not found');
      handleRegistrationError('Project ID not found');
      return null;
    }
    
    console.log('🔑 Project ID found, generating push token...');
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log('✅ Push token generated successfully:', pushTokenString);
      // Store the token for all users
      await AsyncStorage.setItem('expo_push_token', pushTokenString);
      console.log('Stored expo_push_token:', pushTokenString);
      return pushTokenString;
    } catch (e) {
      console.log('❌ Error generating push token:', e);
      handleRegistrationError(`${e}`);
      return null;
    }
  } else {
    console.log('❌ Not a physical device, cannot get push token');
    handleRegistrationError('Must use physical device for push notifications');
    return null;
  }
}

// Admin-specific notifications
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
  },

  // Test notification
  sendTestNotification: (expoPushToken) => {
    return sendPushNotification(
      expoPushToken,
      'اختبار الإشعارات',
      'هذا إشعار تجريبي من لوحة الإدارة'
    );
  }
};

export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(undefined);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const [isLoading, setIsLoading] = useState(true);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load stored push token and permission status
  const loadStoredNotificationData = async () => {
    try {
      console.log('📂 Loading stored notification data...');
      const [storedToken, storedPermission] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PERMISSION),
      ]);

      console.log('📋 Stored token:', storedToken ? 'Found' : 'Not found');
      console.log('📋 Stored permission:', storedPermission || 'Not found');

      if (storedToken) {
        console.log('🔑 Loading stored push token:', storedToken);
        setExpoPushToken(storedToken);
      }
      
      if (storedPermission) {
        console.log('📋 Loading stored permission status:', storedPermission);
        setPermissionStatus(storedPermission);
        setHasRequestedPermission(true);
      }
    } catch (error) {
      console.error('❌ Error loading stored notification data:', error);
    }
  };

  // Sync push token with auth context
  const syncPushTokenWithAuth = useCallback(async () => {
    try {
      if (expoPushToken) {
        // Store token in a location accessible by auth context
        await AsyncStorage.setItem('expo_push_token', expoPushToken);
        console.log('🔄 Push token synced with auth context:', expoPushToken.substring(0, 20) + '...');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error syncing push token:', error);
      return false;
    }
  }, [expoPushToken]);

  // Store push token
  const storePushToken = async (token) => {
    try {
      console.log('🔑 Storing push token:', token);
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
      setExpoPushToken(token);
      console.log('✅ Push token stored successfully');
    } catch (error) {
      console.error('❌ Error storing push token:', error);
    }
  };

  // Store permission status
  const storePermissionStatus = async (status) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PERMISSION, status);
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error storing permission status:', error);
    }
  };

  // Refresh current permission status from system
  const refreshPermissionStatus = useCallback(async () => {
    try {
      console.log('🔄 Refreshing permission status from system...');
      const { status } = await Notifications.getPermissionsAsync();
      console.log('📋 Current system permission status:', status);
      setPermissionStatus(status);
      await storePermissionStatus(status);
      return status;
    } catch (error) {
      console.error('❌ Error refreshing permission status:', error);
      return 'undetermined';
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    try {
      console.log('🔐 Starting permission request...');
      setIsLoading(true);
      
      // Check current permission status from system (not stored)
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('📋 Current system permission status:', existingStatus);
      setPermissionStatus(existingStatus);
      
      if (existingStatus === 'granted') {
        console.log('✅ Permission already granted, getting push token...');
        // Permission already granted, get push token
        const token = await registerForPushNotificationsAsync();
        if (token) {
          console.log('🔑 Got push token from existing permission:', token);
          await storePushToken(token);
        }
        setHasRequestedPermission(true);
        await storePermissionStatus(existingStatus);
        return true;
      }
      
      console.log('📱 Requesting permission from user...');
      // Request permission
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('📋 User permission response:', status);
      setPermissionStatus(status);
      setHasRequestedPermission(true);
      await storePermissionStatus(status);
      
      if (status === 'granted') {
        console.log('✅ Permission granted, getting push token...');
        // Permission granted, get push token
        const token = await registerForPushNotificationsAsync();
        if (token) {
          console.log('🔑 Got push token from new permission:', token);
          await storePushToken(token);
        }
        return true;
      } else {
        console.log('❌ Permission denied by user');
        // Permission denied
        Alert.alert(
          'إشعارات مطلوبة',
          'يجب السماح بالإشعارات لتلقي تنبيهات الطلبات الجديدة والتحديثات المهمة.',
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'الإعدادات', onPress: () => {
              // You can add logic to open app settings here
              console.log('Open app settings');
            }}
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Show notification permission screen
  const showNotificationPermissionScreen = useCallback((navigation, onPermissionGranted) => {
    navigation.navigate('NotificationPermission', {
      onPermissionGranted: () => {
        if (onPermissionGranted) {
          onPermissionGranted();
        }
        // Refresh permission status after returning
        refreshPermissionStatus();
      }
    });
  }, [refreshPermissionStatus]);

  // Enhanced permission request with screen
  const requestNotificationPermissionWithScreen = useCallback(async (navigation, onPermissionGranted) => {
    try {
      console.log('🔐 Starting enhanced permission request...');
      
      // Check current permission status from system
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('📋 Current system permission status:', existingStatus);
      
      if (existingStatus === 'granted') {
        console.log('✅ Permission already granted');
        if (onPermissionGranted) {
          onPermissionGranted();
        }
        return true;
      }
      
      if (existingStatus === 'denied') {
        console.log('❌ Permission denied, showing permission screen');
        showNotificationPermissionScreen(navigation, onPermissionGranted);
        return false;
      }
      
      // For undetermined status, show the permission screen
      console.log('📱 Showing notification permission screen');
      showNotificationPermissionScreen(navigation, onPermissionGranted);
      return false;
    } catch (error) {
      console.error('❌ Error in enhanced permission request:', error);
      return false;
    }
  }, [showNotificationPermissionScreen]);

  // Setup notification listeners
  const setupNotificationListeners = () => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification tap here
      // You can navigate to specific screens based on notification data
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  };

  // Initialize notification system
  useEffect(() => {
    let isMounted = true;
    
    const initializeNotifications = async () => {
      if (isInitialized) {
        console.log('🔄 Notification system already initialized, skipping...');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('🚀 Initializing notification system...');
        
        // Load stored data
        await loadStoredNotificationData();
        
        // Setup listeners only once
        console.log('👂 Setting up notification listeners...');
        const cleanup = setupNotificationListeners();
        
        // If we have a stored token, verify it's still valid
        if (expoPushToken && isMounted) {
          console.log('🔑 Using stored push token:', expoPushToken);
        } else {
          console.log('🔑 No stored push token found');
        }
        
        if (isMounted) {
          setIsInitialized(true);
          console.log('✅ Notification system initialized successfully');
        }
        
        return cleanup;
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const cleanup = initializeNotifications();
    
    return () => {
      console.log('🧹 Cleaning up notification system...');
      isMounted = false;
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [isInitialized]); // Only depend on isInitialized

  // Auto-request permission when dashboard loads (if not already requested)
  const initializePermissionRequest = useCallback(async () => {
    if (!isInitialized) {
      console.log('Notification system not yet initialized, skipping permission request...');
      return;
    }
    
    // Always refresh the current permission status from system first
    const currentStatus = await refreshPermissionStatus();
    console.log('📋 Refreshed permission status:', currentStatus);
    
    if (currentStatus === 'granted') {
      console.log('✅ Permission already granted, getting push token if needed...');
      if (!expoPushToken) {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await storePushToken(token);
        }
      }
      return true;
    }
    
    if (!hasRequestedPermission && !isLoading && currentStatus === 'undetermined') {
      console.log('Initializing permission request...');
      await requestNotificationPermission();
    } else {
      console.log('Permission request skipped - already requested or loading:', {
        hasRequestedPermission,
        isLoading,
        permissionStatus: currentStatus
      });
    }
  }, [isInitialized, hasRequestedPermission, isLoading, expoPushToken, refreshPermissionStatus, requestNotificationPermission]);


  const BACKEND_PUSH_REGISTRATION_KEY = 'pushTokenSentToBackend';

const sendTokenToBackendOnce = async (userId, accessToken, expoPushToken) => {
  try {
    const alreadySent = await AsyncStorage.getItem(BACKEND_PUSH_REGISTRATION_KEY);
    if (alreadySent === 'true') {
      console.log('📦 Token already sent to backend. Skipping...');
      return;
    }

    const deviceType = Platform.OS;
    const requestBody = {
      user_id: userId,
      player_id: expoPushToken,
      device_type: deviceType,
    };

    console.log('📤 Sending token to backend (notification context)...');
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://water-supplier-2.onrender.com/api/k1/notifications/registerDevice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const responseData = await response.json();
      console.log('✅ Token registered with backend');
      console.log('📦 Response data:', responseData);
      await AsyncStorage.setItem(BACKEND_PUSH_REGISTRATION_KEY, 'true');
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to register token with backend:', response.status, response.statusText);
      console.error('❌ Error response body:', errorText);
      
      // Try to parse error as JSON for more details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Parsed error:', errorJson);
      } catch (parseError) {
        console.error('❌ Could not parse error response as JSON');
      }
    }
  } catch (err) {
    console.error('❌ Error sending token to backend:', err);
  }
};
  // Remove device token from backend
  const removeDeviceToken = useCallback(async (userId, accessToken, expoPushToken) => {
    // if (!expoPushToken) {
    //   console.log('No push token available to remove');
    //   return false;
    // }

    try {
      const pushToken = await AsyncStorage.getItem('expo_push_token');
      console.log('🗑️ Removing deviiiiiiiiiice token from backend:', pushToken);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('https://water-supplier-2.onrender.com/api/k1/notifications/deleteDevice', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          player_id: pushToken
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log('✅ Device token removed from backend successfully');
        // Clear the backend registration flag
        await AsyncStorage.removeItem(BACKEND_PUSH_REGISTRATION_KEY);
        return true;
      } else {
        console.error('❌ Failed to remove device token from backend:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('⏰ Device removal timed out');
      } else {
        console.error('❌ Error removing device token from backend:', error);
      }
      return false;
    }
  }, []);
  // Clear stored notification data (for testing)
  const clearStoredNotificationData = useCallback(async () => {
    try {
      console.log('🧹 Clearing stored notification data...');
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.PUSH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATION_PERMISSION),
        AsyncStorage.removeItem(BACKEND_PUSH_REGISTRATION_KEY),
      ]);
      setExpoPushToken('');
      setPermissionStatus('undetermined');
      setHasRequestedPermission(false);
      console.log('✅ Stored notification data cleared');
    } catch (error) {
      console.error('❌ Error clearing stored notification data:', error);
    }
  }, []);

  const value = {
    expoPushToken,
    notification,
    setExpoPushToken,
    permissionStatus,
    isLoading,
    hasRequestedPermission,
    requestNotificationPermission,
    requestNotificationPermissionWithScreen,
    showNotificationPermissionScreen,
    initializePermissionRequest,
    refreshPermissionStatus,
    clearStoredNotificationData,
    removeDeviceToken,
    syncPushTokenWithAuth,
    sendPushNotification,
    adminNotifications,
    sendTokenToBackendOnce,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 