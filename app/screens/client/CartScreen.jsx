import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import AuthPromptModal from '../../components/common/AuthPromptModal';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import SuccessModal from '../../components/common/SuccessModal';
import { useAddress } from '../../context/AddressContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { colors } from '../../styling/colors';

export default function CartScreen() {
  const navigation = useNavigation();
  const { selectedAddress } = useAddress();
  const { isAuthenticated } = useAuth();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal,
    showSuccessModal,
    addedProduct,
    addToCart
  } = useCart();
  const [authModalVisible, setAuthModalVisible] = React.useState(false);

  const shipping = 0;
  const subtotal = getCartTotal();
  const total = subtotal + shipping;

  const handleQuantity = (id, delta) => {
    updateQuantity(id, delta);
  };

  const handleDelete = (id) => {
    removeFromCart(id);
  };

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
        <CustomText type="bold" style={styles.price}>{item.price.toFixed(2)} د.أ</CustomText>
      </View>
      </View>
    </View>
  );

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Image 
        source={require('../../../assets/images/empty-cart.png')} 
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <CustomText type="bold" style={styles.emptyTitle}>سلة المشتريات فارغة</CustomText>
      <CustomText style={styles.emptyText}>لم تقم بإضافة أي منتجات إلى سلة المشتريات بعد</CustomText>
      <PrimaryButton 
        title="تصفح المنتجات" 
        style={styles.browseButton}
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <SuccessModal visible={showSuccessModal} product={addedProduct} />
      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
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
              <CustomText style={styles.summaryValue}>{subtotal.toFixed(2)} د.أ</CustomText>
            </View>
            <View style={styles.summaryRow}>
              <CustomText style={styles.summaryLabel}>رسوم الشحن</CustomText>
              <CustomText style={styles.summaryValue}>{shipping.toFixed(2)} د.أ</CustomText>
            </View>
            <View style={styles.summaryRow}>
              <CustomText style={[styles.summaryLabel, { color: colors.primary }]}>الإجمالي</CustomText>
              <CustomText style={[styles.summaryValue, { color: colors.primary }]}>{total.toFixed(2)} د.أ</CustomText>
            </View>
            <PrimaryButton 
              title="تأكيد السلة" 
              style={styles.confirmBtn} 
              onPress={() => {
                if (!isAuthenticated) {
                  setAuthModalVisible(true);
                  return;
                }
                navigation.navigate('Checkout', { 
                  cart, 
                  subtotal, 
                  shipping, 
                  total,
                  selectedAddress
                })
              }} 
            />
          </View>
        </>
      )}
      <AuthPromptModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} />
    </View>
  );
}

// Auth prompt for guests attempting checkout
// Keep outside return wrapper to avoid layout shifts
// Rendered conditionally below

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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    width: '80%',
    borderRadius: 24,
  },
}); 