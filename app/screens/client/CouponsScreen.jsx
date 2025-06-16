import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Toast from 'react-native-toast-message';
import { supabase } from '../../../lib/supabase';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { useAddress } from '../../context/AddressContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styling/colors';
import { globalStyles } from '../../styling/globalStyles';

export default function CouponsScreen({navigation}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null); // 25 or 50
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'delivery'
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardErrors, setCardErrors] = useState({});
  const [refillModalVisible, setRefillModalVisible] = useState(false);
  const [bottleCount, setBottleCount] = useState(1);
  const [couponBalance, setCouponBalance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [refillError, setRefillError] = useState('');
  const { selectedAddress } = useAddress();
  const { user } = useAuth();
  const [couponProducts, setCouponProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [productCount, setProductCount] = useState(1);
  const [isOrderingProduct, setIsOrderingProduct] = useState(false);
  const [selectedBottleCount, setSelectedBottleCount] = useState('0');
  const pickerRef = useRef(null);

  const fetchCouponBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setCouponBalance(data?.balance || 0);
    } catch (error) {
      console.error('Error fetching coupon balance:', error);
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: 'حدث خطأ أثناء تحديث الرصيد',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  const fetchCouponProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('price_type', 'coupon')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCouponProducts(data || []);
    } catch (error) {
      console.error('Error fetching coupon products:', error);
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: 'حدث خطأ أثناء جلب المنتجات',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCouponBalance(),
      fetchCouponProducts()
    ]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchCouponBalance();
      fetchCouponProducts();
    }
  }, [user?.id]);

  const openModal = (book) => {
    setSelectedBook(book);
    setModalVisible(true);
    setPaymentMethod('card');
    setNote('');
    setNoteError('');
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setCardErrors({});
    setSelectedBottleCount('0');
  };
  const closeModal = () => {
    setModalVisible(false);
    setSelectedBook(null);
    setNote('');
    setNoteError('');
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setCardErrors({});
    setSelectedBottleCount('0');
  };

  const handleConfirm = () => {
    if (paymentMethod === 'delivery' && selectedBottleCount === undefined) {
      setNoteError('يرجى اختيار عدد القارورات');
      return;
    }
    if (paymentMethod === 'card') {
      let errors = {};
      if (!cardName.trim()) errors.cardName = 'مطلوب';
      if (!cardNumber.trim()) errors.cardNumber = 'مطلوب';
      if (!cardExpiry.trim()) errors.cardExpiry = 'مطلوب';
      if (!cardCVV.trim()) errors.cardCVV = 'مطلوب';
      setCardErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    // handle order confirmation logic here
    closeModal();
  };

  const incrementBottle = () => setBottleCount(count => count + 1);
  const decrementBottle = () => setBottleCount(count => (count > 1 ? count - 1 : 1));

  const incrementProduct = () => setProductCount(count => count + 1);
  const decrementProduct = () => setProductCount(count => (count > 1 ? count - 1 : 1));

  const handleProductRequest = async (product) => {
    if (!selectedAddress) {
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: 'يرجى اختيار عنوان التوصيل',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    if (couponBalance < (product.price * productCount)) {
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: 'رصيد الكوبونات غير كافي. يرجى شراء المزيد من الكوبونات',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setIsOrderingProduct(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // Prepare the order payload
      const cartPayload = [{
        product_id: product.id,
        quantity: productCount,
      }];

      const payload = {
        order_type: 'coupon',
        location_id: selectedAddress.id,
        cart: cartPayload,
      };

      // Get access token from Supabase
      const token = session?.access_token;

      // Create order using the API endpoint
      await axios.post(
        'https://water-supplier-2.onrender.com/api/k1/orders/createOrder',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      // Reset UI state
      setProductModalVisible(false);
      setProductCount(1);
      setSelectedProduct(null);

      // Navigate to success screen
      navigation.replace('OrderSuccessScreen', {
        order: payload,
        cart: [{ ...product, quantity: productCount }],
        total: product.price * productCount,
        selectedAddress,
      });

    } catch (error) {
      console.error('Error processing product request:', error);
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: error.response?.data?.message || error.message || 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setIsOrderingProduct(false);
    }
  };

  // Helper to format address
  const formatAddressString = (address) => {
    if (!address) return '';
    const parts = [
      address.label,
      address.city,
      address.address,
      `مبنى ${address.building_no}`,
      `طابق ${address.floor_no}`,
      address.description
    ].filter(Boolean);
    return parts.join('، ');
  };

  const handleRefillRequest = async () => {
    if (!selectedAddress) {
      setRefillError('يرجى اختيار عنوان التوصيل');
      return;
    }

    if (couponBalance < bottleCount) {
      setRefillError('رصيد الكوبونات غير كافي. يرجى شراء المزيد من الكوبونات');
      return;
    }

    try {
      // Start a transaction to update the coupon balance
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // First, get the current balance to ensure it hasn't changed
      const { data: currentBalance, error: balanceError } = await supabase
        .from('coupons')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (balanceError) throw balanceError;

      if (currentBalance.balance < bottleCount) {
        setRefillError('تم تغيير الرصيد. يرجى تحديث الصفحة والمحاولة مرة أخرى');
        return;
      }

      // Create the refill order
      const { data: order, error: orderError } = await supabase
        .from('refill_orders')
        .insert([
          {
            user_id: user.id,
            address_id: selectedAddress.id,
            bottle_count: bottleCount,
            status: 'pending',
            coupon_cost: bottleCount,
            order_type: 'coupon',
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Update the coupon balance
      const { error: updateError } = await supabase
        .from('coupons')
        .update({ balance: currentBalance.balance - bottleCount })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setCouponBalance(currentBalance.balance - bottleCount);
      setRefillModalVisible(false);
      setBottleCount(1);
      setRefillError('');

      Toast.show({
        type: 'success',
        text1: 'تم الطلب بنجاح',
        text2: 'تم تسجيل طلب إعادة التعبئة بنجاح',
        position: 'top',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error('Error processing refill request:', error);
      setRefillError('حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى');
    }
  };

  // Reset error when modal opens/closes
  useEffect(() => {
    if (!refillModalVisible) {
      setRefillError('');
    }
  }, [refillModalVisible]);

  return (
    <>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom:100 }} 
        showsVerticalScrollIndicator={true}
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
        {/* Balance Section */}
        <CustomText type="medium" style={styles.balanceLabel}>رصيدي</CustomText>
        <View style={styles.balanceCard}>
          <CustomText type="regular" style={styles.balanceUnit}>كوبون</CustomText>
          <CustomText type="bold" style={styles.balanceValue}>{couponBalance}</CustomText>
        </View>

        {/* Buy Coupon Book Section */}
        <CustomText type="bold" style={styles.sectionTitle}>شراء دفتر كوبونات</CustomText>
        <View style={styles.couponBookList}>
          <View style={styles.couponBookCard}>
            <PrimaryButton title="شراء الدفتر" style={styles.buyButton} onPress={() => openModal(25)} />
            <CustomText type="medium" style={styles.couponBookText}>دفتر 25 كوبون</CustomText>
            <Image source={require('../../../assets/icons/coupons_active.png')} style={styles.couponIcon} />
          </View>
          <View style={styles.couponBookCard}>
            <PrimaryButton title="شراء الدفتر" style={styles.buyButton} onPress={() => openModal(50)} />
            <CustomText type="medium" style={styles.couponBookText}>دفتر 50 كوبون</CustomText>
            <Image source={require('../../../assets/icons/coupons_active.png')} style={styles.couponIcon} />
          </View>
        </View>

        {/* Bottle Refill Section */}
        <CustomText type="bold" style={styles.sectionTitle}>تعبئة قارورة</CustomText>
        <View style={styles.bottleCard}>
          <Image source={require('../../../assets/images/bottle.png')} style={styles.bottleImage} />
          <View style={styles.bottleInfo}>
            <View>
              <CustomText type="bold" style={styles.bottleTitle}>عبوة مياه كبيرة</CustomText>
              <CustomText type="regular" style={styles.bottleSize}>20 لتر</CustomText>
            </View>
            <CustomText type="bold" style={styles.bottleCoupon}>1 كوبون</CustomText>
          </View>
          <PrimaryButton title="طلب اعادة تعبئة" style={styles.refillButton} onPress={() => setRefillModalVisible(true)} />
        </View>

        {/* Coupon Products Section */}
        <CustomText type="bold" style={styles.sectionTitle}>المنتجات المتاحة للكوبونات</CustomText>
        {isLoadingProducts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : couponProducts.length === 0 ? (
          <View style={styles.emptyProductsContainer}>
            <CustomText type="regular" style={styles.emptyProductsText}>لا توجد منتجات متاحة للكوبونات حالياً</CustomText>
          </View>
        ) : (
          couponProducts.map((product) => (
            <View key={product.id} style={styles.bottleCard}>
              <Image 
                source={product.image_url ? { uri: product.image_url } : require('../../../assets/images/bottle.png')} 
                style={styles.bottleImage} 
              />
              <View style={styles.bottleInfo}>
                <View>
                  <CustomText type="bold" style={styles.bottleTitle}>{product.title}</CustomText>
                  <CustomText type="regular" style={styles.bottleSize}>{product.size}</CustomText>
                </View>
                <CustomText type="bold" style={styles.bottleCoupon}>{product.price} كوبون</CustomText>
              </View>
              <PrimaryButton 
                title="طلب المنتج" 
                style={styles.refillButton} 
                onPress={() => {
                  setSelectedProduct(product);
                  setProductModalVisible(true);
                }} 
              />
            </View>
          ))
        )}

      </ScrollView>

      {/* Product Order Modal */}
      <Modal
        visible={productModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setProductModalVisible(false);
          setSelectedProduct(null);
          setProductCount(1);
        }}
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.modalContainer, {paddingBottom: 30}]}>    
            <TouchableOpacity 
              style={{position: 'absolute', top: 10, left: 10, width:30, height:30, zIndex: 1000, alignItems: 'center', justifyContent: 'center'}} 
              onPress={() => {
                setProductModalVisible(false);
                setSelectedProduct(null);
                setProductCount(1);
              }}
            >
              <Ionicons name="close" size={22} color={colors.black} />
            </TouchableOpacity>
            <CustomText type="bold" style={modalStyles.title}>الرصيد الحالي</CustomText>
            <View style={[styles.balanceCard, {marginBottom: 16}]}>        
              <CustomText type="regular" style={styles.balanceUnit}>كوبون</CustomText>
              <CustomText type="bold" style={styles.balanceValue}>{couponBalance}</CustomText>
            </View>
            <CustomText type="bold" style={modalStyles.label}>عدد المنتجات</CustomText>
            <View style={{flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 16}}>
              <Image 
                source={selectedProduct?.image_url ? { uri: selectedProduct.image_url } : require('../../../assets/images/bottle.png')} 
                style={{width: 93, height: 145, marginHorizontal: 12, resizeMode: 'cover'}} 
              />
              <View style={{alignItems: 'flex-end'}}>
                <CustomText type="bold" style={{fontSize: 16}}>{selectedProduct?.title}</CustomText>
                <CustomText type="regular" style={{fontSize: 14}}>{selectedProduct?.size}</CustomText>
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15, backgroundColor: "#F7F7F7", borderRadius: 50}}>
                  <TouchableOpacity onPress={incrementProduct} style={{backgroundColor: colors.secondary, borderRadius: 20, width: 35, height: 35, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4}}>
                    <CustomText style={{color: '#fff', fontSize: 22}}>+</CustomText>
                  </TouchableOpacity>
                  <CustomText type="bold" style={{fontSize: 16, marginHorizontal: 8}}>{productCount}</CustomText>
                  <TouchableOpacity onPress={decrementProduct} style={{backgroundColor: colors.secondary, borderRadius: 20, width: 35, height: 35, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4}}>
                    <CustomText style={{color: '#fff', fontSize: 22}}>-</CustomText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <CustomText type="bold" style={modalStyles.summaryTitle}>ملخص الدفع</CustomText>
            <View style={modalStyles.summaryRow2}>
              <CustomText>X{productCount}</CustomText>
              <CustomText>عدد المنتجات</CustomText>
            </View>
            <View style={modalStyles.summaryRow2}>
              <CustomText type="bold" style={{color: colors.primary}}>
                {selectedProduct ? (selectedProduct.price * productCount) : 0} كوبونات
              </CustomText>
              <CustomText>عدد الكوبونات المراد سحبها</CustomText>
            </View>
            <PrimaryButton
              title={isOrderingProduct ? "جاري إرسال الطلب..." : "تأكيد الطلب"}
              style={modalStyles.confirmButton}
              onPress={() => selectedProduct && handleProductRequest(selectedProduct)}
              disabled={isOrderingProduct}
            >
              {isOrderingProduct && (
                <ActivityIndicator 
                  color="#fff" 
                  style={{ position: 'absolute', right: 20 }} 
                />
              )}
            </PrimaryButton>
          </View>
        </View>
      </Modal>

      {/* Coupon Purchase Modal */}
      <View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
        >
        <SafeAreaView >
          <ScrollView style={modalStyles.modalContainer} contentContainerStyle={{ paddingBottom: 70 ,  }}>
          <TouchableOpacity  style={{position: 'absolute', top: 10, left: 10 , width:30, height:30 ,zIndex: 1000, alignItems: 'center', justifyContent: 'center'}} onPress={closeModal}>
            <Ionicons name="close" size={22} color={colors.black} />
          </TouchableOpacity>
            <CustomText type="bold" style={modalStyles.title}>
              شراء دفتر كوبونات {selectedBook}
            </CustomText>
            {/* Delivery Address */}
            <CustomText type="bold" style={modalStyles.label}>عنوان التسليم</CustomText>
            <View style={modalStyles.addressBox}>
              {selectedAddress ? (
                <>
                  <CustomText style={{textAlign:'right'}} type="bold">{selectedAddress.label}</CustomText>
                  <CustomText style={{ fontSize: 12, color: '#888' , textAlign:'right' ,maxWidth:'80%'}} numberOfLines={2} ellipsizeMode="tail">{formatAddressString(selectedAddress)}</CustomText>
                </>
              ) : (
                <CustomText style={{textAlign:'right', color:'#888'}}>يرجى اختيار عنوان التوصيل</CustomText>
              )}
            </View>
            {/* Payment Method */}
            <CustomText type="bold" style={modalStyles.label}>طريقة الدفع</CustomText>
            <View style={modalStyles.paymentBox}>
              <TouchableOpacity style={modalStyles.radioRow} onPress={() => setPaymentMethod('card')}>
                <CustomText>بطاقة ائتمان</CustomText>
                <Image source={require('../../../assets/icons/mastercard.png')} style={{ width: 35, height: 35, marginHorizontal: 8  , resizeMode: 'contain' }} />
                <View style={[modalStyles.radioCircle, paymentMethod === 'card' && { borderColor: colors.primary, backgroundColor: colors.primary }]} />
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.radioRow} onPress={() => setPaymentMethod('delivery')}>
                <CustomText>الدفع عند التسليم</CustomText>
                <Image source={require('../../../assets/icons/mastercard.png')} style={{ width: 35, height: 35, marginHorizontal: 8  , resizeMode: 'contain' }} />
                <View style={[modalStyles.radioCircle, paymentMethod === 'delivery' && { borderColor: colors.primary, backgroundColor: colors.primary }]} />
              </TouchableOpacity>
            </View>
            {/* Card Details or Note */}
            {paymentMethod === 'card' ? (
              <>
                <CustomText type="bold" style={modalStyles.label}>اسم حامل البطاقة</CustomText>
                <TextInput
                  style={[modalStyles.input,globalStyles.input, cardErrors.cardName ? { borderColor: 'red', borderWidth: 1 } : {}]}
                  placeholder="ادخل اسم حامل البطاقة"
                  value={cardName}
                  onChangeText={text => { setCardName(text); setCardErrors(e => ({ ...e, cardName: undefined })); }}
                />
                {cardErrors.cardName ? <CustomText style={{ color: 'red', marginBottom: 8 }}>{cardErrors.cardName}</CustomText> : null}
                <CustomText type="bold" style={modalStyles.label}>رقم البطاقة</CustomText>
                <TextInput
                  style={[modalStyles.input,globalStyles.input, cardErrors.cardNumber ? { borderColor: 'red', borderWidth: 1 } : {}]}
                  placeholder="1111 1111 1111 1111"
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={text => { setCardNumber(text); setCardErrors(e => ({ ...e, cardNumber: undefined })); }}
                />
                {cardErrors.cardNumber ? <CustomText style={{ color: 'red', marginBottom: 8 }}>{cardErrors.cardNumber}</CustomText> : null}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <CustomText type="bold"   style={modalStyles.label}>تاريخ انتهاء الصلاحية</CustomText>
                    <TextInput
                      style={[modalStyles.input,globalStyles.input, cardErrors.cardExpiry ? { borderColor: 'red', borderWidth: 1 } : {}]}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChangeText={text => { setCardExpiry(text); setCardErrors(e => ({ ...e, cardExpiry: undefined })); }}
                    />
                    {cardErrors.cardExpiry ? <CustomText style={{ color: 'red', marginBottom: 8 }}>{cardErrors.cardExpiry}</CustomText> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <CustomText type="bold" style={modalStyles.label}>رمز CVV</CustomText>
                    <TextInput
                      style={[globalStyles.input, cardErrors.cardCVV ? { borderColor: 'red', borderWidth: 1 } : {}]}
                      placeholder="123"
                      keyboardType="numeric"
                      value={cardCVV}
                      // focusable={true}
                      onChangeText={text => { setCardCVV(text); setCardErrors(e => ({ ...e, cardCVV: undefined })); }}
                    />
                    {cardErrors.cardCVV ? <CustomText style={{ color: 'red', marginBottom: 8 }}>{cardErrors.cardCVV}</CustomText> : null}
                  </View>
                </View>
              </>
            ) : (
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <CustomText type="bold" style={[modalStyles.label, {maxWidth: '70%'}]}>
                  عدد القارورات المطلوبة للتعبئة مع الدفتر
                </CustomText>
                <TouchableOpacity 
                  style={[modalStyles.dropdownContainer, noteError ? { borderColor: 'red', borderWidth: 1 } : {}]}
                  onPress={() => {
                    if (pickerRef.current) {
                      pickerRef.current.togglePicker(true);
                    }
                  }}
                >
                  <RNPickerSelect
                    ref={pickerRef}
                    onValueChange={(value) => {
                      setSelectedBottleCount(value);
                      setNoteError('');
                    }}
                    value={selectedBottleCount}
                    items={[
                      { label: 'لا تريد طلب قارورات', value: '0' },
                      ...Array.from({ length: 21 }, (_, i) => ({
                        label: `${i} قارورة`,
                        value: i.toString()
                      }))
                    ]}
                    style={{
                      inputIOS: {
                        color: colors.textPrimary,
                        fontSize: 16,
                        paddingVertical: 12,
                        paddingHorizontal: 10,
                        width: '100%',
                      },
                      inputAndroid: {
                        color: colors.textPrimary,
                        fontSize: 16,
                        paddingVertical: 12,
                        paddingHorizontal: 10,
                        width: '100%',
                      },
                      placeholder: {
                        color: colors.textDisabled,
                      },
                      iconContainer: {
                        top: 12,
                        left: 0,
                      },
                    }}
                    placeholder={{ label: 'اختر عدد القارورات', value: undefined }}
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
                    style={modalStyles.dropdownIcon}
                  />
                </TouchableOpacity>
                {noteError ? <CustomText style={{ color: 'red', marginBottom: 8 }}>{noteError}</CustomText> : null}
              </View>
            )}
            {/* Payment Summary */}
            <CustomText type="bold" style={modalStyles.summaryTitle}>ملخص الدفع</CustomText>
            <View style={modalStyles.summaryRow}>
              <CustomText>دفتر {selectedBook} كوبون</CustomText>
              <CustomText>23 دينار</CustomText>
            </View>
            <View style={modalStyles.summaryRow}>
              <CustomText>رسوم الشحن</CustomText>
              <CustomText>2 دينار</CustomText>
            </View>
            <View style={modalStyles.summaryRow}>
              <CustomText type="bold">الإجمالي</CustomText>
              <CustomText type="bold" style={{ color: colors.primary }}>{selectedBook === 25 ? '25 دينار' : '50 دينار'}</CustomText>
            </View>
            <PrimaryButton
              title="تأكيد الطلب"
              style={modalStyles.confirmButton}
              onPress={handleConfirm}
              disabled={
                (paymentMethod === 'card' && (
                  !cardName.trim() ||
                  !cardNumber.trim() ||
                  !cardExpiry.trim() ||
                  !cardCVV.trim()
                )) ||
                (paymentMethod === 'delivery' && selectedBottleCount === undefined)
              }
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
        </View>

      {/* Refill Modal */}
      <View>

      <Modal
        visible={refillModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRefillModalVisible(false)}
        >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.modalContainer, {paddingBottom: 30}]}>    
            <TouchableOpacity style={{position: 'absolute', top: 10, left: 10, width:30, height:30, zIndex: 1000, alignItems: 'center', justifyContent: 'center'}} onPress={() => setRefillModalVisible(false)}>
              <Ionicons name="close" size={22} color={colors.black} />
            </TouchableOpacity>
            <CustomText type="bold" style={modalStyles.title}>الرصيد الحالي</CustomText>
            <View style={[styles.balanceCard, {marginBottom: 16}]}>        
              <CustomText type="regular" style={styles.balanceUnit}>كوبون</CustomText>
              <CustomText type="bold" style={styles.balanceValue}>{couponBalance}</CustomText>
            </View>
            <CustomText type="bold" style={modalStyles.label}>عدد القارورات</CustomText>
            <View style={{flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 16 , }}>
              <Image source={require('../../../assets/images/bottle.png')} style={{width: 93, height: 145, marginHorizontal: 12 , resizeMode: 'cover'}} />
              <View style={{alignItems: 'flex-end'}}>
                <CustomText type="bold" style={{fontSize: 16}}>عبوة مياه كبيرة</CustomText>
                <CustomText type="regular" style={{fontSize: 14}}>20 لتر</CustomText>
                <View style={{flexDirection: 'row', alignItems: 'center' , marginTop: 15 , backgroundColor: "#F7F7F7", borderRadius: 50}}>
                <TouchableOpacity onPress={incrementBottle} style={{backgroundColor: colors.secondary, borderRadius: 20, width: 35, height: 35, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4}}>
                  <CustomText style={{color: '#fff', fontSize: 22}}>+</CustomText>
                </TouchableOpacity>
                <CustomText type="bold" style={{fontSize: 16, marginHorizontal: 8}}>{bottleCount}</CustomText>
                <TouchableOpacity onPress={decrementBottle} style={{backgroundColor: colors.secondary, borderRadius: 20, width: 35, height: 35, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4}}>
                  <CustomText style={{color: '#fff', fontSize: 22}}>-</CustomText>
                </TouchableOpacity>
              </View>
              </View>
            </View>
            <CustomText type="bold" style={modalStyles.summaryTitle}>ملخص الدفع</CustomText>
            <View style={modalStyles.summaryRow2}>
              <CustomText>X{bottleCount}</CustomText>
              <CustomText>عدد القارورات</CustomText>
            </View>
            <View style={modalStyles.summaryRow2}>
              <CustomText type="bold" style={{color: colors.primary}}>{bottleCount} كوبونات</CustomText>
              <CustomText>عدد الكوبونات المراد سحبها</CustomText>
            </View>
            {refillError ? (
              <View style={styles.errorContainer}>
                <CustomText style={styles.errorText}>{refillError}</CustomText>
              </View>
            ) : null}
            <PrimaryButton
              title="طلب اعادة تعبئة"
              style={modalStyles.confirmButton}
              onPress={handleRefillRequest}
            />
          </View>
        </View>
      </Modal>
</View>
    </>
  );
}

