import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import BackButton from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

const orders = [
  {
    id: 1,
    title: 'مياه معدنية نقية - 5 عبوات',
    date: '2025 أبريل 27',
    time: '14:35',
    status: 'pending',
  },
  {
    id: 2,
    title: 'مياه نقية - عبوة 19 لتر',
    date: '2025 أبريل 27',
    time: '14:35',
    status: 'accepted',
  },
  {
    id: 3,
    title: 'مياه نقية - عبوة 19 لتر',
    date: '2025 أبريل 27',
    time: '14:35',
    status: 'delivered',
  },
];

const statusMap = {
  pending: { label: 'قيد المعالجة', color: '#BFD6F6' },
  accepted: { label: 'تم القبول', color: '#90C2FF' },
  delivered: { label: 'تم التوصيل', color: '#6DD98D' },
};

export default function MyOrdersScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <BackButton />
          <CustomText type="bold" style={styles.title}>طلباتي</CustomText>
          <View style={{ width: 42 }} />
        </View>
        <CustomText type="bold" style={styles.sectionTitle}>سجل الطلبات</CustomText>
        {orders.map(order => (
          <View key={order.id} style={styles.orderCard}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity>
                <CustomText style={styles.arrow}>{'<'}</CustomText>
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <CustomText type="bold" style={styles.orderTitle}>{order.title}</CustomText>
                <CustomText style={styles.orderDate}>تم الطلب بتاريخ: {order.date} - {order.time}</CustomText>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
              <View style={[styles.statusBtn, { backgroundColor: statusMap[order.status].color }] }>
                <CustomText style={styles.statusText}>{statusMap[order.status].label}</CustomText>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'right',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
  },
  orderTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'right',
  },
  orderDate: {
    fontSize: 13,
    color: '#888',
    textAlign: 'right',
  },
  statusBtn: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 18,
    alignSelf: 'flex-end',
  },
  statusText: {
    color: '#222',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  arrow: {
    fontSize: 22,
    color: '#888',
    marginLeft: 8,
    marginRight: 8,
  },
}); 