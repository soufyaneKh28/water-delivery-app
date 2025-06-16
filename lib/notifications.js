import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;

  try {
    // Check if running on a physical device
    if (!Constants.isDevice) {
      console.log('Push notifications are not supported in the simulator');
      return null;
    }

    // Configure Android channel
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      } catch (error) {
        console.error('Error setting up Android notification channel:', error);
      }
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('Existing notification permission status:', existingStatus);
    
    let finalStatus = existingStatus;
    
    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('New notification permission status:', status);
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permission not granted for push notifications');
      return null;
    }

    // Get the project ID
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.error('Project ID not found in app configuration');
      return null;
    }
    console.log('Using project ID:', projectId);

    // Get the push token
    console.log('Getting Expo push token...');
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    
    if (!tokenData?.data) {
      console.error('Failed to get push token: No token data received');
      return null;
    }

    token = tokenData.data;
    console.log('Successfully got push token:', token);
    return token;

  } catch (error) {
    console.error('Error in registerForPushNotificationsAsync:', error);
    return null;
  }
}

// Save push token to device_tokens table
export async function savePushToken(userId, token) {
  try {
    // Get user's role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role_name')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // First, check if a token already exists for this user
    const { data: existingToken, error: fetchError } = await supabase
      .from('device_tokens')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw fetchError;
    }

    if (existingToken) {
      // Update existing token
      const { error: updateError } = await supabase
        .from('device_tokens')
        .update({ 
          expo_token: token,
          role: profile.role_name
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } else {
      // Insert new token
      const { error: insertError } = await supabase
        .from('device_tokens')
        .insert({
          user_id: userId,
          expo_token: token,
          role: profile.role_name
        });

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error saving push token:', error);
    return false;
  }
}

// Send push notification to admin
export async function sendOrderNotification(orderDetails) {
  try {
    // Get all admin users' device tokens
    const { data: adminTokens, error } = await supabase
      .from('device_tokens')
      .select('expo_token')
      .eq('role', 'admin');

    if (error) throw error;

    // Send notification to each admin
    const notifications = adminTokens.map(admin => {
      if (!admin.expo_token) return null;

      return fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: admin.expo_token,
          title: 'طلب جديد',
          body: `تم استلام طلب جديد من ${orderDetails.user_id?.full_name || 'عميل'}`,
          data: { orderId: orderDetails.id },
          sound: 'default',
          priority: 'high',
        }),
      });
    });

    await Promise.all(notifications.filter(Boolean));
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

// Send order status update notification to user
export async function sendOrderStatusNotification(orderId, status, userId) {
  try {
    // Get user's device token
    const { data: deviceToken, error } = await supabase
      .from('device_tokens')
      .select('expo_token')
      .eq('user_id', userId)
      .single();

    if (error || !deviceToken?.expo_token) return false;

    const statusLabels = {
      processing: 'قيد المعالجة',
      'on-the-way': 'في الطريق',
      delivered: 'تم التوصيل',
      cancelled: 'تم الالغاء',
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: deviceToken.expo_token,
        title: 'تحديث حالة الطلب',
        body: `تم تحديث حالة طلبك إلى: ${statusLabels[status] || status}`,
        data: { orderId },
        sound: 'default',
        priority: 'high',
      }),
    });

    return true;
  } catch (error) {
    console.error('Error sending status update notification:', error);
    return false;
  }
}

// Test function to verify push notification setup
export async function testPushNotification(userId, isAdmin = false) {
  try {
    // Get the device token
    const token = await registerForPushNotificationsAsync();
    if (!token) {
      console.log('Failed to get push token');
      return false;
    }

    // Save the token
    const saved = await savePushToken(userId, token);
    if (!saved) {
      console.log('Failed to save push token');
      return false;
    }

    // Send a test notification
    const notification = {
      to: token,
      title: 'اختبار الإشعارات',
      body: isAdmin ? 'تم تفعيل الإشعارات للمدير بنجاح!' : 'تم تفعيل الإشعارات للعميل بنجاح!',
      data: { test: true },
      sound: 'default',
      priority: 'high',
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    const result = await response.json();
    console.log('Test notification result:', result);
    return true;
  } catch (error) {
    console.error('Error testing push notification:', error);
    return false;
  }
} 