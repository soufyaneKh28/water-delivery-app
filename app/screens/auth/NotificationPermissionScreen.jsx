import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import CustomText from '../../components/common/CustomText';
import { useNotification } from '../../context/NotificationContext';
import { colors } from '../../styling/colors';
import { globalStyles } from '../../styling/globalStyles';

export default function NotificationPermissionScreen({ navigation, route }) {
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const [isLoading, setIsLoading] = useState(false);
  const { 
    expoPushToken, 
    permissionStatus: contextPermissionStatus,
    requestNotificationPermission,
    refreshPermissionStatus,
    clearStoredNotificationData,
    syncPushTokenWithAuth
  } = useNotification();
  const { onPermissionGranted } = route.params || {};

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking permission status:', error);
    }
  };

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const success = await requestNotificationPermission();
      
      if (success) {
        console.log('✅ Notification permission granted');
        await syncPushTokenWithAuth();
        if (onPermissionGranted) {
          onPermissionGranted();
        }
        // Navigate back
        navigation.goBack();
      } else {
        console.log('❌ Notification permission denied');
        // Refresh status to show denied state
        await refreshPermissionStatus();
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء طلب الإذن');
    } finally {
      setIsLoading(false);
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const skipPermission = () => {
    Alert.alert(
      'تخطي الإشعارات',
      'يمكنك تفعيل الإشعارات لاحقاً من إعدادات التطبيق. هل تريد المتابعة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'متابعة', 
          onPress: () => {
            if (onPermissionGranted) {
              onPermissionGranted();
            }
            navigation.goBack();
          }
        }
      ]
    );
  };

  const clearNotificationData = async () => {
    Alert.alert(
      'مسح بيانات الإشعارات',
      'هل تريد مسح جميع بيانات الإشعارات المخزنة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'مسح', 
          onPress: async () => {
            await clearStoredNotificationData();
            await checkPermissionStatus();
            Alert.alert('تم المسح', 'تم مسح بيانات الإشعارات بنجاح');
          }
        }
      ]
    );
  };

  const renderPermissionContent = () => {
    switch (permissionStatus) {
      case 'granted':
        return (
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={80} color={colors.success} />
            </View>
            <CustomText type="bold" style={styles.title}>
              تم تفعيل الإشعارات بنجاح!
            </CustomText>
            <CustomText style={styles.description}>
              ستتلقى الآن إشعارات فورية عن:
            </CustomText>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark" size={20} color={colors.success} />
                <CustomText style={styles.benefitText}>الطلبات الجديدة</CustomText>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark" size={20} color={colors.success} />
                <CustomText style={styles.benefitText}>تحديثات حالة الطلبات</CustomText>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark" size={20} color={colors.success} />
                <CustomText style={styles.benefitText}>العروض والخصومات</CustomText>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark" size={20} color={colors.success} />
                <CustomText style={styles.benefitText}>التنبيهات المهمة</CustomText>
              </View>
            </View>
            
            {expoPushToken && (
              <View style={styles.tokenInfo}>
                <CustomText type="bold" style={styles.tokenTitle}>
                  رمز الجهاز:
                </CustomText>
                <CustomText style={styles.tokenText}>
                  {expoPushToken.substring(0, 30)}...
                </CustomText>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[globalStyles.button, styles.continueButton]}
                onPress={() => {
                  if (onPermissionGranted) {
                    onPermissionGranted();
                  }
                  navigation.goBack();
                }}
              >
                <CustomText type="bold" style={globalStyles.buttonText}>
                  متابعة
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.clearButton]}
                onPress={clearNotificationData}
              >
                <CustomText style={styles.clearButtonText}>
                  مسح بيانات الإشعارات
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'denied':
        return (
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications-off" size={80} color={colors.error} />
            </View>
            <CustomText type="bold" style={styles.title}>
              تم رفض الإشعارات
            </CustomText>
            <CustomText style={styles.description}>
              لتفعيل الإشعارات، يرجى الذهاب إلى إعدادات التطبيق والسماح بالإشعارات
            </CustomText>
            <View style={styles.instructions}>
              <CustomText type="bold" style={styles.instructionTitle}>
                كيفية التفعيل:
              </CustomText>
              <View style={styles.instructionStep}>
                <CustomText style={styles.stepNumber}>1</CustomText>
                <CustomText style={styles.stepText}>اذهب إلى إعدادات التطبيق</CustomText>
              </View>
              <View style={styles.instructionStep}>
                <CustomText style={styles.stepNumber}>2</CustomText>
                <CustomText style={styles.stepText}>ابحث عن "الإشعارات"</CustomText>
              </View>
              <View style={styles.instructionStep}>
                <CustomText style={styles.stepNumber}>3</CustomText>
                <CustomText style={styles.stepText}>قم بتفعيل الإشعارات</CustomText>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[globalStyles.button, styles.settingsButton]}
                onPress={openSettings}
              >
                <CustomText type="bold" style={globalStyles.buttonText}>
                  فتح الإعدادات
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.skipButton]}
                onPress={skipPermission}
              >
                <CustomText style={styles.skipButtonText}>
                  تخطي
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications" size={80} color={colors.primary} />
            </View>
            <CustomText type="bold" style={styles.title}>
              تفعيل الإشعارات
            </CustomText>
            <CustomText style={styles.description}>
              نحتاج إلى إذنك لإرسال إشعارات مهمة عن طلباتك وتحديثات التطبيق
            </CustomText>
            
            <View style={styles.benefitsContainer}>
              <CustomText type="bold" style={styles.benefitsTitle}>
                فوائد تفعيل الإشعارات:
              </CustomText>
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Ionicons name="flash" size={20} color={colors.primary} />
                  <CustomText style={styles.benefitText}>إشعارات فورية للطلبات الجديدة</CustomText>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                  <CustomText style={styles.benefitText}>تحديثات حالة الطلبات</CustomText>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="pricetag" size={20} color={colors.primary} />
                  <CustomText style={styles.benefitText}>عروض خاصة وخصومات</CustomText>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="information-circle" size={20} color={colors.primary} />
                  <CustomText style={styles.benefitText}>تنبيهات مهمة وخدمة العملاء</CustomText>
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[globalStyles.button, styles.allowButton]}
                onPress={requestPermission}
                disabled={isLoading}
              >
                <CustomText type="bold" style={globalStyles.buttonText}>
                  {isLoading ? 'جاري الطلب...' : 'السماح بالإشعارات'}
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.skipButton]}
                onPress={skipPermission}
                disabled={isLoading}
              >
                <CustomText style={styles.skipButtonText}>
                  تخطي
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <CustomText type="bold" style={styles.headerTitle}>
          إعدادات الإشعارات
        </CustomText>
        <View style={styles.placeholder} />
      </View>

      {renderPermissionContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.text,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  benefitsTitle: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  benefitsList: {
    width: '100%',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  benefitText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  instructions: {
    width: '100%',
    marginBottom: 30,
  },
  instructionTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  allowButton: {
    marginBottom: 15,
  },
  settingsButton: {
    marginBottom: 15,
  },
  continueButton: {
    marginTop: 20,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tokenInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  tokenTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
  },
  tokenText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  clearButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  clearButtonText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
}); 