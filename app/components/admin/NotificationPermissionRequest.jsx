import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNotification } from '../../context/NotificationContext';
import { colors } from '../../styling/colors';
import CustomText from '../common/CustomText';

export default function NotificationPermissionRequest() {
  const { 
    permissionStatus, 
    hasRequestedPermission, 
    isLoading, 
    requestNotificationPermission 
  } = useNotification();

  const handleRequestPermission = async () => {
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        Alert.alert('تم السماح', 'تم تفعيل الإشعارات بنجاح!');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  // Don't show if permission is already granted
  if (permissionStatus === 'granted') {
    return null;
  }

  // Don't show if we haven't requested yet (let the dashboard handle it)
  if (!hasRequestedPermission) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="notifications-outline" size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <CustomText type="bold" style={styles.title}>
          تفعيل الإشعارات
        </CustomText>
        <CustomText type="regular" style={styles.description}>
          احصل على تنبيهات فورية للطلبات الجديدة والتحديثات المهمة
        </CustomText>
      </View>
      <TouchableOpacity 
        style={styles.button}
        onPress={handleRequestPermission}
        disabled={isLoading}
      >
        <CustomText type="bold" style={styles.buttonText}>
          {isLoading ? 'جاري...' : 'تفعيل'}
        </CustomText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
}); 