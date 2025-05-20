import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import BackButton from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

// This would typically come from an API or database
const mockOrderDetails = {
  id: 1,
  title: 'مياه معدنية نقية - 5 عبوات',
  date: '2025 أبريل 27',
  time: '14:35',
  status: 'pending',
  customerName: 'أحمد محمد',
  phoneNumber: '0501234567',
  address: 'شارع الملك فهد، حي النزهة، الرياض',
  items: [
    { name: 'مياه معدنية نقية - عبوة 330 مل', quantity: 5, price: 10 },
    { name: 'مياه معدنية نقية - عبوة 600 مل', quantity: 3, price: 15 },
  ],
  totalAmount: 95,
  paymentMethod: 'بطاقة ائتمان',
  deliveryFee: 10,
  subtotal: 85,
};

const statusMap = {
  pending: { label: 'قيد المعالجة', color: '#BFD6F6' },
  accepted: { label: 'تم القبول', color: '#90C2FF' },
  delivered: { label: 'تم التوصيل', color: '#6DD98D' },
};

export default function OrderDetailsScreen({ route, navigation }) {
  const { orderId } = route.params;
  // In a real app, you would fetch the order details using the orderId
  const order = mockOrderDetails;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <BackButton />
          <CustomText type="bold" style={styles.title}>تفاصيل الطلب</CustomText>
          <View style={{ width: 42 }} />
        </View>

        {/* Order Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: statusMap[order.status].color }]}>
            <CustomText style={styles.statusText}>{statusMap[order.status].label}</CustomText>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <CustomText type="bold" style={styles.sectionTitle}>معلومات الطلب</CustomText>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>رقم الطلب:</CustomText>
              <CustomText style={styles.infoValue}>#{order.id}</CustomText>
            </View>
            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>تاريخ الطلب:</CustomText>
              <CustomText style={styles.infoValue}>{order.date} - {order.time}</CustomText>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <CustomText type="bold" style={styles.sectionTitle}>معلومات العميل</CustomText>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>الاسم:</CustomText>
              <CustomText style={styles.infoValue}>{order.customerName}</CustomText>
            </View>
            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>رقم الجوال:</CustomText>
              <CustomText style={styles.infoValue}>{order.phoneNumber}</CustomText>
            </View>
            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>العنوان:</CustomText>
              <CustomText style={styles.infoValue}>{order.address}</CustomText>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <CustomText type="bold" style={styles.sectionTitle}>المنتجات</CustomText>
          <View style={styles.itemsCard}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <CustomText style={styles.itemName}>{item.name}</CustomText>
                  <CustomText style={styles.itemQuantity}>الكمية: {item.quantity}</CustomText>
                </View>
                <CustomText style={styles.itemPrice}>{item.price} ريال</CustomText>
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <CustomText type="bold" style={styles.sectionTitle}>ملخص الطلب</CustomText>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <CustomText style={styles.summaryLabel}>المجموع الفرعي:</CustomText>
              <CustomText style={styles.summaryValue}>{order.subtotal} ريال</CustomText>
            </View>
            <View style={styles.summaryRow}>
              <CustomText style={styles.summaryLabel}>رسوم التوصيل:</CustomText>
              <CustomText style={styles.summaryValue}>{order.deliveryFee} ريال</CustomText>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <CustomText type="bold" style={styles.totalLabel}>المجموع الكلي:</CustomText>
              <CustomText type="bold" style={styles.totalValue}>{order.totalAmount} ريال</CustomText>
            </View>
            <View style={styles.summaryRow}>
              <CustomText style={styles.summaryLabel}>طريقة الدفع:</CustomText>
              <CustomText style={styles.summaryValue}>{order.paymentMethod}</CustomText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    // paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  section: {
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'right',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'left',
  },
  itemsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  itemName: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'left',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    color: colors.textPrimary,
  },
}); 