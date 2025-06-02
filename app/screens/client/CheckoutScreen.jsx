import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { colors } from '../../styling/colors';
import { globalStyles } from '../../styling/globalStyles';

export default function CheckoutScreen({ route, navigation }) {
  // You can pass cart, subtotal, shipping, total via route.params
  const { cart = [], subtotal = 0, shipping = 0, total = 0, selectedAddress } = route?.params || {};
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'delivery'
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardErrors, setCardErrors] = useState({});
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');

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

  const handleConfirm = () => {
    if (paymentMethod === 'delivery' && note.trim() === '') {
      setNoteError('يرجى إدخال ملاحظة');
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
    navigation.goBack();
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
            <CustomText style={{ textAlign: 'right', color: '#666' }}>يرجى اختيار عنوان التوصيل</CustomText>
          )}
        </View>
        {/* Payment Method */}
        <CustomText type="bold" style={styles.label}>طريقة الدفع</CustomText>
        <View style={styles.paymentBox}>
          <TouchableOpacity style={styles.radioRow} onPress={() => setPaymentMethod('card')}>
            <CustomText>بطاقة ائتمان</CustomText>
            <Image source={require('../../../assets/icons/mastercard.png')} style={{ width: 35, height: 35, marginHorizontal: 8, resizeMode: 'contain' }} />
            <View style={[styles.radioCircle, paymentMethod === 'card' && { borderColor: colors.primary, backgroundColor: colors.primary }]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.radioRow} onPress={() => setPaymentMethod('delivery')}>
            <CustomText>الدفع عند التسليم</CustomText>
            <View style={[styles.radioCircle, paymentMethod === 'delivery' && { borderColor: colors.primary, backgroundColor: colors.primary }]} />
          </TouchableOpacity>
        </View>
        {/* Card Details or Note */}
        {paymentMethod === 'card' ? (
          <>
            <CustomText type="bold" style={styles.label}>اسم حامل البطاقة</CustomText>
            <TextInput
              style={[styles.input, globalStyles.input, cardErrors.cardName ? { borderColor: 'red', borderWidth: 1 } : {}]}
              placeholder="ادخل اسم حامل البطاقة"
              value={cardName}
              onChangeText={text => { setCardName(text); setCardErrors(e => ({ ...e, cardName: undefined })); }}
            />
            {cardErrors.cardName ? <CustomText style={{ color: 'red', marginBottom: 8 }}>{cardErrors.cardName}</CustomText> : null}
            <CustomText type="bold" style={styles.label}>رقم البطاقة</CustomText>
            <TextInput
              style={[styles.input, globalStyles.input, cardErrors.cardNumber ? { borderColor: 'red', borderWidth: 1 } : {}]}
              placeholder="1111 1111 1111 1111"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={text => { setCardNumber(text); setCardErrors(e => ({ ...e, cardNumber: undefined })); }}
            />
            {cardErrors.cardNumber ? <CustomText style={{ color: 'red', marginBottom: 8 }}>{cardErrors.cardNumber}</CustomText> : null}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <CustomText type="bold" style={styles.label}>تاريخ انتهاء الصلاحية</CustomText>
                <TextInput
                  style={[styles.input, globalStyles.input, cardErrors.cardExpiry ? { borderColor: 'red', borderWidth: 1 } : {}]}
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChangeText={text => { setCardExpiry(text); setCardErrors(e => ({ ...e, cardExpiry: undefined })); }}
                />
                {cardErrors.cardExpiry ? <CustomText style={{ color: 'red', marginBottom: 8 }}>{cardErrors.cardExpiry}</CustomText> : null}
              </View>
              <View style={{ flex: 1 }}>
                <CustomText type="bold" style={styles.label}>رمز CVV</CustomText>
                <TextInput
                  style={[globalStyles.input, cardErrors.cardCVV ? { borderColor: 'red', borderWidth: 1 } : {}]}
                  placeholder="123"
                  keyboardType="numeric"
                  value={cardCVV}
                  onChangeText={text => { setCardCVV(text); setCardErrors(e => ({ ...e, cardCVV: undefined })); }}
                />
                {cardErrors.cardCVV ? <CustomText style={{ color: 'red', marginBottom: 8 }}>{cardErrors.cardCVV}</CustomText> : null}
              </View>
            </View>
          </>
        ) : (
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <CustomText type="bold" style={[styles.label, { maxWidth: '70%' }]}>أدخل ملاحظة للتوصيل <CustomText style={{ color: 'red' }}>*</CustomText></CustomText>
            <TextInput
              style={[styles.input, globalStyles.input, noteError ? { borderColor: 'red', borderWidth: 1 } : {}]}
              placeholder="أدخل ملاحظة للتوصيل (مطلوب)"
              value={note}
              onChangeText={text => { setNote(text); setNoteError(''); }}
              multiline
            />
            {noteError ? <CustomText style={{ color: 'red', marginBottom: 8 }}>{noteError}</CustomText> : null}
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
          title="تأكيد الطلب"
          style={styles.confirmButton}
          onPress={handleConfirm}
          disabled={
            (paymentMethod === 'card' && (
              !cardName.trim() ||
              !cardNumber.trim() ||
              !cardExpiry.trim() ||
              !cardCVV.trim()
            )) ||
            (paymentMethod === 'delivery' && !note.trim())
          }
        />
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
}); 