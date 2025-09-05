import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import AuthPromptModal from '../../components/common/AuthPromptModal';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { colors } from '../../styling/colors';

export default function GuestProfileScreen() {
  const [authModalVisible, setAuthModalVisible] = useState(false);

  const navigation = useNavigation();
  const openAuth = () => setAuthModalVisible(true);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 , backgroundColor: colors.white }}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
            <Image source={require('../../../assets/images/avatar-placeholder.jpg')} style={styles.avatar} />
            <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 12 }}>
              <CustomText type="bold" style={styles.title}>أهلاً بك</CustomText>
              <CustomText style={styles.username}>لا تملك حساباً بعد</CustomText>
            </View>
              <PrimaryButton title="إنشاء حساب" style={styles.createAccountBtn} onPress={() => setAuthModalVisible(true)} />
          </View>
        </View>

        <View style={styles.menuList}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={openAuth}>
            <View style={styles.menuIcon}>
              <Image source={require('../../../assets/icons/orders.png')} style={{ width: 18, height: 18 }} />
            </View>
            <CustomText type="medium" style={styles.menuLabel}>طلباتي</CustomText>
            <Ionicons name="chevron-back" size={20} color="#292D32" style={styles.menuArrow} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={openAuth}>
            <View style={styles.menuIcon}>
              <Image source={require('../../../assets/icons/security.png')} style={{ width: 18, height: 18 }} />
            </View>
            <CustomText type="medium" style={styles.menuLabel}>الأمان</CustomText>
            <Ionicons name="chevron-back" size={20} color="#292D32" style={styles.menuArrow} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => navigation.navigate('GuestFAQ')}>
            <View style={styles.menuIcon}>
              <Image source={require('../../../assets/icons/faq.png')} style={{ width: 18, height: 18 }} />
            </View>
            <CustomText type="medium" style={styles.menuLabel}>الأسئلة الشائعة</CustomText>
            <Ionicons name="chevron-back" size={20} color="#292D32" style={styles.menuArrow} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => navigation.navigate('GuestContact')}>
            <View style={styles.menuIcon}>
              <Image source={require('../../../assets/icons/contact.png')} style={{ width: 18, height: 18 }} />
            </View>
            <CustomText type="medium" style={styles.menuLabel}>تواصل معنا</CustomText>
            <Ionicons name="chevron-back" size={20} color="#292D32" style={styles.menuArrow} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.loginItem]} activeOpacity={0.9} onPress={openAuth}>
            <CustomText type="bold" style={styles.loginText}>سجّل الدخول أو أنشئ حساباً للوصول لكل الميزات</CustomText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AuthPromptModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
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
  createAccountBtn: {
    marginTop: 10,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
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
  loginItem: {
    backgroundColor: '#fff',
    borderBottomWidth: 0,
    marginTop: 12,
  },
  loginText: {
    fontSize: 15,
    color: colors.primary,
    textAlign: 'center',
    width: '100%',
  },
});


