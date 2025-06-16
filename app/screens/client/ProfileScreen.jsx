import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { testPushNotification } from '../../../lib/notifications';
import { supabase } from '../../../lib/supabase';
import CustomText from '../../components/common/CustomText';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styling/colors';
import { globalStyles } from '../../styling/globalStyles';

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
  {
    label: 'الشروط والأحكام',
    icon: require('../../../assets/icons/terms.png'), // Terms
    screen: 'Terms',
  },
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
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isTestingNotifications, setIsTestingNotifications] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
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
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleTestNotifications = async () => {
    try {
      setIsTestingNotifications(true);
      const success = await testPushNotification(user.id, false);
      if (success) {
        Alert.alert(
          'نجاح',
          'تم إرسال إشعار اختبار. يرجى التحقق من إشعارات جهازك.',
          [{ text: 'حسناً' }]
        );
      } else {
        Alert.alert(
          'خطأ',
          'حدث خطأ أثناء اختبار الإشعارات. يرجى المحاولة مرة أخرى.',
          [{ text: 'حسناً' }]
        );
      }
    } catch (error) {
      console.error('Error testing notifications:', error);
      Alert.alert(
        'خطأ',
        'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
        [{ text: 'حسناً' }]
      );
    } finally {
      setIsTestingNotifications(false);
    }
  };

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => {
        // setSelectedCountry(item);
        // setShowCountryModal(false);
      }}
    >
      <CustomText style={styles.countryFlag}>{item.flag}</CustomText>
      <CustomText style={styles.countryName}>{item.country}</CustomText>
      <CustomText style={styles.countryCodeText}>{item.code}</CustomText>
    </TouchableOpacity>
  );

  // if (loading) {
  //   return (
  //     <View style={[globalStyles.container, styles.loadingContainer]}>
  //       <ActivityIndicator size="large" color={colors.primary} />
  //     </View>
  //   );
  // }

  return (
    <>
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 24,
            width: '85%',
            alignItems: 'center'
          }}>
            <CustomText type="bold" style={{ fontSize: 18, marginBottom: 12, color: '#222' }}>
              حذف الحساب
            </CustomText>
            <CustomText style={{ textAlign: 'center', color: '#222', marginBottom: 24 }}>
              هل أنت متأكد أنك تريد حذف حسابك؟ سيؤدي هذا الإجراء إلى حذف جميع بياناتك بشكل دائم ولن تتمكن من استعادتها لاحقاً.
            </CustomText>
            <TouchableOpacity
              style={{
                backgroundColor: '#F44336',
                borderRadius: 12,
                width: '100%',
                paddingVertical: 12,
                marginBottom: 12
              }}
              onPress={handleDeleteAccount}
            >
              <CustomText style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>حذف</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#F2F4F7',
                borderRadius: 12,
                width: '100%',
                paddingVertical: 12
              }}
              onPress={() => setShowDeleteModal(false)}
            >
              <CustomText style={{ color: '#222', textAlign: 'center', fontSize: 16 }}>إلغاء</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 24,
            width: '85%',
            alignItems: 'center'
          }}>
            <CustomText type="bold" style={{ fontSize: 18, marginBottom: 12, color: '#222' }}>
              تسجيل الخروج
            </CustomText>
            <CustomText style={{ textAlign: 'center', color: '#222', marginBottom: 24 }}>
              هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟
            </CustomText>
            <TouchableOpacity
              style={{
                backgroundColor: '#F44336',
                borderRadius: 12,
                width: '100%',
                paddingVertical: 12,
                marginBottom: 12
              }}
              onPress={handleLogout}
            >
              <CustomText style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>تسجيل الخروج</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#F2F4F7',
                borderRadius: 12,
                width: '100%',
                paddingVertical: 12
              }}
              onPress={() => setShowLogoutModal(false)}
            >
              <CustomText style={{ color: '#222', textAlign: 'center', fontSize: 16 }}>إلغاء</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
          {/* Test Notifications Button */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={handleTestNotifications}
            disabled={isTestingNotifications}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#E5F1FF' }]}>
              <Ionicons name="notifications" size={18} color="#2196F3" />
            </View>
            <CustomText type="medium" style={styles.menuLabel}>
              {isTestingNotifications ? 'جاري الاختبار...' : 'اختبار الإشعارات'}
            </CustomText>
            <Ionicons name="chevron-back" size={20} color="#292D32" style={styles.menuArrow} />
          </TouchableOpacity>

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
        </View>
      </ScrollView>
    </>
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
}); 