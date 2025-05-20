import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '../../styling/colors';
import CustomText from '../common/CustomText';

const statusMap = {
  pending: { label: 'قيد المعالجة', color: '#BFD6F6' },
  accepted: { label: 'تم القبول', color: '#90C2FF' },
  delivered: { label: 'تم التوصيل', color: '#6DD98D' },
};

export default function OrderCard({ order, onPress }) {
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
        <View style={[styles.statusBtn, { backgroundColor: statusMap[order.status].color }]}>
          <CustomText style={styles.statusText}>{statusMap[order.status].label}</CustomText>
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
  },
}); 