const styles = StyleSheet.create({
  _container: {
    flex: 1,
    // flexDirectionro
    backgroundColor: colors.white,
    // alignItems: 'center',
    paddingHorizontal: 16,
    
  },
  get container() {
    return this._container;
  },
  set container(value) {
    this._container = value;
  },
  balanceCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row', 
    justifyContent: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  balanceLabel: {
    color: colors.black,
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 4,
    marginTop: 20,
  },
  balanceValue: {
    color: colors.secondary,
    fontSize: 48,
    marginBottom: 2,
  },
  balanceUnit: {
    color: colors.secondary,
    fontSize: 16,
    marginRight: 5,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  couponBookList: {
    marginBottom: 24,
  },
  couponBookCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buyButton: {
    // width: 100,
    height: 40,
    marginLeft: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  couponBookText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  couponIcon: {
    width: 32,
    height: 32,
    marginLeft: 8,
    resizeMode: 'contain',
  },
  bottleCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  bottleImage: {
    width: "100%",
    height: 166,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  bottleInfo: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 12,
    width: '100%',
  },
  bottleTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
    textAlign: 'right',
  },
  bottleSize: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
    textAlign: 'right',
  },
  bottleCoupon: {
    fontSize: 18,
    color: colors.primary,
    // fontWeight: 'bold',
  },
  refillButton: {
    width: '100%',
    height: 45,
    borderRadius: 50,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    fontSize: 14,
  },
  productsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gridRowGap: 20,
    rowGap: 15,
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
    padding: 20,
  },
  emptyProductsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyProductsText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
  },
  bottleDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
}); 

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    // alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 10,
    // alignItems: "flex-end",
    // width: '100%',
    // flex:1,
    // maxHeight: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  title: {
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  label: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 8,
    marginTop: 12,  marginBottom:10,
    textAlign: 'right',
    // maxWidth: '80%',
  },
  addressBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 8,
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  mapImage: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    marginTop: 12,
  },
  paymentBox: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: "flex-end",
    marginBottom: 20,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "flex-end",
    paddingVertical: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textPrimary,
    marginRight: 8,
  },
  input: {
    backgroundColor: colors.primaryLight,
    padding: 30,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    paddingHorizontal: 10,
  },
  summaryTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 20,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryRow2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  confirmButton: {
    width: '100%',
    height: 50,
    borderRadius: 50,
    marginTop: 20,
  },
  pickerContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
    color: colors.textPrimary,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  dropdownIcon: {
    marginLeft: 10,
  },
}); 