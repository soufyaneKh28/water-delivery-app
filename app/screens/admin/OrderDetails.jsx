import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
// import BackButton from '../../components/common/BackButton';
// import BackButton from '../../components/common/BackButton';
import BackBtn from '../../components/common/BackButton';
// import CustomText from '../../components/common/CustomText';
import axios from 'axios';
import dayjs from 'dayjs';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import CustomText from '../../components/common/CustomText';
import SuccessModal from '../../components/common/SuccessModal';
import { colors } from '../../styling/colors';
import { API_BASE_URL } from '../../utils/api';

const statusColors = {
  new: '#FFD700', // Gold for pending
  processing: '#EEEEEE',
  'on-the-way': '#87CEEB', // Sky blue for on-the-way
  delivered: '#9DFA9F',
  cancelled: '#F44336',
};

const statusLabels = {
  new: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  'on-the-way': 'في الطريق',
  delivered: 'تم التوصيل',
  cancelled: 'تم الالغاء',
};

function generateOrderNumber(uuid) {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = ((hash << 5) - hash) + uuid.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  // Make it positive and limit to 8 digits
  return Math.abs(hash).toString().padStart(8, '0').slice(0, 8);
}

// NOTE: Push notifications should be sent by the BACKEND, not the frontend
// Device tokens are stored in the backend database, not Supabase
// This function logs what should happen - the backend needs to implement actual sending
const sendNotificationToClient = async (userId, orderNumber, newStatus) => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📢 ORDER STATUS NOTIFICATION SHOULD BE SENT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('User ID:', userId);
  console.log('Order Number:', orderNumber);
  console.log('New Status:', newStatus);
  console.log('');
  console.log('⚠️  BACKEND NEEDS TO SEND THIS NOTIFICATION');
  console.log('');
  console.log('The backend should:');
  console.log('1. Query device_tokens table for this user');
  console.log('2. Send push notification via Expo Push Service');
  console.log('3. See: BACKEND_NOTIFICATION_FIX_REQUIRED.md');
  console.log('═══════════════════════════════════════════════════════════');
};

