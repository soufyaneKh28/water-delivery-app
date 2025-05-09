import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/admin/ProductCard';

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
        <Text style={styles.headerTitle}>المنتجات</Text>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[styles.filterChip, selectedFilter === filter.value && styles.filterChipActive]}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Text style={[styles.filterText, selectedFilter === filter.value && styles.filterTextActive]}>{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
          <View style={{ flex: 1 }}>
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
    backgroundColor: '#f5f5f5',
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
  filtersRow: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#F2F4F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginLeft: 8,
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
    fontWeight: 'bold',
  },
  productsGrid: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  productsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
}); 