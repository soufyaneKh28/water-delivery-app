import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

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

export default function OrderDetailsScreen({ route, navigation }) {
  const { order } = route.params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [order.id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              title,
              image_url,
              price
            )
          ),
          location_id:locations (*),
          user_id:profiles (*)
        `)
        .eq('id', order.id)
        .single();

      if (error) {
        console.error('Error fetching order details:', error);
        return;
      }

      setOrderDetails(data);
    } catch (error) {
      console.error('Error in fetchOrderDetails:', error);
    } finally {
      setLoading(false);
    }
  };
console.log('orderDetails', orderDetails);
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!orderDetails) {
    return (
      <View style={[styles.container, styles.centered]}>
        <CustomText style={styles.errorText}>لم يتم العثور على تفاصيل الطلب</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <BackBtn />
          <CustomText type="bold" style={styles.title}>تفاصيل الطلب</CustomText>
          <View style={{ width: 42 }} />
        </View>

        {/* Order Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[orderDetails.status] || '#E0E0E0' }]}>
            <CustomText 
              type="regular" 
              style={[
                styles.statusText,
                orderDetails.status === 'delivered' && { color: '#262626' }
              ]}
            >
              {statusLabels[orderDetails.status] || 'غير معروف'}
            </CustomText>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <CustomText type="bold" style={styles.sectionTitle}>معلومات الطلب</CustomText>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>رقم الطلب:</CustomText>
              <CustomText style={styles.infoValue}>#{generateOrderNumber(orderDetails.id)}</CustomText>
            </View>
            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>تاريخ الطلب:</CustomText>
              <CustomText style={styles.infoValue}>
                {dayjs(orderDetails.created_at).format('YYYY-MM-DD HH:mm')}
              </CustomText>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <CustomText type="bold" style={styles.sectionTitle}>معلومات العميل</CustomText>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>الاسم:</CustomText>
              <CustomText style={styles.infoValue}>{orderDetails.user_id?.username || 'غير معروف'}</CustomText>
            </View>
            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>العنوان:</CustomText>
              <CustomText style={styles.infoValue}>{formatLocation(orderDetails.location_id) || 'غير معروف'}</CustomText>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <CustomText type="bold" style={styles.sectionTitle}>المنتجات</CustomText>
          <View style={styles.itemsCard}>
            { orderDetails.order_items.length > 0 ? (orderDetails.order_items?.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <CustomText style={styles.itemName}>{item.product?.title || 'منتج غير معروف'}</CustomText>
                  <CustomText style={styles.itemQuantity}>الكمية: {item.quantity}</CustomText>
                </View>
                <CustomText style={styles.itemPrice}>{Number(item.unit_price).toFixed(2)} دينار</CustomText>
              </View>
            ))): (
              <View  style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <CustomText style={styles.itemName}>{orderDetails.title || 'منتج غير معروف'}</CustomText>
                {/* <CustomText style={styles.itemQuantity}>الكمية: {item.quantity}</CustomText> */}
              </View>
              {/* <CustomText style={styles.itemPrice}>{item.unit_price} دينار</CustomText> */}
            </View>
            )}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <CustomText type="bold" style={styles.sectionTitle}>ملخص الطلب</CustomText>
          <View style={styles.summaryCard}>
            {/* <View style={styles.summaryRow}>
              <CustomText style={styles.summaryLabel}>المجموع الفرعي:</CustomText>
              <CustomText style={styles.summaryValue}>{orderDetails.subtotal || 0} دينار</CustomText>
            </View> */}
            <View style={styles.summaryRow}>
              <CustomText style={styles.summaryLabel}>رسوم التوصيل:</CustomText>
              <CustomText style={styles.summaryValue}>{Number(0).toFixed(2)} دينار</CustomText>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <CustomText type="bold" style={styles.totalLabel}>المجموع الكلي:</CustomText>
              <CustomText type="bold" style={styles.totalValue}>
                {orderDetails.order_type === 'coupon' ? String(orderDetails.total || 0) : Number(orderDetails.total || 0).toFixed(2)} {orderDetails.order_type === 'coupon' ? 'كوبون' : 'دينار'}
              </CustomText>
            </View>
            <View style={styles.summaryRow}>
              <CustomText style={styles.summaryLabel}>طريقة الدفع:</CustomText>
              <CustomText style={styles.summaryValue}>
                {orderDetails.order_type === 'on-delivery' 
                  ? 'الدفع عند الاستلام' 
                  : orderDetails.order_type === 'coupon'
                    ? 'كوبون'
                    : 'بطاقة ائتمان'}
              </CustomText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#222',
  },
  section: {
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'right',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'left',
    maxWidth: '80%',
  },
  itemsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  itemName: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'left',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    color: colors.textPrimary,
  },
}); 