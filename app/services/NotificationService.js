import AsyncStorage from '@react-native-async-storage/async-storage';
import { OneSignal } from 'react-native-onesignal';
import { supabase } from '../../lib/supabase';

// OneSignal App ID - Replace with your actual OneSignal App ID
const ONESIGNAL_APP_ID = '0fc9b017-a7ee-4547-889a-9834e24613e3'; // Replace this with your actual OneSignal App ID

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.userId = null;
    this.userRole = null;
    this.playerId = null;
  }

  // Initialize OneSignal (without requesting permission)
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check if OneSignal is available
      if (!OneSignal) {
        throw new Error('OneSignal is not available');
      }

      if (typeof OneSignal.initialize !== 'function') {
        throw new Error('OneSignal.initialize is not a function');
      }

      console.log('OneSignal is available, initializing...');
      
      // Initialize OneSignal
      OneSignal.initialize(ONESIGNAL_APP_ID);

      // Set up notification handlers
      this.setupNotificationHandlers();

      // Get the player ID (this will be null until permission is granted)
      this.playerId = await OneSignal.User.pushSubscription.getPushSubscriptionId();

      this.isInitialized = true;
      console.log('OneSignal initialized successfully (without permission request)');
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
      console.error('OneSignal object:', OneSignal);
      console.error('OneSignal.initialize:', OneSignal?.initialize);
    }
  }

  // Request notification permission (call this after user logs in)
  async requestNotificationPermission() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Request notification permission
      const permission = await OneSignal.Notifications.requestPermission(true);
      
      if (permission) {
        // Get the player ID after permission is granted
        this.playerId = await OneSignal.User.pushSubscription.getPushSubscriptionId();
        console.log('Notification permission granted, player ID:', this.playerId);
      }
      
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Set up notification handlers
  setupNotificationHandlers() {
    // Handle notification received when app is in foreground
    OneSignal.Notifications.addEventListener('click', (event) => {
      console.log('Notification clicked:', event);
      this.handleNotificationClick(event);
    });

    // Handle notification received when app is in foreground
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
      console.log('Notification received in foreground:', event);
      // You can customize how notifications are displayed when app is in foreground
      event.preventDefault();
      // Show custom notification UI if needed
    });

    // Listen for push subscription changes
    OneSignal.User.pushSubscription.addEventListener('change', (event) => {
      console.log('Push subscription changed:', event);
      this.handlePushSubscriptionChange(event);
    });
  }

  // Handle push subscription changes
  async handlePushSubscriptionChange(event) {
    try {
      const newPlayerId = event.current.id;
      this.playerId = newPlayerId;
      
      // Update the player ID in Supabase if user is logged in
      if (this.userId) {
        await this.savePlayerIdToSupabase(newPlayerId);
      }
    } catch (error) {
      console.error('Error handling push subscription change:', error);
    }
  }

  // Save player ID to Supabase user_devices table
  async savePlayerIdToSupabase(playerId) {
    if (!this.userId || !playerId) return;

    try {
      // Check if device already exists
      const { data: existingDevice, error: checkError } = await supabase
        .from('user_devices')
        .select('id')
        .eq('user_id', this.userId)
        .eq('player_id', playerId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // If device doesn't exist, insert it
      if (!existingDevice) {
        const { error: insertError } = await supabase
          .from('user_devices')
          .insert({
            user_id: this.userId,
            player_id: playerId,
            device_type: 'mobile', // You can make this dynamic based on platform
            created_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
        console.log('Player ID saved to Supabase');
      }
    } catch (error) {
      console.error('Error saving player ID to Supabase:', error);
    }
  }

  // Remove player ID from Supabase user_devices table
  async removePlayerIdFromSupabase(playerId) {
    if (!this.userId || !playerId) return;

    try {
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('user_id', this.userId)
        .eq('player_id', playerId);

      if (error) throw error;
      console.log('Player ID removed from Supabase');
    } catch (error) {
      console.error('Error removing player ID from Supabase:', error);
    }
  }

  // Register user for notifications
  async registerUser(userId, userRole, userData = {}) {
    try {
      console.log(`Starting notification registration for user: ${userId} (${userRole})`);
      
      if (!this.isInitialized) {
        await this.initialize();
      }

      this.userId = userId;
      this.userRole = userRole;

      // Request notification permission when user logs in
      console.log('Requesting notification permission...');
      const permission = await this.requestNotificationPermission();
      
      if (permission) {
        console.log('Permission granted, setting up OneSignal user...');
        
        // Set external user ID for OneSignal
        await OneSignal.login(userId);

        // Set user tags for targeting
        await OneSignal.User.addTags({
          user_id: userId,
          user_role: userRole,
          ...userData
        });

        // Save player ID to Supabase (now we have both userId and playerId)
        if (this.playerId) {
          await this.savePlayerIdToSupabase(this.playerId);
        }

        // Store user notification preferences
        await AsyncStorage.setItem('notification_user_id', userId);
        await AsyncStorage.setItem('notification_user_role', userRole);

        console.log(`✅ User successfully registered for notifications: ${userId} (${userRole}) with player ID: ${this.playerId}`);
      } else {
        console.log('❌ Notification permission denied, user not registered for notifications');
        // Store user info but mark as not registered for notifications
        await AsyncStorage.setItem('notification_user_id', userId);
        await AsyncStorage.setItem('notification_user_role', userRole);
        await AsyncStorage.setItem('notification_permission_denied', 'true');
      }
    } catch (error) {
      console.error('Error registering user for notifications:', error);
    }
  }

  // Unregister user from notifications
  async unregisterUser() {
    try {
      // Remove player ID from Supabase
      if (this.playerId) {
        await this.removePlayerIdFromSupabase(this.playerId);
      }

      await OneSignal.logout();
      this.userId = null;
      this.userRole = null;

      // Clear stored preferences
      await AsyncStorage.removeItem('notification_user_id');
      await AsyncStorage.removeItem('notification_user_role');
      await AsyncStorage.removeItem('notification_permission_denied');

      console.log('User unregistered from notifications');
    } catch (error) {
      console.error('Error unregistering user from notifications:', error);
    }
  }

  // Handle notification click
  handleNotificationClick(event) {
    const notification = event.notification;
    const data = notification.additionalData;

    // Handle different notification types based on your backend data structure
    if (data?.screen === 'orderDetails' && data?.order_id) {
      this.navigateToOrderDetails(data.order_id);
    } else {
      console.log('Unknown notification data:', data);
    }
  }

  // Navigate to order details (this will be implemented in the navigation)
  navigateToOrderDetails(orderId) {
    // This will be handled by the navigation system
    // You can emit an event or use a callback to handle navigation
    console.log('Navigate to order details:', orderId);
  }

  // Get current user's notification settings
  async getNotificationSettings() {
    try {
      const userId = await AsyncStorage.getItem('notification_user_id');
      const userRole = await AsyncStorage.getItem('notification_user_role');
      const permissionDenied = await AsyncStorage.getItem('notification_permission_denied');
      const isEnabled = await this.areNotificationsEnabled();
      
      return {
        userId,
        userRole,
        isRegistered: !!userId && isEnabled,
        playerId: this.playerId,
        permissionDenied: permissionDenied === 'true',
        isEnabled
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return { 
        userId: null, 
        userRole: null, 
        isRegistered: false, 
        playerId: null,
        permissionDenied: false,
        isEnabled: false
      };
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      // Update OneSignal tags
      if (settings.tags) {
        await OneSignal.User.addTags(settings.tags);
      }

      // Store additional settings
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
      
      console.log('Notification settings updated');
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  // Get current player ID
  getPlayerId() {
    return this.playerId;
  }

  // Check if notifications are enabled
  async areNotificationsEnabled() {
    try {
      const permission = await OneSignal.Notifications.permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  }

  // Check if user is logged in and should be prompted for notifications
  async shouldRequestPermission() {
    try {
      const permission = await OneSignal.Notifications.permission;
      const isLoggedIn = this.userId !== null;
      
      // Request permission if user is logged in and permission hasn't been granted
      return isLoggedIn && permission !== 'granted';
    } catch (error) {
      console.error('Error checking if should request permission:', error);
      return false;
    }
  }

  // Check if user has denied notification permission and should be prompted to enable in settings
  async shouldPromptForSettings() {
    try {
      const permission = await OneSignal.Notifications.permission;
      const isLoggedIn = this.userId !== null;
      
      // Prompt for settings if user is logged in and permission is denied
      return isLoggedIn && permission === 'denied';
    } catch (error) {
      console.error('Error checking if should prompt for settings:', error);
      return false;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService; 