import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { supabase } from '../../../lib/supabase';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import CustomText from '../../components/common/CustomText';
import SuccessModal from '../../components/common/SuccessModal';
import { useNotification } from '../../context/NotificationContext';
import { colors } from '../../styling/colors';
import { api } from '../../utils/api';


const SCREEN_WIDTH = Dimensions.get('window').width;
// const FILTER_WIDTH = SCREEN_WIDTH * 0.33;

const orderStatuses = [
  { label: 'كل الطلبات', value: 'all' },
  { label: 'قيد الانتظار', value: 'new' },
  { label: 'قيد المعالجة', value: 'processing' },
  { label: 'في الطريق', value: 'on-the-way' },
  { label: 'تم التوصيل', value: 'delivered' },
  { label: 'تم الالغاء', value: 'cancelled' },
];

const dateFilters = [
  { label: 'كل الأوقات', value: 'all' },
  { label: 'اليوم', value: 'today' },
  { label: 'الأمس', value: 'yesterday' },
  { label: 'آخر 7 أيام', value: 'last7days' },
  { label: 'آخر 30 يوم', value: 'last30days' },
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
    status: 'cancelled',
    title: 'مياه معدنية نقية - 5 عبوات',
    date: '27 أبريل 2025',
    time: '14:35',
    address: '759 Ashcraft Court San Diego San Diego',
    price: '10',
  },
];

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

const orderTypes = [
  { label: 'كوبونات', value: 'coupon' },
  { label: 'طلبات أخرى', value: 'other' }, // This will include both on-delivery and money orders
];

function generateOrderNumber(uuid) {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = ((hash << 5) - hash) + uuid.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  // Make it positive and limit to 8 digits
  return Math.abs(hash).toString().padStart(8, '0').slice(0, 8);
}

