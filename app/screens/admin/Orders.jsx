import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../../components/common/CustomText';

const SCREEN_WIDTH = Dimensions.get('window').width;
const FILTER_WIDTH = SCREEN_WIDTH * 0.33;

const orderStatuses = [
  { label: 'كل الطلبات', value: 'all' },
  { label: 'قيد المعالجة', value: 'pending' },
  { label: 'تم التوصيل', value: 'delivered' },
  { label: 'تم القبول', value: 'accepted' },
  { label: 'تم الالغاء', value: 'cancelled' },
];

const mockOrders = [
  {
    id: '1234',
    status: 'pending',
    title: 'مياه معدنية نقية - 5 عبوات',
    date: '27 أبريل 2025',
    time: '14:35',
    address: '759 Ashcraft Court San Diego San Diego',
    price: '10',
  },
  {
    id: '1235',
    status: 'delivered',
    title: 'مياه معدنية نقية - 5 عبوات',
    date: '27 أبريل 2025',
    time: '14:35',
    address: '759 Ashcraft Court San Diego San Diego',
    price: '10',
  },
  {
    id: '1236',
    status: 'delivered',
    title: 'مياه معدنية نقية - 5 عبوات',
    date: '27 أبريل 2025',
    time: '14:35',
    address: '759 Ashcraft Court San Diego San Diego',
    price: '10',
  },
];

const statusColors = {
  pending: '#E0E0E0',
  delivered: '#4CAF50',
  accepted: '#2196F3',
  cancelled: '#F44336',
};

const statusLabels = {
  pending: 'قيد المعالجة',
  delivered: 'تم التوصيل',
  accepted: 'تم القبول',
  cancelled: 'تم الالغاء',
};

const Orders = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredOrders = selectedStatus === 'all'
    ? mockOrders
    : mockOrders.filter(order => order.status === selectedStatus);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Top Card */}
        <View style={styles.topCard}>
          <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <CustomText style={styles.topCardTitle}>إجمالي الطلبات اليوم</CustomText>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginTop: 4 }}>
                <CustomText style={styles.topCardNumber}>24</CustomText>
                <View style={styles.topCardChange}><CustomText style={styles.topCardChangeText}>+15%</CustomText></View>
              </View>
              <CustomText style={styles.topCardSubtitle}>من الأمس</CustomText>
            </View>
            {/* Placeholder for chart */}
            <View style={styles.chartPlaceholder} />
          </View>
        </View>

        {/* Filters */}
        <View style={{ marginTop: 16, marginBottom: 8 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.filtersRow, { minWidth: '100%' }]}
          >
            {orderStatuses.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.filterChip,
                  { width: FILTER_WIDTH },
                  selectedStatus === status.value && styles.filterChipActive,
                ]}
                onPress={() => setSelectedStatus(status.value)}
                activeOpacity={0.7}
              >
                <CustomText style={[
                  styles.filterText,
                  { fontSize: 18 },
                  selectedStatus === status.value && styles.filterTextActive,
                ]}>
                  {status.label}
                </CustomText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Orders List */}
        <View style={{ paddingHorizontal: 12, paddingBottom: 16 }}>
          {filteredOrders.length === 0 ? (
            <CustomText style={styles.emptyText}>لا توجد طلبات</CustomText>
          ) : (
            filteredOrders.map((item) => (
              <View style={styles.orderCard} key={item.id}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 8 }}>
                  <CustomText style={styles.orderId}>#{item.id}</CustomText>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] || '#E0E0E0' }]}> 
                    <CustomText style={[styles.statusBadgeText, item.status === 'delivered' && { color: '#fff' }]}>{statusLabels[item.status]}</CustomText>
                  </View>
                </View>
                <CustomText style={styles.orderTitle}>{item.title}</CustomText>
                <CustomText style={styles.orderDate}>{item.date} - {item.time}</CustomText>
                <CustomText style={styles.orderAddress}>{item.address}</CustomText>
                <View style={styles.orderFooter}>
                  <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#2196F3" />
                  </TouchableOpacity>
                  <CustomText style={styles.orderPrice}>{item.price} دينار</CustomText>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topCard: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    elevation: 2,
  },
  topCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  topCardNumber: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  topCardChange: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
  },
  topCardChangeText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 12,
  },
  topCardSubtitle: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'right',
  },
  chartPlaceholder: {
    width: 90,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  filtersRow: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 8,
  },
  filterChip: {
    backgroundColor: '#F2F4F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    color: '#888',
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  orderId: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
    marginLeft: 8,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 8,
    backgroundColor: '#E0E0E0',
  },
  statusBadgeText: {
    fontSize: 13,
    color: '#222',
    fontWeight: 'bold',
  },
  orderTitle: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
    textAlign: 'right',
  },
  orderDate: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
    textAlign: 'right',
  },
  orderAddress: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
    textAlign: 'right',
  },
  orderFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  menuButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderPrice: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
    fontSize: 16,
  },
});
export default Orders; 