import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { colors } from '../../styling/colors';

const cartDataInit = [
  {
    id: '1',
    name: 'عبوة مياه كبيرة',
    image: require('../../../assets/images/bottle.png'),
    price: 4.99,
    oldPrice: 34.99,
    quantity: 1,
  },
  {
    id: '2',
    name: 'عبوة مياه كبيرة',
    image: require('../../../assets/images/bottle.png'),
    price: 4.99,
    oldPrice: 34.99,
    quantity: 1,
  },
  {
    id: '3',
    name: 'عبوة مياه كبيرة',
    image: require('../../../assets/images/bottle.png'),
    price: 4.99,
    oldPrice: 34.99,
    quantity: 1,
  },
];

export default function CartScreen() {
  const [cart, setCart] = useState(cartDataInit);

  const handleQuantity = (id, delta) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const handleDelete = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 4;
  const total = subtotal + shipping;

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={item.image} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <CustomText type="bold" style={styles.itemName}>{item.name}</CustomText>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQuantity(item.id, 1)}>
            <CustomText style={styles.qtyBtnText}>+</CustomText>
          </TouchableOpacity>
          <CustomText type="bold" style={styles.qtyText}>{item.quantity}</CustomText>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQuantity(item.id, -1)}>
            <CustomText style={styles.qtyBtnText}>-</CustomText>
          </TouchableOpacity>
        </View>
      </View>
      <View>

      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
        <Image source={require('../../../assets/icons/trash.png')} style={styles.deleteIcon} />
      </TouchableOpacity>
      <View style={styles.priceCol}>
        {/* <CustomText style={styles.oldPrice}>${item.oldPrice.toFixed(2)}</CustomText> */}
        <CustomText type="bold" style={styles.price}>${item.price.toFixed(2)}</CustomText>
      </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomText type="bold" style={styles.sectionTitle}>عناصر السلة:</CustomText>
      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.summaryBox}>
        <CustomText style={styles.summaryTitle}>ملخص الدفع</CustomText>
        <View style={styles.summaryRow}>
          <CustomText style={styles.summaryLabel}>المجموع الفرعي</CustomText>
          <CustomText style={styles.summaryValue}>${subtotal.toFixed(0)}</CustomText>
        </View>
        <View style={styles.summaryRow}>
          <CustomText style={styles.summaryLabel}>رسوم الشحن</CustomText>
          <CustomText style={styles.summaryValue}>${shipping}</CustomText>
        </View>
        <View style={styles.summaryRow}>
          <CustomText style={[styles.summaryLabel, { color: colors.primary }]}>الإجمالي</CustomText>
          <CustomText style={[styles.summaryValue, { color: colors.primary }]}>${total.toFixed(0)}</CustomText>
        </View>
        <PrimaryButton title="تأكيد السلة" style={styles.confirmBtn} onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 16,
    // direction: 'rtl',
  },
  sectionTitle: {
    fontSize: 18,
    // fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 12,
    textAlign: 'right',
    color: colors.textPrimary,
  },
  cartItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    // backgroundColor: '#F5F7FA',
    // borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
    // padding: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    position: 'relative',
  },
  deleteBtn: {
 
    zIndex: 2,
    width: 32,
    height: 32,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD6D6',
    borderRadius: 20,
    padding: 6,
  },
  deleteIcon: {
    width: 18,
    height: 18,
    tintColor: colors.error,
  },
  itemInfo: {
    flex: 1,
   
    alignItems: 'flex-end',
  },
  itemName: {
    fontSize: 15,
   
    marginBottom: 8,
    color: colors.textPrimary,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    // marginHorizontal: 6,
  },
  qtyBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    // marginHorizontal: 10,
    marginTop: -2,
  },
  qtyText: {
    fontSize: 18,
    // fontWeight: 'bold',
    color: colors.textPrimary,
    minWidth: 24,
    marginHorizontal: 5,
    textAlign: 'center',
  },
  itemImage: {
    width: 75,
    height: 96,
    marginHorizontal: 12,
    resizeMode: 'cover',
  },
  priceCol: {
    alignItems: 'flex-start',
    minWidth: 60,
  },
  oldPrice: {
    color: '#BDBDBD',
    fontSize: 13,
    textDecorationLine: 'line-through',
    marginBottom: 2,
    textAlign: 'right',
  },
  price: {
    color: colors.primary,
    fontSize: 17,
    marginTop: 5,
    // fontWeight: 'bold',
    textAlign: 'right',
  },
  summaryBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
    marginHorizontal: -12,
    marginBottom: 0,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  confirmBtn: {
    marginTop: 18,
    borderRadius: 24,
  },
}); 