export default function OrderDetails({ route, navigation }) {
  const { order } = route.params;
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
console.log("order",order);
  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      console.log(order.id, newStatus);
      
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No access token found');
      console.log('status', newStatus);
    
        const response = await axios.patch(
          `https://water-supplier-2.onrender.com/api/k1/orders/changeOrderStatus/${order.id}`,
          { "status": newStatus },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        console.log("respppppons",response.data);
        
        if(response.data.status == "success") {
          setSuccessMessage('تم تغيير حالة الطلب بنجاح.');
          setShowSuccessModal(true);
          
          // Send push notification to client
          const orderNumber = generateOrderNumber(order.id);
          const clientUserId = order.user_id?.id || order.user_id;
          
          if (clientUserId) {
            console.log('🔔 Sending notification to client:', clientUserId);
            await sendNotificationToClient(clientUserId, orderNumber, newStatus);
          } else {
            console.log('⚠️ No client user ID found for order');
          }
        }
        // return response.data;
      
    } catch (error) {
      console.error('Order status update error:', error);
      Alert.alert(
        'خطأ',
        error.message || 'حدث خطأ غير متوقع أثناء تغيير حالة الطلب. يرجى المحاولة مرة أخرى.',
        [{ text: 'حسناً' }]
      );
    } finally {
      setIsUpdating(false);
      setShowStatusConfirmation(false);
    }
  };

  const formatLocation = (location) => {
    if (!location) return '';
    const parts = [
      location.label,
      location.description,
      location.address,
      location.floor_no ? `طابق ${location.floor_no}` : null,
      location.building_no ? `مبنى ${location.building_no}` : null,
      location.city,
      location.region,
    ];
    return parts.filter(Boolean).join('، ');
  };


  return (
    <SafeAreaView    style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

      <ConfirmationModal
        visible={showStatusConfirmation}
        onClose={() => setShowStatusConfirmation(false)}
        onConfirm={() => {
          setModalVisible(false);
          handleStatusChange(selectedStatus);
        }}
        title="تأكيد التحديث"
        message="هل أنت متأكد أنك تريد تغيير حالة الطلب؟"
        confirmText="تأكيد"
        cancelText="إلغاء"
        type="default"
        loading={isUpdating}
        />
      
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
        title="تم التحديث"
        message={successMessage}
        buttonText="حسناً"
        />
      
      <View style={styles.header}>
        <BackBtn/>
        <CustomText type="bold" style={styles.headerTitle}>تفاصيل الطلب</CustomText>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.detailRow}>
          <CustomText style={styles.detailLabel}>رقم الطلب</CustomText>
          <CustomText style={styles.detailValue}>#{generateOrderNumber(order.id)}</CustomText>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <CustomText style={styles.detailLabel}>تاريخ الطلب</CustomText>
          <View style={styles.dateContainer}>
            <CustomText style={styles.detailValue}>{  dayjs(order.created_at).format('DD MMM YYYY, HH:mm')|| 'غير معروف'}</CustomText>
            {/* <CustomText style={[styles.detailValue, styles.timeText]}>{order.time || 'غير معروف'}</CustomText> */}
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <CustomText style={styles.detailLabel}>الطلب</CustomText>
          <CustomText style={styles.detailValue}>{order.title || 'غير معروف' }</CustomText>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <CustomText style={styles.detailLabel}>اسم العميل</CustomText>
          <CustomText style={styles.detailValue}>{order.user_id?.username || 'غير معروف'}</CustomText>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <CustomText style={styles.detailLabel}>رقم الهاتف</CustomText>
          <CustomText style={styles.detailValue}>{order.user_id?.phone || 'غير معروف'}</CustomText>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <CustomText style={styles.detailLabel}>الموقع</CustomText>
          <CustomText style={styles.detailValue}>{ formatLocation(order.location_id) || 'غير معروف'}</CustomText>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <CustomText style={styles.detailLabel}>طريقة الدفع</CustomText>
          <CustomText style={styles.detailValue}>
            {order.order_type === 'coupon' ? 'كوبونات' : 
             order.order_type === 'on-delivery' ? 'الدفع عند الاستلام' : 
             order.order_type === 'money' ? 'بطاقة ائتمان' : 'غير معروف'}
          </CustomText>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
           <CustomText style={styles.detailLabel}>المبلغ الإجمالي</CustomText>
          <CustomText style={styles.detailValue}>
            {order.order_type === 'coupon' ? String(order.total || 0) : Number(order.total || 0).toFixed(2)} {order.order_type === 'coupon' ? 'كوبونات' : "دينار"}
          </CustomText> 
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
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.statusBadgeText, 
                order.status === 'delivered' && { color: '#262626' }
              ]}
              >
              {statusLabels[order.status] || 'غير معروف'}
            </CustomText>
          </TouchableOpacity>
        </View>

        {/* Receipt Image Section */}
        {order.image_url && (
          <>
            <View style={styles.divider} />
            <View style={styles.receiptSection}>
              <CustomText style={styles.detailLabel}>إيصال الدفع</CustomText>
              <TouchableOpacity 
                style={styles.receiptContainer}
                onPress={() => setReceiptModalVisible(true)}
                activeOpacity={0.7}
                >
                <Image 
                  source={{ uri: order.image_url }} 
                  style={styles.receiptImage}
                  resizeMode="contain"
                  />
                <Ionicons name="expand-outline" size={20} color="#2196F3" style={styles.expandIcon} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Receipt Full Screen Modal */}
      <Modal
        visible={receiptModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReceiptModalVisible(false)}
        >
        <View style={styles.receiptModalOverlay}>
          <View style={styles.receiptModalContent}>
            <View style={styles.receiptModalHeader}>
              <CustomText type="bold" style={styles.receiptModalTitle}>إيصال الدفع</CustomText>
              <TouchableOpacity 
                onPress={() => setReceiptModalVisible(false)} 
                style={styles.receiptCloseButton}
                >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <Image 
              source={{ uri: order.image_url }} 
              style={styles.receiptFullImage}
              resizeMode="contain"
              />
          </View>
        </View>
      </Modal>

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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <CustomText type="bold" style={styles.modalTitle}>تغيير حالة الطلب</CustomText>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            <View style={styles.statusGrid}>
              {Object.entries(statusLabels).map(([key, label], idx) => (
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
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                      styles.statusOptionText,
                      key === 'delivered' && { color: '#262626' }
                    ]}
                    >
                    {label}
                  </CustomText>
                </Pressable>
              ))}
            </View>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => {
                setShowStatusConfirmation(true);
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
</ScrollView>
    </SafeAreaView>
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
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  statusOption: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 4,
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
  dateContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  timeText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  receiptSection: {
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  receiptContainer: {
    marginTop: 8,
    position: 'relative',
    width: '100%',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  receiptModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptModalContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  receiptModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  receiptModalTitle: {
    fontSize: 18,
    color: '#fff',
  },
  receiptCloseButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  receiptFullImage: {
    width: '100%',
    height: '80%',
    borderRadius: 8,
  },
  expandIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 4,
  },
}); 