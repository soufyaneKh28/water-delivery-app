import { AntDesign, Feather } from '@expo/vector-icons';
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from 'react-native-toast-message';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { useCart } from '../../context/CartContext';
import { colors } from '../../styling/colors';

export default function ProductDetailsScreen({ route, navigation }) {
  const { image, title, size, price, oldPrice, description, id } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    const product = {
      id: id || `${title}-${size}-${price}`, // Use provided id or create a consistent one
      name: title,
      image,
      price: parseFloat(price.replace('$', '')),
      size,
      quantity, // Include the selected quantity
    };
    addToCart(product);
    Toast.show({
      type: 'success',
      text1: 'تمت الإضافة',
      text2: 'تمت إضافة المنتج إلى السلة بنجاح!',
      position: 'top',
      visibilityTime: 2500,
    });
  };

  return (
    <View style={styles.container}>
      {/* Top bar with share and back */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="share-2" size={22} color={colors.secondary}/>
        </TouchableOpacity>
        <BackBtn/>
      </View>
      {/* Product Image */}
      <Image source={image} style={styles.productImage} resizeMode="contain" />
      {/* Card Section */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.oldPrice}>{oldPrice}</Text>
            <Text style={styles.price}>{price}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <CustomText type="semiBold" style={styles.title}>{title}</CustomText>
            <CustomText type="regular" style={styles.size}>{size}</CustomText>
          </View>
        </View>
        {/* Description */}
        <TouchableOpacity>
          <CustomText type="medium" style={styles.link}>الوصف</CustomText>
        </TouchableOpacity>
        <CustomText type="regular" style={styles.description}>
          {description || 'لا يوجد وصف متاح للمنتج'}
        </CustomText>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  iconButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  productImage: {
    width: '100%',
    height: 350,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    // left: '4%',
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
    // fontWeight: 'bold',
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
    // fontWeight: 'bold',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'right',
  },
  description: {
    color: '#888',
    fontSize: 15,
    marginBottom: 50,
    textAlign: 'right',
    lineHeight: 27,
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
    // backgroundColor: colors.secondary,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginLeft: 10,
    width:210
  },
  addToCartText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 