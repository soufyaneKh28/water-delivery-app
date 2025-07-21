import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../../components/common/CustomText';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { colors } from '../../styling/colors';



export default function Profile() {

  const { user, logout, getAccessToken } = useAuth();
  const { 
    expoPushToken, 
    clearStoredNotificationData, 
    removeDeviceToken,
    permissionStatus, 
    requestNotificationPermission, 
    refreshPermissionStatus
  } = useNotification();
  const navigation = useNavigation();
  const [profile] = useState({
    full_name: 'اسم المدير',
    avatar_url: null,
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  console.log('expoPushToken', expoPushToken);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  useEffect(() => {
    setNotificationEnabled(permissionStatus === 'granted');
  }, [permissionStatus]);

  const checkNotificationStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationEnabled(status === 'granted');
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  const handleNotificationToggle = async (value) => {
    setIsToggling(true);
    
    if (value) {
      // Enable notifications
      try {
        const success = await requestNotificationPermission();
        if (success) {
          setNotificationEnabled(true);
          Alert.alert('تم التفعيل', 'تم تفعيل الإشعارات بنجاح!');
        } else {
          setNotificationEnabled(false);
          Alert.alert(
            'تم الرفض',
            'لتفعيل الإشعارات، يرجى الذهاب إلى إعدادات التطبيق والسماح بالإشعارات',
            [
              { text: 'إلغاء', style: 'cancel' },
              { 
                text: 'فتح الإعدادات', 
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error('Error enabling notifications:', error);
        setNotificationEnabled(false);
        Alert.alert('خطأ', 'حدث خطأ أثناء تفعيل الإشعارات');
      }
    } else {
      // Disable notifications
      Alert.alert(
        'إيقاف الإشعارات',
        'لإيقاف الإشعارات، يرجى الذهاب إلى إعدادات التطبيق وإيقاف الإشعارات للتطبيق',
        [
          { text: 'إلغاء', style: 'cancel', onPress: () => setNotificationEnabled(true) },
          { 
            text: 'فتح الإعدادات', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          }
        ]
      );
      setNotificationEnabled(true); // Keep it enabled since we can't disable programmatically
    }
    
    setIsToggling(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Get fresh access token
      const accessToken = await getAccessToken();
      
      // Start device removal but don't wait for it to complete
      const deviceRemovalPromise = removeDeviceToken(user?.id, accessToken, expoPushToken);
      
      // Clear notification data immediately
      await clearStoredNotificationData();
      
      // Wait for device removal with a maximum timeout
      try {
        await Promise.race([
          deviceRemovalPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);
      } catch (timeoutError) {
        console.log('Device removal timed out, proceeding with logout');
      }
      
      // Proceed with logout regardless of device removal result
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
      // Still logout even if anything fails
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };
  

  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
  };

  const MENU_ITEMS = [
    // {
    //   id: 'orders',
    //   title: 'طلباتي',
    //   icon: require('../../../assets/icons/orders.png'),
    //   onPress: () => navigation.navigate('Orders'),
    // },
    {
      id: 'security',
      title: 'الأمان',
      icon: require('../../../assets/icons/security.png'),
      onPress: () => navigation.navigate('Security'),
    },
    // {
    //   id: 'terms',
    //   title: 'الشروط والأحكام',
    //   icon: require('../../../assets/icons/terms.png'),
    //   onPress: () => navigation.navigate('Terms'),
    // },
    // {
    //   id: 'faq',
    //   title: 'الأسئلة الشائعة',
    //   icon: require('../../../assets/icons/faq.png'),
    //   onPress: () => navigation.navigate('FAQ'),
    // },
    // {
    //   id: 'contact',
    //   title: 'تواصل معنا',
    //   icon: require('../../../assets/icons/contact.png'),
    //   onPress: () => navigation.navigate('Contact'),
    // },
    {
      id: 'offers',
      title: 'إدارة عروض السلايدر',
      icon: require('../../../assets/icons/faq.png'),
      onPress: () => navigation.navigate('Offers'),
    },
    {
      id: 'userCoupons',
      title: 'إدارة كوبونات المستخدمين',
      icon: require('../../../assets/icons/faq.png'),
      onPress: () => navigation.navigate('UserCoupons'),
    },
    {
      id: 'logout',
      title: 'تسجيل الخروج',
      icon: require('../../../assets/icons/logout.png'),
      onPress: () => setShowLogoutModal(true),
    },
    // {
    //   id: 'delete',
    //   title: 'حذف الحساب',
    //   icon: require('../../../assets/icons/trash.png'),
    //   onPress: () => setShowDeleteModal(true),
    // },
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={''} onPress={() => navigation.navigate('EditProfile')}>
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
              <Image
                source={profile?.avatar_url ? { uri: profile.avatar_url } : require('../../../assets/images/avatar-placeholder.jpg')}
                style={styles.avatar}
              />
              <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 12 }}>
                <CustomText type="bold" style={styles.title}>حسابي</CustomText>
                <CustomText style={styles.name}>{profile?.full_name || 'اسم المستخدم'}</CustomText>
              </View>
              <Ionicons name="chevron-back" size={20} color="#292D32" style={styles.menuArrow} />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.menuList}>
          {/* Notification Settings Section */}
          {/* <View style={styles.sectionHeader}>
            <CustomText type="bold" style={styles.sectionTitle}>
              الإشعارات
            </CustomText>
          </View> */}
          
          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <View style={styles.menuIcon}>
                <Image source={require('../../../assets/icons/notification.png')} style={{ width: 18, height: 18 }} />
              </View>
              <View style={styles.notificationText}>
                <CustomText type="medium" style={styles.menuLabel}>
                  إشعارات التطبيق
                </CustomText>
                <CustomText style={styles.notificationDescription}>
                  {notificationEnabled 
                    ? 'ستتلقى إشعارات عن الطلبات الجديدة والتحديثات' 
                    : 'لن تتلقى إشعارات من التطبيق'
                  }
                </CustomText>
              </View>
            </View>
            <Switch
              value={notificationEnabled}
              onValueChange={handleNotificationToggle}
              disabled={isToggling}
              trackColor={{ false: '#E0E0E0', true: colors.primary }}
              thumbColor={notificationEnabled ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#E0E0E0"
            />
          </View>

          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              <View style={styles.menuIcon}>
                <Image source={item.icon} style={{ width: 18, height: 18 }} />
              </View>
              <CustomText style={styles.menuLabel}>{item.title}</CustomText>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} style={styles.menuArrow} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isLoggingOut && setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText type="bold" style={styles.modalTitle}>
              {isLoggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}
            </CustomText>
            <CustomText style={styles.modalText}>
              {isLoggingOut 
                ? 'يرجى الانتظار أثناء إزالة الجهاز من الإشعارات...'
                : 'هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟'
              }
            </CustomText>
            <TouchableOpacity
              style={[styles.modalButton, isLoggingOut && styles.modalButtonDisabled]}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <CustomText style={styles.modalButtonText}>
                {isLoggingOut ? 'جاري المعالجة...' : 'تسجيل الخروج'}
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
            >
              <CustomText style={styles.modalButtonTextSecondary}>إلغاء</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText type="bold" style={styles.modalTitle}>حذف الحساب</CustomText>
            <CustomText style={styles.modalText}>
              هل أنت متأكد أنك تريد حذف حسابك؟ سيؤدي هذا الإجراء إلى حذف جميع بياناتك بشكل دائم ولن تتمكن من استعادتها لاحقًا.
            </CustomText>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleDeleteAccount}
            >
              <CustomText style={styles.modalButtonText}>حذف</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => setShowDeleteModal(false)}
            >
              <CustomText style={styles.modalButtonTextSecondary}>إلغاء</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginLeft: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 2,
    textAlign: 'right',
  },
  name: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  menuList: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 16,
    paddingVertical: 8,
    paddingBottom: 24,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  menuArrow: {
    marginRight: 8,
  },
  logoutItem: {
    backgroundColor: '#FDEAEA',
    borderBottomWidth: 0,
    marginTop: 8,
  },
  logoutLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.error,
    textAlign: 'right',
  },
  deleteItem: {
    backgroundColor: colors.white,
    borderBottomWidth: 0,
    marginTop: 0,
  },
  deleteLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.error,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  modalText: {
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    width: '100%',
    paddingVertical: 12,
    marginBottom: 12,
  },
  modalButtonSecondary: {
    backgroundColor: colors.backgroundLight,
  },
  modalButtonText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 16,
  },
  modalButtonTextSecondary: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 16,
  },
  modalButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.7,
  },
  offersButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 16,
  },
  offersButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#222',
  },
  notificationItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },
  notificationInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    marginLeft: 12,
  },
  notificationDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
}); 