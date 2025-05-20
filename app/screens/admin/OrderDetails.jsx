import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
// import BackButton from '../../components/common/BackButton';
// import BackButton from '../../components/common/BackButton';
import BackBtn from '../../components/common/BackButton';
// import CustomText from '../../components/common/CustomText';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';
const statusColors = {
  pending: '#EEEEEE',
  delivered: '#9DFA9F',
  accepted: '#2196F3',
  cancelled: '#F44336',
};

const statusLabels = {
  pending: 'قيد المعالجة',
  delivered: 'تم التوصيل',
  accepted: 'تم القبول',
  cancelled: 'تم الالغاء',
};

export default function OrderDetails({ route, navigation }) {
  const { order } = route.params;
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = (newStatus) => {
    setIsUpdating(true);
    // Here you would typically make an API call to update the order status
    setTimeout(() => {
      setIsUpdating(false);
      // After successful update, you might want to navigate back or refresh the orders list
      navigation.goBack();
    }, 1000);
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <BackBtn/>
        <CustomText type="bold" style={styles.headerTitle}>تفاصيل الطلب</CustomText>
        <View style={{ width: 28 }} /> {/* Placeholder for symmetry */}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.detailRow}>
          <CustomText style={styles.detailLabel}>رقم الطلب</CustomText>
          <CustomText style={styles.detailValue}>#{order.id || 'غير معروف'}</CustomText>
        </View>
        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <CustomText style={styles.detailLabel}>تاريخ الطلب</CustomText>
          <CustomText style={styles.detailValue}>{order.date || 'غير معروف'} - {order.time || 'غير معروف' }</CustomText>
        </View>
        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <CustomText style={styles.detailLabel}>الطلب</CustomText>
          <CustomText style={styles.detailValue}>{order.title || 'غير معروف' }</CustomText>
        </View>
        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <CustomText style={styles.detailLabel}>اسم العميل</CustomText>
          <CustomText style={styles.detailValue}>{order.customerName || 'غير معروف'}</CustomText>
        </View>
        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <CustomText style={styles.detailLabel}>الموقع</CustomText>
          <CustomText style={styles.detailValue}>{order.address || 'غير معروف'}</CustomText>
        </View>
        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <CustomText style={styles.detailLabel}>المبلغ الإجمالي</CustomText>
          <CustomText style={styles.detailValue}>{order.price || 'غير معروف'} دولار</CustomText>
        </View>
        <View style={styles.divider} />

        {/* Status Button */}
        <View style={styles.statusRow}>
          <CustomText style={styles.detailLabel}>حالة الطلب</CustomText>
          <TouchableOpacity style={styles.statusButton}>
            <Ionicons name="chevron-down" size={20} color="#262626" style={{ marginLeft: 8 }} />
            <CustomText style={styles.statusButtonText}>{statusLabels[order.status] || 'غير معروف'}</CustomText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    marginLeft: 0,
  },
  headerTitle: {
    fontSize: 20,
    color: '#222',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 0,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  detailLabel: {
    fontSize: 15,
    color: '#888',
    minWidth: 100,
    textAlign: 'right',
  },
  detailValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
  },
  statusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 12,
  },
  statusButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#9DFA9F',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  statusButtonText: {
    color: '#262626',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 