const Orders = () => {
  const navigation = useNavigation();
  const { expoPushToken, notification, adminNotifications } = useNotification();
  
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('today');
  const [selectedOrderType, setSelectedOrderType] = useState('coupon');
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchOrders = async () => {
    const { data, error, count } = await supabase
      .from('orders')
      .select(`
        *,
        location_id:locations (*),
        user_id:profiles (*)
      `, { count: 'exact' })
      .order('created_at', { ascending: true });
  
    console.log("orders", data);
    if (!error) {
      setOrders(data || []);
      setTotalOrders(count || 0);
    }
  };

  React.useEffect(() => {
    fetchOrders();
  }, []);

  console.log(orders);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchOrders().finally(() => setRefreshing(false));
  }, []);

  const handleDateFilterChange = (filter) => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Change filter
      setSelectedDateFilter(filter);
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const isOrderInDateRange = (orderDate) => {
    const orderDateTime = dayjs(orderDate);
    const now = dayjs();
    
    switch (selectedDateFilter) {
      case 'today':
        return orderDateTime.isSame(now, 'day');
      case 'yesterday':
        return orderDateTime.isSame(now.subtract(1, 'day'), 'day');
      case 'last7days':
        return orderDateTime.isAfter(now.subtract(7, 'days'));
      case 'last30days':
        return orderDateTime.isAfter(now.subtract(30, 'days'));
      case 'all':
      default:
        return true;
    }
  };

  const filteredOrders = orders
    .filter(order => {
      // Apply the status filter if not 'all'
      return selectedStatus === 'all' || order.status === selectedStatus;
    })
    .filter(order => {
      if (selectedOrderType === 'coupon') return order.order_type === 'coupon';
      // For 'other' type, include both on-delivery and money orders
      return order.order_type === 'on-delivery' || order.order_type === 'money';
    })
    .filter(order => isOrderInDateRange(order.created_at));

  const handleFilterChange = (status) => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Change filter
      setSelectedStatus(status);
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleOrderTypeChange = (type) => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Change filter
      setSelectedOrderType(type);
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetails', { order });
  };

  const handleMenuPress = (order, event) => {
    event.stopPropagation(); // Prevent card press when clicking menu
    setSelectedOrder(order);
    setActionModalVisible(true);
  };

  const handleDeleteOrder = async () => {
    try {
      setIsUpdating(true);
      console.log("selectedOrder.id", selectedOrder.id);
      await api.deleteOrder(selectedOrder.id);
      // Update local state
      setOrders(orders.filter(order => order.id !== selectedOrder.id));
      setTotalOrders(prev => prev - 1);
      setSuccessMessage('تم حذف الطلب بنجاح');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error deleting order:', error);
      Alert.alert(
        'خطأ',
        'حدث خطأ أثناء حذف الطلب. يرجى المحاولة مرة أخرى.',
        [{ text: 'حسناً' }]
      );
    } finally {
      setIsUpdating(false);
      setActionModalVisible(false);
      setShowDeleteConfirmation(false);
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status);
    setModalVisible(true);
  };

  const handleStatusChange = async () => {
    if (!selectedOrder || !selectedStatus || selectedOrder.status === selectedStatus) {
      setModalVisible(false);
      return;
    }
    try {
      setIsUpdating(true);
      await api.updateOrderStatus(selectedOrder.id, selectedStatus);
      setOrders(orders.map(order =>
        order.id === selectedOrder.id ? { ...order, status: selectedStatus } : order
      ));
      setSuccessMessage('تم تحديث حالة الطلب بنجاح');
      setShowSuccessModal(true);
      setModalVisible(false);
    } catch (error) {
      console.error('Order status update error:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.', [{ text: 'حسناً' }]);
    } finally {
      setIsUpdating(false);
      setShowStatusConfirmation(false);
    }
  };

  // Helper function to format location as a single string
  const formatLocation = (location) => {
    if (!location) return '';
    const parts = [
      location.label,
      location.description,
      location.floor_no ? `Floor ${location.floor_no}` : null,
      location.building_no ? `Building ${location.building_no}` : null,
      location.city,
      location.region,
    ];
    return parts.filter(Boolean).join(', ');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Top Card */}
        <View>
          <LinearGradient
            colors={['#2196F3', '#1870B5']}
            start={{ x: 1, y: 0.9 }}
            end={{ x: 1, y: 0.1 }}
            style={[styles.topCard]}
          >
            <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <CustomText type='bold' style={styles.topCardTitle}>إجمالي الطلبات</CustomText>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginTop: 4 }}>
                  <CustomText type='bold' style={styles.topCardNumber}>{totalOrders}</CustomText>
                </View>
              </View>
            </View>
            <Image source={require('../../../assets/images/linear_chart.png')} style={{width:'100%',height:60 ,marginTop:12}}/>
          </LinearGradient>
        </View>

        {/* Notification Test Section */}
        {/* <View style={styles.notificationSection}>
          <CustomText type="bold" style={styles.notificationTitle}>Push Notification Test</CustomText>
          <Text style={styles.notificationText}>Your Expo push token: {expoPushToken}</Text>
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationText}>Title: {notification && notification.request.content.title} </Text>
            <Text style={styles.notificationText}>Body: {notification && notification.request.content.body}</Text>
            <Text style={styles.notificationText}>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
          </View>
          <Button
            title="Send Test Notification"
            onPress={async () => {
              await adminNotifications.sendTestNotification(expoPushToken);
            }}
          />
        </View> */}

        {/* Order Type Tabs */}
        <View style={styles.tabContainer}>
          {orderTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.tab,
                selectedOrderType === type.value && styles.tabActive,
              ]}
              onPress={() => handleOrderTypeChange(type.value)}
              activeOpacity={0.7}
            >
              <CustomText 
                type='bold' 
                style={[
                  styles.tabText,
                  selectedOrderType === type.value && styles.tabTextActive,
                ]}
              >
                {type.label}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Filter */}
        <View style={styles.dateFilterContainer}>
          <CustomText type='bold' style={styles.dateFilterTitle}>الفترة الزمنية</CustomText>
          <TouchableOpacity 
            style={styles.dropdownContainer}
            onPress={() => {
              if (this.datePickerRef) {
                this.datePickerRef.togglePicker(true);
              }
            }}
          >
            <RNPickerSelect
              ref={ref => { this.datePickerRef = ref; }}
              onValueChange={(value) => setSelectedDateFilter(value)}
              value={selectedDateFilter}
              items={dateFilters.map(filter => ({
                label: filter.label,
                value: filter.value,
              }))}
              style={{
                inputIOS: {
                  color: colors.textPrimary,
                  fontSize: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  width: '100%',
                  textAlign: 'right',
                },
                inputAndroid: {
                  color: colors.textPrimary,
                  fontSize: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  width: '100%',
                  textAlign: 'right',
                },
                placeholder: {
                  color: colors.textDisabled,
                },
                iconContainer: {
                  top: 12,
                  left: 0,
                },
              }}
              placeholder={{ label: 'اختر الفترة الزمنية', value: '' }}
              useNativeAndroidPickerStyle={false}
              touchableWrapperProps={{
                style: {
                  flex: 1,
                },
              }}
            />
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={colors.textPrimary} 
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Status Filters */}
        <View style={{ marginTop: 10, marginBottom: 8 }}>
          <CustomText type='bold' style={styles.filterTitle}>حالة الطلب</CustomText>
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
                  { width: "auto" },
                  selectedStatus === status.value && styles.filterChipActive,
                ]}
                onPress={() => handleFilterChange(status.value)}
                activeOpacity={0.7}
              >
                <CustomText type='bold' style={[
                  styles.filterText,
                  { fontSize: 14 },
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
            <Animated.View style={{ opacity: fadeAnim }}>
              {filteredOrders.map((item) => (
                <TouchableOpacity 
                  style={styles.orderCard} 
                  key={item.id}
                  onPress={() => handleOrderPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <CustomText style={styles.orderId} numberOfLines={1} ellipsizeMode="tail">#{generateOrderNumber(item.id)}</CustomText>
                    <TouchableOpacity 
                      style={[styles.statusBadge, { backgroundColor: statusColors[item.status] || '#E0E0E0' }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        openStatusModal(item);
                      }}
                    >
                      <CustomText 
                        type='regular' 
                        style={[styles.statusBadgeText, item.status === 'delivered' && { color: '#262626' }]}
                      >
                        {statusLabels[item.status]}
                      </CustomText>
                    </TouchableOpacity>
                  </View>

                  <CustomText type='bold' style={styles.orderTitle}>{item.title}</CustomText>
                  <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                    <CustomText type='medium' style={styles.orderDate}>
                      {dayjs(item.created_at).format('DD MMM YYYY, HH:mm')}
                    </CustomText>
                    <CustomText type='medium' style={styles.orderAddress} numberOfLines={1} ellipsizeMode="tail">
                      {formatLocation(item.location_id)}
                    </CustomText>
                  </View>
                  <View style={styles.orderFooter}>
                    {item.order_type !== 'coupon' ? (
                      <TouchableOpacity 
                        style={styles.menuButton}
                        onPress={(e) => handleMenuPress(item, e)}
                      >
                        <Ionicons name="ellipsis-horizontal" size={20} color="#2196F3" />
                      </TouchableOpacity>
                    ) : (
                      // <TouchableOpacity 
                      //   style={styles.viewButton}
                      //   onPress={() => handleOrderPress(item)}
                      // >
                      //   <CustomText style={styles.viewButtonText}>عرض</CustomText>
                      // </TouchableOpacity>
                      <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                        {/* <Ionicons name="eye-outline" size={20} color="#2196F3" /> */}
                      </View>
                    )}
                    <CustomText type='bold' style={styles.orderPrice}>
                      {item.total} {item.order_type === 'coupon' ? 'كوبون' : 'دينار'}
                    </CustomText>
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Action Modal (3-dots menu) */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <CustomText type="bold" style={styles.modalTitle}>خيارات الطلب</CustomText>
              <TouchableOpacity onPress={() => setActionModalVisible(false)} style={styles.closeIconButton}>
                <Ionicons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                onPress={() => {
                  console.log('Action button pressed - navigating to upload receipt');
                  setActionModalVisible(false);
                  navigation.navigate('UploadReceiptScreen', { order: selectedOrder });
                }}
              >
                <Ionicons name="receipt-outline" size={24} color="#fff" />
                <CustomText style={styles.actionButtonText}>إضافة إيصال الدفع</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Status Change Modal */}
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
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeIconButton}>
                <Ionicons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            <View style={styles.statusGrid}>
              {selectedOrder && Object.entries(statusLabels).map(([key, label]) => (
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

      <ConfirmationModal
        visible={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteOrder}
        title="تأكيد الحذف"
        message="هل أنت متأكد أنك تريد حذف هذا الطلب؟"
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
        loading={isUpdating}
      />
      
      <ConfirmationModal
        visible={showStatusConfirmation}
        onClose={() => setShowStatusConfirmation(false)}
        onConfirm={handleStatusChange}
        title="تأكيد التحديث"
        message="هل أنت متأكد أنك تريد تغيير حالة الطلب؟"
        confirmText="تأكيد"
        cancelText="إلغاء"
        type="default"
        loading={isUpdating}
      />
      
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="تم بنجاح"
        message={successMessage}
        buttonText="حسناً"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    textAlign: 'right',
  },
  topCardNumber: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  topCardChange: {
    backgroundColor: "#FFFFFF4D",
    justifyContent: "center",
    alignItems: "center", 
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
  },
  topCardChangeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  topCardSubtitle: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'right',
  },
  filterTitle:{
    color: '#121212',
    fontSize: 20,
    textAlign: 'right',
    paddingHorizontal: 16,
  },
  chartPlaceholder: {
    width: 90,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  filtersRow: {
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
    direction: Platform.OS === 'ios' ? 'rtl' : 'ltr',
    paddingHorizontal: 8,
  },
  filterChip: {
    backgroundColor: '#F2F4F7',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    color: '#888',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'flex-start',
    marginBottom: 12,
    shadowColor: '#000',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  orderId: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
    textAlign: 'right',
    width: 200,
    marginLeft: 8,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: '#E0E0E0',
  },
  statusBadgeText: {
    fontSize: 13,
    color: '#222',
  },
  orderTitle: {
    fontSize: 18,
    color: '#222',
    marginBottom: 2,
    textAlign: 'right',
  },
  orderDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
    textAlign: 'right',
  },
  orderAddress: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    width: 200,
  },
  orderFooter: {
    flexDirection: 'row',
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
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderPrice: {
    color: '#2196F3',
    fontSize: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 102,
    alignItems: 'center',
    zIndex: 1001,
    minHeight: 300,
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
  closeIconButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  receiptUploadContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  uploadButton: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  uploadButtonText: {
    color: '#2196F3',
    marginTop: 8,
    fontSize: 16,
  },
  receiptPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  receiptActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  receiptActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  dateFilterContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  dateFilterTitle: {
    color: '#1A1A1A',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'right',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  updateButton: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
    alignItems: 'center',
  },
  notificationTitle: {
    color: '#121212',
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'right',
  },
  notificationText: {
    color: '#222',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'right',
  },
  notificationInfo: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: '100%',
  },
});
export default Orders; 