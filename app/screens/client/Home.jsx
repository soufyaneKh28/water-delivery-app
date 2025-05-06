import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../../components/common/CustomText';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <CustomText type="bold" style={styles.welcomeText}>مرحباً بعودتك!</CustomText>
          <CustomText type="regular" style={styles.subtitle}>اطلب توصيل المياه</CustomText>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <CustomText type="medium" style={styles.actionButtonText}>طلب جديد</CustomText>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <CustomText type="medium" style={[styles.actionButtonText, styles.secondaryButtonText]}>عرض الطلبات</CustomText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <CustomText type="semiBold" style={styles.sectionTitle}>الطلبات الأخيرة</CustomText>
          <View style={styles.orderCard}>
            <CustomText type="medium" style={styles.orderTitle}>طلب #1234</CustomText>
            <CustomText type="regular" style={styles.orderStatus}>تم التوصيل</CustomText>
            <CustomText type="light" style={styles.orderDate}>15 مارس 2024</CustomText>
          </View>
        </View>

        <View style={styles.section}>
          <CustomText type="semiBold" style={styles.sectionTitle}>منتجات المياه</CustomText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
            <View style={styles.productCard}>
              <CustomText type="medium" style={styles.productTitle}>عبوة 5 جالون</CustomText>
              <CustomText type="regular" style={styles.productPrice}>5.99 ريال</CustomText>
            </View>
            <View style={styles.productCard}>
              <CustomText type="medium" style={styles.productTitle}>عبوة 3 جالون</CustomText>
              <CustomText type="regular" style={styles.productPrice}>3.99 ريال</CustomText>
            </View>
          </ScrollView>
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
  },
  welcomeText: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  orderTitle: {
    fontSize: 16,
  },
  orderStatus: {
    color: '#4CAF50',
    marginTop: 5,
  },
  orderDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  productsScroll: {
    marginHorizontal: -20,
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    width: 150,
  },
  productTitle: {
    fontSize: 16,
  },
  productPrice: {
    color: '#007AFF',
    fontSize: 14,
    marginTop: 5,
  },
}); 