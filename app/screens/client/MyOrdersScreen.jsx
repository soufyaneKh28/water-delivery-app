import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import OrderCard from '../../components/client/OrderCard';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styling/colors';

const statusMap = {
  pending: { label: 'قيد المعالجة', color: '#BFD6F6' },
  accepted: { label: 'تم القبول', color: '#90C2FF' },
  delivered: { label: 'تم التوصيل', color: '#6DD98D' },
  cancelled: { label: 'ملغي', color: '#FF6B6B' },
};

export default function MyOrdersScreen({ navigation }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
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
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      // Transform the data to match the OrderCard component's expected format
      const transformedOrders = data.map(order => ({
        id: order.id,
        title: order.order_items?.[0]?.product?.title || order.title || 'طلب',
        date: new Date(order.created_at).toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: new Date(order.created_at).toLocaleTimeString('ar-SA', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: order.status,
        total_amount: order.total_amount,
        items: order.order_items?.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price
        }))
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetails', { order });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 30 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="جاري التحديث..."
            titleColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <BackBtn />
          <CustomText type="bold" style={styles.title}>طلباتي</CustomText>
          <View style={{ width: 42 }} />
        </View>
        <CustomText type="bold" style={styles.sectionTitle}>سجل الطلبات</CustomText>
        
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CustomText style={styles.emptyText}>لا توجد طلبات حتى الآن</CustomText>
          </View>
        ) : (
          orders.map(order => (
            <OrderCard 
              key={order.id}
              order={order}
              onPress={() => handleOrderPress(order)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
}); 