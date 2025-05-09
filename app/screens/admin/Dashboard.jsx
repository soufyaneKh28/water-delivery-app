import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../../components/common/CustomText';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styling/colors';

export default function AdminDashboard() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <CustomText type="bold" style={styles.title}>لوحة التحكم</CustomText>
            <CustomText type="regular" style={styles.subtitle}>مرحباً بك في لوحة التحكم</CustomText>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <CustomText type="bold" style={styles.statNumber}>150</CustomText>
            <CustomText type="regular" style={styles.statLabel}>إجمالي الطلبات</CustomText>
          </View>
          
          <View style={styles.statCard}>
            <CustomText type="bold" style={styles.statNumber}>45</CustomText>
            <CustomText type="regular" style={styles.statLabel}>العملاء النشطين</CustomText>
          </View>
          
          <View style={styles.statCard}>
            <CustomText type="bold" style={styles.statNumber}>12</CustomText>
            <CustomText type="regular" style={styles.statLabel}>الطلبات المعلقة</CustomText>
          </View>
        </View>

        <View style={styles.section}>
          <CustomText type="semiBold" style={styles.sectionTitle}>الطلبات الأخيرة</CustomText>
          {/* Add your recent orders list here */}
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
}); 