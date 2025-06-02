import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
// const FILTER_WIDTH = SCREEN_WIDTH * 0.33;

const orderStatuses = [
  { label: 'كل الطلبات', value: 'all' },
  { label: 'قيد الانتظار', value: 'pending' },
  { label: 'قيد المعالجة', value: 'processing' },
  { label: 'في الطريق', value: 'on-the-way' },
  { label: 'تم التوصيل', value: 'delivered' },
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
    status: 'cancelled',
    title: 'مياه معدنية نقية - 5 عبوات',
    date: '27 أبريل 2025',
    time: '14:35',
    address: '759 Ashcraft Court San Diego San Diego',
    price: '10',
  },
];

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

const Orders = () => {
  const navigation = useNavigation();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.status === selectedStatus);

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

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetails', { order });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        Alert.alert(
          'خطأ',
          'حدث خطأ أثناء تحديث حالة الطلب. يرجى المحاولة مرة أخرى.',
          [{ text: 'حسناً' }]
        );
        return;
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      // Show success message
      Alert.alert(
        'تم التحديث',
        'تم تحديث حالة الطلب بنجاح',
        [{ text: 'حسناً' }]
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
      setModalVisible(false);
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
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
            colors={[colors.primary]} // Android
            tintColor={colors.primary} // iOS
          />
        }
      >
        {/* Top Card */}
        <View >
        <LinearGradient
        // Background Linear Gradient
        colors={['#2196F3', '#1870B5']}
        start={{ x: 1, y: 0.9 }}
        end={{ x: 1, y: 0.1 }}
        
        style={[ styles.topCard]}
      >
        
          <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <CustomText type='bold' style={styles.topCardTitle}>إجمالي الطلبات اليوم</CustomText>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginTop: 4 }}>
                <CustomText style={styles.topCardNumber}>{totalOrders}</CustomText>
              </View>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginTop: 4 }}>

                <View style={styles.topCardChange}><CustomText style={styles.topCardChangeText}>+15%</CustomText></View>
              <CustomText style={styles.topCardSubtitle}>من الأمس</CustomText>
              </View>
            </View>
            {/* Placeholder for chart */}
            {/* <View style={styles.chartPlaceholder} /> */}
          </View>
            <Image source={require('../../../assets/images/linear_chart.png')} style={{width:'100%',height:52 ,marginTop:12}}/>
        </LinearGradient>
        </View>

        {/* Filters */}
        <View style={{ marginTop: 10, marginBottom: 8 }}>
          <CustomText type='bold' style={styles.filterTitle}>أخر الطلبات</CustomText>
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
                <View style={styles.orderCard} key={item.id}>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <CustomText style={styles.orderId} numberOfLines={1} ellipsizeMode="tail">#{item.id}</CustomText>
                    <TouchableOpacity 
                      style={[styles.statusBadge, { backgroundColor: statusColors[item.status] || '#E0E0E0' }]}
                      onPress={() => openStatusModal(item)}
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
                    <TouchableOpacity 
                      style={styles.menuButton}
                      onPress={() => handleOrderPress(item)}
                    >
                      <Ionicons name="ellipsis-horizontal" size={20} color="#2196F3" />
                    </TouchableOpacity>
                    <CustomText type='bold' style={styles.orderPrice}>{item.total} دينار</CustomText>
                  </View>
                </View>
              ))}
            </Animated.View>
          )}
        </View>
      </ScrollView>

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
            <CustomText type="bold" style={styles.modalTitle}>تغيير حالة الطلب</CustomText>
            {selectedOrder && Object.entries(statusLabels).map(([key, label]) => (
              <Pressable
                key={key}
                style={[
                  styles.statusOption,
                  { backgroundColor: statusColors[key] },
                  key === selectedOrder.status && styles.selectedStatusOption,
                ]}
                onPress={() => {
                  Alert.alert(
                    'تأكيد',
                    'هل أنت متأكد أنك تريد تغيير حالة الطلب؟',
                    [
                      { text: 'إلغاء', style: 'cancel' },
                      {
                        text: 'تأكيد',
                        onPress: () => handleStatusChange(selectedOrder.id, key),
                      },
                    ]
                  );
                }}
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
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <CustomText type='bold' style={styles.closeButtonText}>إغلاق</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    // fontWeight: 'bold',
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
    // fontWeight: 'bold',
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
    flexDirection: 'row-reverse',
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
    // fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#fff',
    // fontWeight: 'bold',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'flex-start',
    marginBottom: 12,
    shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.06,
    // shadowRadius: 4,
    // elevation: 1,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  orderId: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
    textAlign: 'right',
    width: 200,
    // numberOfLines: 1,
    marginLeft: 8,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    // marginLeft: 8,
    backgroundColor: '#E0E0E0',
  },
  statusBadgeText: {
    fontSize: 13,
    color: '#222',
    // fontWeight: 'bold',
    paddingHorizontal: 10,

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

    // textAlign: 'left',
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
  orderPrice: {
    color: '#2196F3',
    // fontWeight: 'bold',
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
  closeButton: {
    width: '100%',
    backgroundColor: '#F2F4F7',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#262626',
    fontSize: 16,
  },
});
export default Orders; 