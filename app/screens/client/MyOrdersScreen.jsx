import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import OrderCard from '../../components/client/OrderCard';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

const orders = [
  {
    id: 1,
    title: 'مياه معدنية نقية - 5 عبوات',
    date: '2025 أبريل 27',
    time: '14:35',
    status: 'pending',
  },
  {
    id: 2,
    title: 'مياه نقية - عبوة 19 لتر',
    date: '2025 أبريل 27',
    time: '14:35',
    status: 'accepted',
  },
  {
    id: 3,
    title: 'مياه نقية - عبوة 19 لتر',
    date: '2025 أبريل 27',
    time: '14:35',
    status: 'delivered',
  },
];

const statusMap = {
  pending: { label: 'قيد المعالجة', color: '#BFD6F6' },
  accepted: { label: 'تم القبول', color: '#90C2FF' },
  delivered: { label: 'تم التوصيل', color: '#6DD98D' },
};

export default function MyOrdersScreen({ navigation }) {
  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetails', { orderId: order.id });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <BackBtn />
          <CustomText type="bold" style={styles.title}>طلباتي</CustomText>
          <View style={{ width: 42 }} />
        </View>
        <CustomText type="bold" style={styles.sectionTitle}>سجل الطلبات</CustomText>
        {orders.map(order => (
          <OrderCard 
            key={order.id}
            order={order}
            onPress={() => handleOrderPress(order)}
          />
        ))}
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
}); 