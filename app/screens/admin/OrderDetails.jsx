import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
// import BackButton from '../../components/common/BackButton';
// import BackButton from '../../components/common/BackButton';
import BackBtn from '../../components/common/BackButton';
// import CustomText from '../../components/common/CustomText';
import { Alert } from 'react-native';
import { supabase } from '../../../lib/supabase';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

const statusColors = {
  processing: '#EEEEEE',
  delivered: '#9DFA9F',
  accepted: '#2196F3',
  cancelled: '#F44336',
};

const statusLabels = {
  processing: 'قيد المعالجة',
  delivered: 'تم التوصيل',
  accepted: 'تم القبول',
  cancelled: 'تم الالغاء',
};

export default function OrderDetails({ route, navigation }) {
  const { order } = route.params;
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (error) {
        Alert.alert(
          'خطأ',
          'حدث خطأ أثناء تحديث حالة الطلب. يرجى المحاولة مرة أخرى.',
          [{ text: 'حسناً' }]
        );
        return;
      }

      // Show success message
      Alert.alert(
        'تم التحديث',
        'تم تحديث حالة الطلب بنجاح',
        [
          { 
            text: 'حسناً',
            onPress: () => {
              // Navigate back to refresh the orders list
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert(
        'خطأ',
        'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
        [{ text: 'حسناً' }]
      );
    } finally {
      setIsUpdating(false);
    }
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
          <TouchableOpacity 
            style={[styles.statusBadge, { backgroundColor: statusColors[order.status] || '#E0E0E0' }]} 
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="chevron-down" size={20} color="#262626" style={{ marginLeft: 8 }} />
            <CustomText 
              type='regular' 
              style={[
                styles.statusBadgeText, 
                order.status === 'delivered' && { color: '#262626' }
              ]}
            >
              {statusLabels[order.status] || 'غير معروف'}
            </CustomText>
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
            <CustomText type="bold" style={styles.modalTitle}>تغيير حالة الطلب</CustomText>
            {Object.entries(statusLabels).map(([key, label]) => (
              <Pressable
                key={key}
                style={[
                  styles.statusOption,
                  { backgroundColor: statusColors[key] },
                  key === selectedStatus && styles.selectedStatusOption,
                ]}
                onPress={() => setSelectedStatus(key)}
              >
                <CustomText 
                  type='regular' 
                  style={[
                    styles.statusOptionText,
                    key === 'delivered' && { color: '#262626' }
                  ]}
                >
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
                <CustomText type='bold' style={styles.updateButtonText}>تحديث الحالة</CustomText>
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
  statusBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: 13,
    color: '#222',
    paddingHorizontal: 10,
  },
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
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedStatusOption: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  statusOptionText: {
    fontSize: 13,
    color: '#222',
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
  },
}); 