import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useCart } from '../../context/CartContext';
import { colors } from '../../styling/colors';
import CustomText from '../common/CustomText';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <View style={styles.container}>
      <Image source={product.image} style={styles.image} />
      <View style={styles.info}>
        <CustomText type="bold" style={styles.name}>{product.name}</CustomText>
        <CustomText style={styles.price}>${product.price.toFixed(2)}</CustomText>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddToCart}
        >
          <CustomText style={styles.addButtonText}>أضف إلى السلة</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProductCard; 