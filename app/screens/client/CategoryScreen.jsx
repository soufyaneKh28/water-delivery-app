import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ProductCard from '../../components/client/ProductCard';
import BackButton from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

const CategoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params;

  // Sample products data - replace with your actual data
  const products = [
    {
      id: 1,
      image: require('../../../assets/images/bottle.png'),
      title: "عبوة مياه كبيرة",
      size: "20 لتر",
      price: "$2"
    },
    {
      id: 2,
      image: require('../../../assets/images/bottle.png'),
      title: "عبوة مياه صغيرة",
      size: "10 لتر",
      price: "$1"
    },
    {
      id: 3,
      image: require('../../../assets/images/bottle.png'),
      title: "عبوة مياه متوسطة",
      size: "15 لتر",
      price: "$1.5"
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomText type="bold" style={styles.title}>{category.title}</CustomText>
      
         <BackButton />
       
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.productsGrid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              image={product.image}
              title={product.title}
              size={product.size}
              price={product.price}
              onMenuPress={() => {}}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    color: colors.black,
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
});

export default CategoryScreen; 