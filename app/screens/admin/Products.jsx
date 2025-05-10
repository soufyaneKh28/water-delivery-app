import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Dimensions, FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/admin/ProductCard';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 15;
const CARD_PADDING = 24; // 12px padding on each side
const CARD_WIDTH = (SCREEN_WIDTH - CARD_GAP - CARD_PADDING) / 2;

const filters = [
  { label: 'كل المنتجات', value: 'all' },
  { label: 'عبوات كبيرة', value: 'large' },
  { label: 'مياه معبأة', value: 'bottled' },
];

const mockProducts = [
  {
    id: '1',
    image: require('../../../assets/images/bottle.png'), // Replace with your image path
    title: 'عبوة مياه كبيرة',
    size: '20 لتر',
    price: '$2',
  },
  {
    id: '2',
    image: require('../../../assets/images/bottle.png'),
    title: 'عبوة مياه كبيرة',
    size: '20 لتر',
    price: '$2',
  },
  {
    id: '3',
    image: require('../../../assets/images/bottle.png'),
    title: 'عبوة مياه كبيرة',
    size: '20 لتر',
    price: '$2',
  },
];

export default function Products() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a network request
    setTimeout(() => {
      // Here you would typically fetch new data
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleMenuPress = (product) => {
    Alert.alert(
      product.title,
      'اختر إجراء',
      [
        { text: 'تعديل', onPress: () => Alert.alert('تعديل المنتج') },
        { text: 'حذف', onPress: () => Alert.alert('حذف المنتج'), style: 'destructive' },
        { text: 'إلغاء', style: 'cancel' },
      ]
    );
  };

  // Filter logic (mock, all products for now)
  const filteredProducts = mockProducts;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
        <CustomText type='bold' style={styles.headerTitle}>المنتجات</CustomText>
      </View>

      {/* Filters */}
      <View style={{ marginTop: 10, marginBottom: 8 }}>
        <CustomText type='bold' style={styles.filterTitle}>أخر المنتجات</CustomText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filtersRow, { minWidth: '100%' }]}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                { width: "auto" },
                selectedFilter === filter.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.value)}
              activeOpacity={0.7}
            >
              <CustomText type='bold' style={[
                styles.filterText,
                { fontSize: 14 },
                selectedFilter === filter.value && styles.filterTextActive,
              ]}>
                {filter.label}
              </CustomText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsGrid}
        columnWrapperStyle={styles.productsRow}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']} // Android
            tintColor="#2196F3" // iOS
          />
        }
        renderItem={({ item }) => (
          <View style={[styles.productWrapper]}>
            <ProductCard
              image={item.image}
              title={item.title}
              size={item.size}
              price={item.price}
              onMenuPress={() => handleMenuPress(item)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    direction: 'rtl',
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTitle: {
    color: '#121212',
    fontSize: 20,
    // textAlign: "left",
    paddingHorizontal: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  filterChip: {
    backgroundColor: '#F2F4F7',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    color: '#888',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
  },
  productsGrid: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    width: '100%',
  },
  productsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    width: '100%',
  },
  productWrapper: {
    width: CARD_WIDTH,
    marginBottom: 15,
  },
}); 