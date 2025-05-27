import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
    category: 'large',
  },
  {
    id: '2',
    image: require('../../../assets/images/bottle.png'),
    title: 'عبوة مياه كبيرة',
    size: '20 لتر',
    price: '$2',
    category: 'large',
  },
  {
    id: '3',
    image: require('../../../assets/images/bottle.png'),
    title: 'عبوة مياه معبأة',
    size: '20 لتر',
    price: '$2',
    category: 'bottled',
  },
];

export default function Products() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [productActionModalVisible, setProductActionModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const productActionOverlayOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  useEffect(() => {
    if (productActionModalVisible) {
      Animated.timing(productActionOverlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(productActionOverlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [productActionModalVisible]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a network request
    setTimeout(() => {
      // Here you would typically fetch new data
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleMenuPress = (product) => {
    setSelectedProduct(product);
    setProductActionModalVisible(true);
  };

  const handleFilterChange = (filterValue) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedFilter(filterValue);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // Filter logic
  const filteredProducts = selectedFilter === 'all'
    ? mockProducts
    : mockProducts.filter(product => product.category === selectedFilter);

  return (
    <View  style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
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
              onPress={() => handleFilterChange(filter.value)}
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

      {/* Products Grid with Fade Animation */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
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
      </Animated.View>

      {/* Add Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
          <View style={styles.modalContent}>
            <CustomText type="bold" style={styles.modalTitle}>إضافة جديدة</CustomText>
            <CustomText type='regular' style={styles.modalSubtitle}>يرجى اختيار ما تريد إضافته.</CustomText>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('AddCategory');
                }}
              >
                <Ionicons name="grid-outline" size={28} color="#2196F3" />
                <CustomText style={styles.modalButtonText}>إضافة قسم</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('AddProduct');
                }}
              >
                <Ionicons name="pricetag-outline" size={28} color="#2196F3" />
                <CustomText style={styles.modalButtonText}>إضافة منتج</CustomText>
              </TouchableOpacity>
            </View>
            <Pressable onPress={() => setModalVisible(false)} style={styles.closeBar} />
          </View>
        </Animated.View>
      </Modal>

      {/* Product Action Modal */}
      <Modal
        visible={productActionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProductActionModalVisible(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: productActionOverlayOpacity }]}> 
          <View style={styles.modalContent}>
            <CustomText type="bold" style={styles.modalTitle}>إدارة المنتج</CustomText>
            <CustomText style={styles.modalSubtitle}>اختر الإجراء الذي تريد تنفيذه على هذا المنتج.</CustomText>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#F2F4F7' }]}>
                <Ionicons name="pencil-outline" size={28} color="#2196F3" />
                <CustomText style={[styles.modalButtonText, { color: '#2196F3' }]}>تعديل المنتج</CustomText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FDEAEA' }]}>
                <Ionicons name="trash-outline" size={28} color="#F44336" />
                <CustomText style={[styles.modalButtonText, { color: '#F44336' }]}>حذف المنتج</CustomText>
              </TouchableOpacity>
            </View>
            <Pressable onPress={() => setProductActionModalVisible(false)} style={styles.closeBar} />
          </View>
        </Animated.View>
      </Modal>
    </View>
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
    // fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
    // animationType:"slide"
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    // fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#888',
    marginBottom: 24,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 8,
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
  },
  modalButtonText: {
    marginTop: 8,
    color: '#222',
    // fontWeight: 'bold',
  },
  closeBar: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
  },
}); 