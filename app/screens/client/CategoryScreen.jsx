import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import ProductCard from '../../components/client/ProductCard';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

const CategoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryProducts();
  }, [category]);

  const fetchCategoryProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <CustomText style={styles.loadingText}>جاري تحميل المنتجات...</CustomText>
        </View>
      );
    }

    if (products.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="cube-outline" size={64} color={colors.textDisabled} />
          <CustomText type="bold" style={styles.emptyTitle}>لا توجد منتجات</CustomText>
          <CustomText style={styles.emptyText}>
            لم يتم العثور على منتجات في هذه الفئة بعد
          </CustomText>
        </View>
      );
    }

    return (
      <View style={styles.productsGrid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            image={product.image_url ? { uri: product.image_url } : require('../../../assets/images/bottle.png')}
            title={product.title}
            size={product.size}
            description={product.description}
            price={`${product.price} د.أ`}
            oldPrice={product.old_price ? `${product.old_price} د.أ` : undefined}
            onMenuPress={() => {}}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomText type="bold" style={styles.title}>{category.title}</CustomText>
        <BackBtn />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderContent()}
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
    flexGrow: 1,
  },
  productsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 16,
  },
  emptyTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default CategoryScreen; 