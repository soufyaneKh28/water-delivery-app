import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import BackButton from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { FONTS } from '../../constants/fonts';
// import { COLORS } from '../../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/NotificationService';

const NotificationSettingsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    newOrders: true,
    orderUpdates: true,
    systemAlerts: true,
    general: true,
  });
  const [loading, setLoading] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState({
    isEnabled: false,
    playerId: null,
    isRegistered: false,
    permissionDenied: false,
  });

  useEffect(() => {
    loadNotificationStatus();
  }, []);

  const loadNotificationStatus = async () => {
    try {
      const settings = await notificationService.getNotificationSettings();
      const playerId = notificationService.getPlayerId();
      
      setNotificationStatus({
        isEnabled: settings.isEnabled,
        playerId,
        isRegistered: settings.isRegistered,
        permissionDenied: settings.permissionDenied,
      });
    } catch (error) {
      console.error('Error loading notification status:', error);
    }
  };

  const handleSettingChange = async (key, value) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      
      // Update notification settings
      await notificationService.updateNotificationSettings({
        ...settings,
        [key]: value,
      });

      // Update OneSignal tags
      const tags = {
        notifications_new_orders: value ? 'enabled' : 'disabled',
        notifications_order_updates: value ? 'enabled' : 'disabled',
        notifications_system_alerts: value ? 'enabled' : 'disabled',
        notifications_general: value ? 'enabled' : 'disabled',
      };

      await notificationService.updateNotificationSettings({ tags });
    } catch (error) {
      console.error('Error updating notification setting:', error);
      Alert.alert('Error', 'Failed to update notification setting');
    }
  };

  const requestNotificationPermission = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      if (!user) {
        Alert.alert('Login Required', 'Please log in to enable notifications.');
        return;
      }
      
      const permission = await notificationService.requestNotificationPermission();
      
      if (permission) {
        // Re-register user with the new permission
        await notificationService.registerUser(user.id, user.user_metadata?.role || 'admin');
        Alert.alert('Success', 'Notification permission granted! You will now receive order notifications.');
        await loadNotificationStatus();
      } else {
        Alert.alert(
          'Permission Denied', 
          'To receive order notifications, please enable notifications in your device settings and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: requestNotificationPermission }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      Alert.alert('Error', 'Failed to request notification permission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderNotificationItem = (title, description, key, value) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <CustomText style={styles.settingTitle}>{title}</CustomText>
        <CustomText style={styles.settingDescription}>
          {description}
        </CustomText>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => handleSettingChange(key, newValue)}
        trackColor={{ false: COLORS.gray, true: COLORS.primary }}
        thumbColor={COLORS.white}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <CustomText style={styles.headerTitle}>Notification Settings</CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Status */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Notification Status</CustomText>
          
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <CustomText style={styles.statusLabel}>Permission Status:</CustomText>
              <CustomText style={[
                styles.statusValue,
                { color: notificationStatus.isEnabled ? COLORS.success : COLORS.error }
              ]}>
                {notificationStatus.isEnabled ? 'Enabled' : 'Disabled'}
              </CustomText>
            </View>
            
            <View style={styles.statusRow}>
              <CustomText style={styles.statusLabel}>Registration Status:</CustomText>
              <CustomText style={[
                styles.statusValue,
                { color: notificationStatus.isRegistered ? COLORS.success : COLORS.error }
              ]}>
                {notificationStatus.isRegistered ? 'Registered' : 'Not Registered'}
              </CustomText>
            </View>

            {notificationStatus.playerId && (
              <View style={styles.statusRow}>
                <CustomText style={styles.statusLabel}>Device ID:</CustomText>
                <CustomText style={styles.statusValue}>
                  {notificationStatus.playerId.substring(0, 8)}...
                </CustomText>
              </View>
            )}

            {!notificationStatus.isEnabled && (
              <View>
                {notificationStatus.permissionDenied ? (
                  <View style={styles.permissionDeniedContainer}>
                    <CustomText style={styles.permissionDeniedText}>
                      Notifications are disabled in your device settings. Please enable them to receive order notifications.
                    </CustomText>
                    <PrimaryButton
                      title="Open Settings"
                      onPress={() => {
                        // This would typically open device settings
                        Alert.alert(
                          'Enable Notifications',
                          'Please go to your device settings > Notifications > Water Delivery App and enable notifications.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Try Again', onPress: requestNotificationPermission }
                          ]
                        );
                      }}
                      style={styles.enableButton}
                    />
                  </View>
                ) : (
                  <PrimaryButton
                    title="Enable Notifications"
                    onPress={requestNotificationPermission}
                    loading={loading}
                    style={styles.enableButton}
                  />
                )}
              </View>
            )}
          </View>
        </View>

        {/* Notification Preferences */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Notification Preferences</CustomText>
          
          {renderNotificationItem(
            'New Orders',
            'Get notified when customers place new orders',
            'newOrders',
            settings.newOrders
          )}

          {renderNotificationItem(
            'Order Updates',
            'Get notified when order statuses are updated',
            'orderUpdates',
            settings.orderUpdates
          )}

          {renderNotificationItem(
            'System Alerts',
            'Get notified about system maintenance and alerts',
            'systemAlerts',
            settings.systemAlerts
          )}

          {renderNotificationItem(
            'General Notifications',
            'Receive general app notifications',
            'general',
            settings.general
          )}
        </View>

        {/* Information */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>About Admin Notifications</CustomText>
          <View style={styles.infoCard}>
            <CustomText style={styles.infoText}>
              • You'll receive notifications for all new customer orders
            </CustomText>
            <CustomText style={styles.infoText}>
              • Notifications help you manage orders efficiently
            </CustomText>
            <CustomText style={styles.infoText}>
              • You can change these settings at any time
            </CustomText>
            <CustomText style={styles.infoText}>
              • System alerts keep you informed about app maintenance
            </CustomText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export const COLORS = {
  background: '#F8F9FA',
  white: '#FFF',
  text: '#222',
  primary: '#007AFF',
  gray: '#B0B0B0',
  lightGray: '#E5E5E5',
  success: '#4CAF50',
  error: '#FF3B30',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 15,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  statusValue: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  enableButton: {
    marginTop: 15,
  },
  permissionDeniedContainer: {
    marginTop: 10,
  },
  permissionDeniedText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  infoText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default NotificationSettingsScreen; 