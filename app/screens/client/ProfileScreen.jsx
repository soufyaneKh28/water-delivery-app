import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import CustomText from '../../components/common/CustomText';
import { useAddress } from '../../context/AddressContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { colors } from '../../styling/colors';
import { globalStyles } from '../../styling/globalStyles';
import { API_BASE_URL } from '../../utils/api';

const MENU_ITEMS = [
  {
    label: 'طلباتي',
    icon: require('../../../assets/icons/orders.png'), // Orders
    screen: 'Orders',
  },
  {
    label: 'الأمان',
    icon: require('../../../assets/icons/security.png'), // Security
    screen: 'Security',
  },
  // {
  //   label: 'الشروط والأحكام',
  //   icon: require('../../../assets/icons/terms.png'), // Terms
  //   screen: 'Terms',
  // },
  {
    label: 'الأسئلة الشائعة',
    icon: require('../../../assets/icons/faq.png'), // FAQ
    screen: 'FAQ',
  },
  {
    label: 'تواصل معنا',
    icon: require('../../../assets/icons/contact.png'), // Contact
    screen: 'Contact',
  },
];

const COUNTRY_CODES = [
  { code: '+966', country: 'السعودية', flag: '🇸🇦' },
  { code: '+971', country: 'الإمارات', flag: '🇦🇪' },
  { code: '+973', country: 'البحرين', flag: '🇧🇭' },
  { code: '+974', country: 'قطر', flag: '🇶🇦' },
  { code: '+965', country: 'الكويت', flag: '🇰🇼' },
  { code: '+968', country: 'عمان', flag: '🇴🇲' },
  { code: '+962', country: 'الأردن', flag: '🇯🇴' },
  { code: '+961', country: 'لبنان', flag: '🇱🇧' },
  { code: '+20', country: 'مصر', flag: '🇪🇬' },
];

export default function ProfileScreen() {
  const { user, logout, getAccessToken } = useAuth();
  const { 
    permissionStatus, 
    requestNotificationPermission, 
    refreshPermissionStatus,
    expoPushToken,
    removeDeviceToken,
    clearStoredNotificationData
  } = useNotification();
  const { clearSelectedAddress } = useAddress();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) return;
    fetchProfile();
    checkNotificationStatus();
  }, []);

  useEffect(() => {
    setNotificationEnabled(permissionStatus === 'granted');
  }, [permissionStatus]);

  const checkNotificationStatus = async () => {
    if (!user) return;
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

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      Alert.alert('خطأ', 'تعذر تحميل بيانات الحساب');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
    try {
      // Show loading state
      setLoading(true);
      
      // Get fresh access token
      const accessToken = await getAccessToken();
      
      // Remove device token from backend
      if (expoPushToken) {
        try {
          await removeDeviceToken(user?.id, accessToken, expoPushToken);
        } catch (error) {
          console.log('Error removing device token:', error);
        }
      }
      
      // Clear notification data
      await clearStoredNotificationData();
      
      // Delete user account using custom API endpoint
      const response = await fetch(`${API_BASE_URL}/users/deleteUser`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Clear local auth state and logout
      await logout();
      
      Alert.alert(
        'تم الحذف',
        'تم حذف حسابك بنجاح',
        [{ text: 'حسناً' }]
      );
      
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert(
        'خطأ',
        'حدث خطأ أثناء حذف الحساب. يرجى المحاولة مرة أخرى.',
        [{ text: 'حسناً' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      // Always get a fresh access token BEFORE logout
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
    }
  };

  // if (loading) {
  //   return (
  //     <View style={[globalStyles.container, styles.loadingContainer]}>
  //       <ActivityIndicator size="large" color={colors.primary} />
  //     </View>
  //   );
  // }

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent={true}/>
      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="حذف الحساب"
        message="هل أنت متأكد أنك تريد حذف حسابك؟ سيؤدي هذا الإجراء إلى حذف جميع بياناتك بشكل دائم ولن تتمكن من استعادتها لاحقاً."
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />
      
      <ConfirmationModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟"
        confirmText="تسجيل الخروج"
        cancelText="إلغاء"
        type="default"
      />
      
      <ScrollView style={globalStyles.container} contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableOpacity style={''} onPress={() => navigation.navigate('EditProfile')}>
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
              <Image
                source={profile?.avatar_url ? { uri: profile.avatar_url } : require('../../../assets/images/avatar-placeholder.jpg')}
                style={styles.avatar}
              />
              <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 12 }}>
                <CustomText type="bold" style={styles.title}>حسابي</CustomText>
                <CustomText style={styles.username}>@{profile?.username || 'username'}</CustomText>
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
                    ? 'ستتلقى إشعارات عن الطلبات والعروض' 
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

          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                if (item.label === 'طلباتي') {
                  navigation.navigate('MyOrders');
                } else if (item.screen === 'FAQ') {
                  navigation.navigate('ClientFAQ');
                } else if (item.screen === 'Security') {
                  navigation.navigate('ResetPassword');
                } else if (item.screen === 'Contact') {
                  navigation.navigate('Contact');
                } else if (item.screen === 'Terms') {
                  navigation.navigate('Terms');
                } else {
                  // navigation logic for other items
                }
              }}
            >
              <View style={styles.menuIcon}>
                <Image source={item.icon} style={{ width: 18, height: 18 }} />
              </View>
              <CustomText type="medium" style={styles.menuLabel}>{item.label}</CustomText>
              <Ionicons name="chevron-back" size={20} color="#292D32" style={styles.menuArrow} />
            </TouchableOpacity>
          ))}
          {/* Logout */}
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            activeOpacity={0.7}
            onPress={() => setShowLogoutModal(true)}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FDEAEA' }]}> 
              <Image source={require('../../../assets/icons/logout.png')} style={{ width: 18, height: 18 }} />
            </View>
            <CustomText type="medium" style={styles.logoutLabel}>تسجيل الخروج</CustomText>
            <Ionicons name="chevron-back" size={20} color="#F44336" style={styles.menuArrow} />
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity
            style={[styles.menuItem, styles.deleteItem]}
            activeOpacity={0.7}
            onPress={() => setShowDeleteModal(true)}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FDEAEA' }]}> 
              <Image source={require('../../../assets/icons/trash.png')} style={{ width: 18, height: 18 }} />
            </View>
            <CustomText type="medium" style={styles.deleteLabel}>حذف الحساب</CustomText>
            <Ionicons name="chevron-back" size={20} color="#F44336" style={styles.menuArrow} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginLeft: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    color: '#222',
    marginBottom: 2,
    textAlign: 'right',
  },
  username: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  menuList: {
    backgroundColor: '#fff',
    borderRadius: 16,
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
    borderBottomColor: '#F2F4F7',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    textAlign: 'right',
  },
  menuArrow: {
    marginRight: 8,
  },
  logoutItem: {
    backgroundColor: '#FDEAEA',
    borderBottomWidth: 0,
    marginVertical: 20,
  },
  logoutLabel: {
    flex: 1,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'right',
  },
  countryItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
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
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteItem: {
    backgroundColor: '#FDEAEA',
    borderBottomWidth: 0,
    marginTop: 0,
    marginBottom: 20,
  },
  deleteLabel: {
    flex: 1,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'right',
  },
}); 