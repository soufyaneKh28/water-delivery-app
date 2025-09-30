import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { colors } from '../../styling/colors';

function formatAddressString(address) {
  if (!address) return '';
  const parts = [
    address.label,
    address.city,
    address.address,
    `مبنى ${address.building_no}`,
    `طابق ${address.floor_no}`,
    address.description
  ].filter(Boolean);
  return parts.join('، ');
}

export default function OrderSuccessScreen({ route, navigation }) {
  const { order, cart, total, selectedAddress } = route.params || {};

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/images/success.png')} style={styles.successImage} />
      <CustomText type="bold" style={styles.title}>تم إرسال الطلب بنجاح!</CustomText>
      <CustomText style={styles.subtitle}>شكرًا لطلبك. فيما يلي ملخص طلبك:</CustomText>
      <ScrollView style={styles.summaryBox} contentContainerStyle={{paddingBottom: 20}}>
        <CustomText type="bold" style={styles.sectionTitle}>العنوان</CustomText>
        <CustomText style={styles.addressText}>{formatAddressString(selectedAddress)}</CustomText>
        <CustomText type="bold" style={styles.sectionTitle}>المنتجات</CustomText>
        {cart && cart.length > 0 ? cart.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <CustomText>{item.title || item.name || `منتج (${item.product_id})`}</CustomText>
            <CustomText>x{item.quantity}</CustomText>
          </View>
        )) : <CustomText>لا توجد منتجات</CustomText>}
        <CustomText type="bold" style={styles.sectionTitle}>الإجمالي</CustomText>
        <CustomText style={styles.totalText}>
          {order?.order_type === 'coupon' ? String(total) : Number(total).toFixed(2)} {order?.order_type === 'coupon' ? 'كوبون' : 'دينار'}
        </CustomText>
      </ScrollView>
      <PrimaryButton title="العودة للرئيسية" style={styles.button} onPress={() => navigation.navigate('ClientTabs')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryBox: {
    width: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    maxHeight: 250,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 6,
    marginTop: 10,
    textAlign: 'right',
  },
  addressText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 50,
    marginTop: 20,
  },
}); 