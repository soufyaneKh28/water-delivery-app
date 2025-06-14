import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../../components/common/CustomText';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styling/colors';



export default function Profile() {

  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [profile] = useState({
    full_name: 'اسم المدير',
    avatar_url: null,
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    logout();
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
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText type="bold" style={styles.modalTitle}>تسجيل الخروج</CustomText>
            <CustomText style={styles.modalText}>
              هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟
            </CustomText>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleLogout}
            >
              <CustomText style={styles.modalButtonText}>تسجيل الخروج</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => setShowLogoutModal(false)}
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
}); 