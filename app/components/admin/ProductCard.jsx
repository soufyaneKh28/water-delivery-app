import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { I18nManager, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ProductCard = ({ image, title, size, price, onMenuPress }) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <Ionicons name="ellipsis-horizontal" size={22} color="#888" />
      </TouchableOpacity>
      <Image source={image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.size}>{size}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    // RTL: left for RTL, right for LTR
    left: I18nManager.isRTL ? 8 : undefined,
    right: I18nManager.isRTL ? undefined : 8,
    zIndex: 2,
    padding: 4,
  },
  image: {
    width: 70,
    height: 90,
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginTop: 2,
  },
  price: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 15,
  },
  size: {
    color: '#888',
    fontSize: 13,
  },
});

export default ProductCard; 