import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '../../styling/colors';
import CustomText from '../common/CustomText';

const statusColors = {
  pending: '#FFD700', // Gold for pending
  processing: '#EEEEEE',
  'on-the-way': '#87CEEB', // Sky blue for on-the-way
  delivered: '#9DFA9F',
  cancelled: '#F44336',
};

const statusLabels = {
  pending: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  'on-the-way': 'في الطريق',
  delivered: 'تم التوصيل',
  cancelled: 'تم الالغاء',
};

export default function OrderCard({ order, onPress }) {
  const status = {
    label: statusLabels[order.status] || 'غير معروف',
    color: statusColors[order.status] || '#E0E0E0'
  };

  return (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.orderInfo}>
          <CustomText type="bold" style={styles.orderTitle}>{order.title}</CustomText>
          <CustomText style={styles.orderDate}>تم الطلب بتاريخ: {order.date} - {order.time}</CustomText>
        </View>
    
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <CustomText 
              type="regular" 
              style={[
                styles.statusBadgeText,
                order.status === 'delivered' && { color: '#262626' }
              ]}
            >
              {status.label}
            </CustomText>
          </View>
        </View>
      </View>
      <View style={styles.arrowContainer}>
        <CustomText style={styles.arrow}>{'<'}</CustomText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'col',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  orderInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  arrowContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
  statusContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: 'flex-end',
  },
  statusBadgeText: {
    fontSize: 13,
    color: '#222',
    paddingHorizontal: 10,
  },
  arrow: {
    fontSize: 22,
    color: '#888',
  },
}); 