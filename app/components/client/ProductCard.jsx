import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useCart } from '../../context/CartContext';
import { colors } from '../../styling/colors';
import CustomText from '../common/CustomText';

const ProductCard = ({ image, title, size, price, oldPrice, onMenuPress, description, id }) => {
  const navigation = useNavigation();
  const { addToCart } = useCart();

  const handlePress = () => {
    navigation.push('ProductDetails', {
      image,
      title,
      size,
      price,
      oldPrice,
      description,
      id
    });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking the add button
    const product = {
      id: id || `${title}-${size}-${price}`, // Use provided id or create a consistent one
      name: title,
      image,
      price: parseFloat(price.replace('$', '')),
      size,
      quantity: 1, // Explicitly set quantity to 1 for quick add
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
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <Image source={image} style={styles.image} resizeMode="cover" />
      <CustomText type="semiBold" style={styles.title}>{title}</CustomText>
      <CustomText type="regular" style={styles.size}>{size}</CustomText>
      <View style={styles.row}>
        <CustomText type="bold" style={styles.price}>{price}</CustomText>
        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          <AntDesign name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    // marginBottom: 16,
    // height: 225,
    // marginHorizontal: 4,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    width: '48%',
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    // RTL: left for RTL, right for LTR
    left:  8 ,
    // :  8,
    zIndex: 2,
    padding: 4,
  },
  image: {
    width: '100%',
    height: 165,
    objectFit: 'cover',
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    // fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    // marginTop: 10,
  },
  price: {
    color: '#2196F3',
    // fontWeight: 'bold',
    fontSize: 18,
  },
  size: {
    color: '#888',
    fontSize: 13,
  },
  button: {
    backgroundColor: colors.secondary,
    // padding: 1
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
});

export default ProductCard; 