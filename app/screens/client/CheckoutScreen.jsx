import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../../../lib/supabase';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { useAddress } from '../../context/AddressContext';
import { useCart } from '../../context/CartContext';
import { colors } from '../../styling/colors';
import { globalStyles } from '../../styling/globalStyles';

export default function CheckoutScreen({ route, navigation }) {
  // You can pass cart, subtotal, shipping, total via route.params
  const { cart = [], subtotal = 0, shipping = 0, total = 0 } = route?.params || {};
  const { selectedAddress } = useAddress();
  const { clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('delivery'); // 'delivery' or 'click'
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [businessOwnerNickname, setBusinessOwnerNickname] = useState('00962796129595');
  const [copyFeedback, setCopyFeedback] = useState('');

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

  // Create order function
  const createOrder = async () => {
    try {
      setIsLoading(true);
      const order_type = 'on-delivery'; // Both payment methods use the same order type
      const location_id = selectedAddress?.id;
      const cartPayload = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      }));
      const payload = {
        order_type,
        location_id,
        cart: cartPayload,
      };

      // Get access token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await axios.post(
        'https://water-supplier-2.onrender.com/api/k1/orders/createOrder',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      // Clear the cart after successful order
      clearCart();

      navigation.replace('OrderSuccess', {
        order: payload,
        cart,
        total,
        selectedAddress,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: error.response?.data?.message || error.message || 'حدث خطأ أثناء إرسال الطلب',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedAddress) {
      Toast.show({
        type: 'error',
        text1: 'عنوان التوصيل مطلوب',
        text2: 'يرجى اختيار عنوان التوصيل قبل إتمام الطلب',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }
    
    // Call createOrder for both payment methods
    createOrder();
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(businessOwnerNickname);
      setCopyFeedback('تم نسخ اسم المستخدم إلى الحافظة');
      // Clear the feedback after 2 seconds
      setTimeout(() => {
        setCopyFeedback('');
      }, 2000);
    } catch (error) {
      setCopyFeedback('حدث خطأ أثناء النسخ');
      // Clear the feedback after 3 seconds
      setTimeout(() => {
        setCopyFeedback('');
      }, 3000);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 70 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          {/* <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
          </TouchableOpacity> */}
          <BackBtn />
          <CustomText type="bold" style={styles.title}>إتمام الدفع</CustomText>
          <View style={{ width: 42 }} />
        </View>
        {/* Delivery Address */}
        <CustomText type="bold" style={styles.label}>عنوان التسليم</CustomText>
        <View style={styles.addressBox}>
          {selectedAddress ? (
            <>
              <CustomText type="bold" style={{ fontSize: 16, textAlign: 'right', marginBottom: 4 }}>{selectedAddress.label}</CustomText>
              <CustomText style={{ fontSize: 14, color: '#666', textAlign: 'right' }} numberOfLines={2} ellipsizeMode="tail">
                {formatAddressString(selectedAddress)}
              </CustomText>
            </>
          ) : (
            <View style={styles.noAddressContainer}>
              <CustomText style={{ textAlign: 'right', color: '#666', marginBottom: 12 }}>
                يرجى اختيار عنوان التوصيل قبل إتمام الطلب
              </CustomText>
              <PrimaryButton 
                title="إضافة عنوان جديد" 
                onPress={() => navigation.navigate('MapAddLocation')}
                style={styles.addAddressButton}
              />
            </View>
          )}
        </View>
        {/* Payment Method */}
        <CustomText type="bold" style={styles.label}>طريقة الدفع</CustomText>
        <View style={styles.paymentBox}>
          <TouchableOpacity style={styles.radioRow} onPress={() => setPaymentMethod('delivery')}>
            <CustomText>الدفع عند التسليم</CustomText>
            <Image source={require('../../../assets/icons/cash.png')} style={{ width: 35, height: 35, marginHorizontal: 8, resizeMode: 'contain' }} />
            <View style={[styles.radioCircle, paymentMethod === 'delivery' && { borderColor: colors.primary, backgroundColor: colors.primary }]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.radioRow} onPress={() => setPaymentMethod('click')}>
            <CustomText>الدفع عبر Click</CustomText>
            <Image source={require('../../../assets/images/click.png')} style={{ width: 35, height: 35, marginHorizontal: 8, resizeMode: 'contain' }} />
            <View style={[styles.radioCircle, paymentMethod === 'click' && { borderColor: colors.primary, backgroundColor: colors.primary }]} />
          </TouchableOpacity>
        </View>
        
        {/* Click Payment Details */}
        {paymentMethod === 'click' && (
          <View style={styles.clickPaymentBox}>
            <CustomText type="bold" style={styles.label}>اسم المستخدم للدفع</CustomText>
            <View style={styles.nicknameContainer}>
              <CustomText type="medium" style={styles.nicknameText}>{businessOwnerNickname}</CustomText>
              <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {copyFeedback ? (
              <CustomText type="regular" style={[styles.feedbackText, { color: copyFeedback.includes('خطأ') ? '#FF3B30' : colors.primary }]}>
                {copyFeedback}
              </CustomText>
            ) : (
              <CustomText type="regular" style={styles.instructionText}>
                انسخ اسم المستخدم وادفع عبر تطبيق Click
              </CustomText>
            )}
          </View>
        )}
        
        {/* Note for delivery payment */}
        {paymentMethod === 'delivery' && (
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <CustomText type="bold" style={[styles.label, { maxWidth: '70%' }]}>أدخل ملاحظة للتوصيل (اختياري)</CustomText>
            <TextInput
              style={[styles.input, globalStyles.input]}
              placeholder="أدخل ملاحظة للتوصيل (اختياري)"
              value={note}
              onChangeText={text => { setNote(text); setNoteError(''); }}
              multiline
            />
          </View>
        )}
        {/* Payment Summary */}
        <CustomText type="bold" style={styles.summaryTitle}>ملخص الدفع</CustomText>
        <View style={styles.summaryRow}>
          <CustomText>المجموع الفرعي</CustomText>
          <CustomText>{subtotal} دينار</CustomText>
        </View>
        <View style={styles.summaryRow}>
          <CustomText>رسوم الشحن</CustomText>
          <CustomText>{shipping} دينار</CustomText>
        </View>
        <View style={styles.summaryRow}>
          <CustomText type="bold">الإجمالي</CustomText>
          <CustomText type="bold" style={{ color: colors.primary }}>{total} دينار</CustomText>
        </View>
        <PrimaryButton
          title={isLoading ? "جاري إرسال الطلب..." : "تأكيد الطلب"}
          style={styles.confirmButton}
          onPress={handleConfirm}
          disabled={isLoading}
        >
          {isLoading && (
            <ActivityIndicator 
              color="#fff" 
              style={{ position: 'absolute', right: 20 }} 
            />
          )}
        </PrimaryButton>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  label: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 8,
    marginTop: 12,
    textAlign: 'right',
  },
  addressBox: {
    backgroundColor: 'rgba(33, 150, 243, 0.05)', // 5% opacity of primary color
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 8,
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  paymentBox: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
    padding: 16,
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
  confirmButton: {
    width: '100%',
    height: 50,
    borderRadius: 50,
    marginTop: 20,
  },
  noAddressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  addAddressButton: {
    width: '100%',
    height: 45,
    borderRadius: 8,
  },
  clickPaymentBox: {
    backgroundColor: colors.primaryLight,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nicknameText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'left',
  },
  copyButton: {
    padding: 8,
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  feedbackText: {
    fontSize: 14,
    textAlign: 'right',
    marginTop: 4,
  },
}); 