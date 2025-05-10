import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../../components/common/CustomText';
import { useAuth } from '../../context/AuthContext';

const MENU_ITEMS = [
  {
    label: 'طلباتي',
    icon: <MaterialCommunityIcons name="file-document-outline" size={22} color="#4B6CB7" />, // Orders
    screen: 'Orders',
  },
  {
    label: 'الأمان',
    icon: <Ionicons name="lock-closed-outline" size={22} color="#4B6CB7" />, // Security
    screen: 'Security',
  },
  {
    label: 'الشروط والأحكام',
    icon: <Ionicons name="document-text-outline" size={22} color="#4B6CB7" />, // Terms
    screen: 'Terms',
  },
  {
    label: 'الأسئلة الشائعة',
    icon: <Ionicons name="help-circle-outline" size={22} color="#4B6CB7" />, // FAQ
    screen: 'FAQ',
  },
  {
    label: 'تواصل معنا',
    icon: <Ionicons name="chatbubble-ellipses-outline" size={22} color="#4B6CB7" />, // Contact
    screen: 'Contact',
  },
];

export default function Profile() {
  const { user, logout } = useAuth();
  // For demo, you can fetch admin profile data if needed
  const [profile] = useState({
    full_name: 'اسم المدير',
    avatar_url: null,
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
            <Image
              source={profile.avatar_url ? { uri: profile.avatar_url } : require('../../../assets/images/avatar-placeholder.jpg')}
              style={styles.avatar}
            />
            <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 12 }}>
              <CustomText type="bold" style={styles.title}>حسابي</CustomText>
              <CustomText style={styles.name}>{profile.full_name}</CustomText>
            </View>
          </View>
        </View>

        <View style={styles.menuList}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {/* navigation logic here */}}
            >
              <View style={styles.menuIcon}>{item.icon}</View>
              <CustomText style={styles.menuLabel}>{item.label}</CustomText>
              <Ionicons name="chevron-back" size={20} color="#B0B0B0" style={styles.menuArrow} />
            </TouchableOpacity>
          ))}
          {/* Logout */}
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            activeOpacity={0.7}
            onPress={logout}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FDEAEA' }]}> 
              <Ionicons name="log-out-outline" size={22} color="#F44336" />
            </View>
            <CustomText style={styles.logoutLabel}>تسجيل الخروج</CustomText>
            <Ionicons name="chevron-back" size={20} color="#F44336" style={styles.menuArrow} />
          </TouchableOpacity>
          {/* Delete Account */}
          <TouchableOpacity
            style={[styles.menuItem, styles.deleteItem]}
            activeOpacity={0.7}
            onPress={() => {/* delete logic here */}}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FDEAEA' }]}> 
              <Ionicons name="trash-outline" size={22} color="#F44336" />
            </View>
            <CustomText style={styles.deleteLabel}>حذف الحساب</CustomText>
            <Ionicons name="chevron-back" size={20} color="#F44336" style={styles.menuArrow} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  name: {
    fontSize: 16,
    color: '#222',
    textAlign: 'right',
  },
  menuList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 16,
    paddingVertical: 8,
    paddingBottom: 24,
    elevation: 1,
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
    backgroundColor: '#F2F4F7',
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
    marginTop: 8,
  },
  logoutLabel: {
    flex: 1,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'right',
  },
  deleteItem: {
    backgroundColor: '#fff',
    borderBottomWidth: 0,
    marginTop: 0,
  },
  deleteLabel: {
    flex: 1,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'right',
  },
}); 