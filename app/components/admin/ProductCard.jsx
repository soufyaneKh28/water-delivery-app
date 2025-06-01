import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomText from '../common/CustomText';
const ProductCard = ({ image, title, size, price, onMenuPress }) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <View style={styles.menuButtonBg}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#888" />
        </View>
      </TouchableOpacity>
      <Image source={{uri: image}} style={styles.image} resizeMode="cover" />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <View >
          <CustomText style={styles.price}>{price} دينار</CustomText>
        </View>
        <View >
          <CustomText style={styles.size}>{size} لتر</CustomText>
        </View>
      </View>
    </View>
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
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    width: '100%',
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
  },
  menuButtonBg: {
    backgroundColor: '#F2F4F7',
    borderRadius: 8,
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
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginTop: 2,
  },
  priceContainer: {
    // backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sizeContainer: {
    // backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  price: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 15,
  },
  size: {
    color: '#666',
    fontSize: 13,
  },
});

export default ProductCard; 