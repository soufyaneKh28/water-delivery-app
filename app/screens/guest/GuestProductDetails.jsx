import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { colors } from '../../styling/colors';

const { width } = Dimensions.get('window');

export default function GuestProductDetails({ route, navigation }) {
  const { image_url, title, size, price, oldPrice, description, id } = route.params.product;
  const [quantity, setQuantity] = useState(1);

  console.log(route.params);
  const handleAddToCart = () => {
    Toast.show({
      type: 'info',
      text1: 'تسجيل الدخول مطلوب',
      text2: 'يرجى تسجيل الدخول لإضافة المنتج إلى السلة',
      position: 'bottom',
      visibilityTime: 3000,
    });
  };

  const handleLoginPress = () => {
    navigation.navigate('Auth');
  };

  return (
    <View style={styles.container}>
      {/* Top bar with back button */}
      <View style={styles.topBar}>
        <BackBtn/>
      </View>
      
      {/* Product Image */}
      <Image source={image_url ? { uri: image_url } : require('../../../assets/images/bottle.png')} style={styles.productImage} resizeMode="contain" />
      
      {/* Card Section */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.oldPrice}>{oldPrice}</Text>
            <Text style={styles.price}>{price} د.أ</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <CustomText type="semiBold" style={styles.title}>{title}</CustomText>
            <CustomText type="regular" style={styles.size}>{size} لتر</CustomText>
          </View>
        </View>
        
        {/* Description */}
        <TouchableOpacity>
          <CustomText type="medium" style={styles.link}>الوصف</CustomText>
        </TouchableOpacity>
        <ScrollView style={styles.descriptionScroll} contentContainerStyle={{paddingBottom: 10}} showsVerticalScrollIndicator={false}>
          <CustomText type="regular" style={styles.description}>
            {description || 'لا يوجد وصف متاح للمنتج'}
          </CustomText>
        </ScrollView>
        
        {/* Quantity and Add to Cart */}
        <View style={styles.addRow}>
          <View style={styles.qtyControl}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
              <AntDesign name="minus" size={20} color="#fff" />
            </TouchableOpacity>
            <CustomText type="semiBold" style={styles.qtyText}>{quantity}</CustomText>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => q + 1)}>
              <AntDesign name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <PrimaryButton 
            style={styles.addToCartBtn} 
            title="أضف إلى السلة" 
            onPress={handleAddToCart}
          />
        </View>
        
        {/* Guest Message */}
        {/* <View style={styles.guestMessageContainer}>
          <CustomText type="bold" style={styles.guestMessageTitle}>
            تسجيل الدخول مطلوب
          </CustomText>
          <CustomText style={styles.guestMessageText}>
            يمكنك تصفح المنتج الآن. سجل دخولك للوصول إلى المزيد من الميزات مثل إضافة المنتج إلى السلة وتتبع الطلبات.
          </CustomText>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={handleLoginPress}
          >
            <CustomText type="bold" style={styles.ctaButtonText}>
              إنشاء حساب الآن
            </CustomText>
          </TouchableOpacity>
        </View> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  productImage: {
    width: '100%',
    height: 350,
    marginTop: 10,
    // marginBottom: 10,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    color: '#222',
    textAlign: 'right',
  },
  size: {
    fontSize: 15,
    color: '#888',
    textAlign: 'right',
  },
  oldPrice: {
    fontSize: 15,
    color: '#B0B0B0',
    textDecorationLine: 'line-through',
    marginBottom: 2,
    textAlign: 'left',
  },
  price: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'left',
  },
  link: {
    color: colors.primary,
    fontSize: 15,
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'right',
  },
  description: {
    color: '#888',
    fontSize: 15,
    textAlign: 'right',
    lineHeight: 27,
  },
  descriptionScroll: {
    maxHeight: 100,
    marginBottom: 20,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  qtyControl: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 90,
    justifyContent: 'space-between',
  },
  qtyBtn: {
    backgroundColor: '#071F5D',
    borderRadius: 50,
    padding: 10,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  addToCartBtn: {
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginLeft: 10,
    flex: 1
  },
  guestMessageContainer: {
    backgroundColor: colors.primary + '20',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  guestMessageTitle: {
    color: colors.primary,
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  guestMessageText: {
    color: colors.primary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
