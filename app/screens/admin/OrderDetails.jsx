import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);

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
        <View style={{ width: 28 }} />
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
        <View style={styles.statusRow}>
          <CustomText style={styles.detailLabel}>حالة الطلب</CustomText>
          <TouchableOpacity style={styles.statusButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="chevron-down" size={20} color="#262626" style={{ marginLeft: 8 }} />
            <CustomText style={styles.statusButtonText}>{statusLabels[order.status] || 'غير معروف'}</CustomText>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Modal for changing order status */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <CustomText type="bold" style={styles.modalTitle}>حالة الطلب</CustomText>
            {Object.entries(statusLabels).map(([key, label]) => (
              <Pressable
                key={key}
                style={[
                  styles.statusOption,
                  key === selectedStatus && styles.selectedStatusOption,
                  key === 'delivered' && styles.deliveredStatus,
                  key === 'pending' && styles.pendingStatus,
                  key === 'accepted' && styles.acceptedStatus,
                  key === 'cancelled' && styles.cancelledStatus,
                ]}
                onPress={() => setSelectedStatus(key)}
              >
                <CustomText type='bold' style={[
                  styles.statusOptionText,
                  key === selectedStatus && styles.selectedStatusOptionText,
                  key === 'delivered' && { color: '#2E7D32' },
                  key === 'pending' && { color: '#FF9800' },
                  key === 'accepted' && { color: '#2196F3' },
                  key === 'cancelled' && { color: '#F44336' },
                ]}>
                  {label}
                </CustomText>
              </Pressable>
            ))}
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => {
                setModalVisible(false);
                handleStatusChange(selectedStatus);
              }}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <CustomText type='bold' style={styles.updateButtonText}>تعديل حالة الطلب</CustomText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 16,
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
    justifyContent: 'space-between',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusOption: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedStatusOption: {
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: '#E5F1FF',
  },
  statusOptionText: {
    fontSize: 16,
    // fontWeight: 'bold',
  },
  deliveredStatus: {
    borderColor: '#4CAF50',
  },
  pendingStatus: {
    borderColor: '#FF9800',
  },
  acceptedStatus: {
    borderColor: '#2196F3',
  },
  cancelledStatus: {
    borderColor: '#F44336',
  },
  updateButton: {
    width: '100%',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    // fontWeight: 'bold',
  },
}); 