import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, FlatList, Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import ProductCard from '../../components/admin/ProductCard';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 15;
const CARD_PADDING = 24; // 12px padding on each side
const CARD_WIDTH = (SCREEN_WIDTH - CARD_GAP - CARD_PADDING) / 2;


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
  const [selectedType, setSelectedType] = useState('money');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [productActionModalVisible, setProductActionModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const productActionOverlayOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);


  const filters = [
    { label: 'كل المنتجات', value: 'all' },
    ...categories.map(cat => ({
      label: cat.title,
      value: cat.id,
      image_url: cat.image_url, // if you want to use images
    })),
  ];
  
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

  useEffect(() => {
    getCategories();
    getProducts();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([getCategories(), getProducts()]).finally(() => setRefreshing(false));
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

  const getCategories = async () => {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    setCategories(data);
  };

  const getProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    setProducts(data);
  };

  // Filter logic
  const filteredProducts = products.filter(product => {
    const categoryMatch = (selectedFilter === 'all' || product.category === selectedFilter);
    const typeMatch = (selectedType === 'all' || product.price_type === selectedType);
    return categoryMatch && typeMatch;
  });

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد أنك تريد حذف هذا المنتج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              // Get Bearer token from Supabase
              const { data: { session } } = await supabase.auth.getSession();
              const token = session?.access_token;
              if (!token) {
                alert('لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
                setIsDeleting(false);
                return;
              }
              await axios.delete(
                `https://water-supplier-2.onrender.com/api/k1/products/deleteProduct/${selectedProduct._id || selectedProduct.id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );
              setProductActionModalVisible(false);
              setProducts((prev) => prev.filter((p) => (p._id || p.id) !== (selectedProduct._id || selectedProduct.id)));
              setSelectedProduct(null);
              alert('تم حذف المنتج بنجاح');
            } catch (err) {
              alert('حدث خطأ أثناء حذف المنتج: ' + (err.response?.data?.message || err.message));
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
          <CustomText type='bold' style={styles.headerTitle}>المنتجات</CustomText>
        </View>
        {/* Type Filter Buttons (Top Tabs) */}
        <View style={styles.typeFilterContainer}>
           <TouchableOpacity
             style={[styles.typeFilterChip, (selectedType === 'money') && styles.typeFilterChipActive]}
             onPress={() => setSelectedType('money')}
           >
             <CustomText type='bold' style={[styles.typeFilterText, (selectedType === 'money') && styles.typeFilterTextActive]}>منتجات نقدية</CustomText>
           </TouchableOpacity>
           <TouchableOpacity
             style={[styles.typeFilterChip, (selectedType === 'coupon') && styles.typeFilterChipActive]}
             onPress={() => setSelectedType('coupon')}
           >
             <CustomText type='bold' style={[styles.typeFilterText, (selectedType === 'coupon') && styles.typeFilterTextActive]}>منتجات كوبونات</CustomText>
           </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={{ marginTop: 0, marginBottom: 8 }}>
          {/* <CustomText type='bold' style={styles.filterTitle}>أخر المنتجات</CustomText> */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexDirection: 'row', marginBottom: 10  , width: '100%'}}
            
            contentContainerStyle={styles.filtersRow}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterChip,
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
        <Animated.View style={{ opacity: fadeAnim }}>
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.productsGrid}
            columnWrapperStyle={styles.productsRow}
            renderItem={({ item }) => (
              <View style={[styles.productWrapper]}>
                <ProductCard
                  image={item.image_url}
                  title={item.title}
                  size={item.size}
                  price={item.price}
                  price_type={item.price_type}
                  onMenuPress={() => handleMenuPress(item)}
                />
              </View>
            )}
          />
        </Animated.View>
      </ScrollView>

      {/* Modals remain outside ScrollView */}
      {/* Add Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeIconButton} 
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
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
            <TouchableOpacity 
              style={styles.closeIconButton} 
              onPress={() => setProductActionModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <CustomText type="bold" style={styles.modalTitle}>إدارة المنتج</CustomText>
            <CustomText style={styles.modalSubtitle}>اختر الإجراء الذي تريد تنفيذه على هذا المنتج.</CustomText>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#F2F4F7' }]} 
                onPress={() => {
                  setProductActionModalVisible(false);
                  navigation.navigate('AddProduct', { product: selectedProduct });
                }}
                disabled={isDeleting}
              >
                <Ionicons name="pencil-outline" size={28} color="#2196F3" />
                <CustomText style={[styles.modalButtonText, { color: '#2196F3' }]}>تعديل المنتج</CustomText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#FDEAEA' }]} 
                onPress={handleDeleteProduct}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#F44336" size="small" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={28} color="#F44336" />
                    <CustomText style={[styles.modalButtonText, { color: '#F44336' }]}>حذف المنتج</CustomText>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <Pressable 
              onPress={() => setProductActionModalVisible(false)} 
              style={styles.closeBar}
              disabled={isDeleting}
            />
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
    direction: Platform.OS === 'ios' ? 'rtl' : 'ltr',
  },
  scrollView: {
    flex: 1,
  },
  headerRow: {
    flexDirection: Platform.OS === 'ios' ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
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
  typeFilterContainer: {
     flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
     justifyContent: 'center', 
     marginBottom: 12,
      paddingHorizontal: 16,
       borderBottomWidth: 1,
        borderBottomColor: '#eee' },

  typeFilterChip: { 
    paddingHorizontal: 20,
     paddingVertical: 10,
      marginHorizontal: 8,
       alignItems: 'center',
        justifyContent: 'center',
         borderBottomWidth: 2, 
         borderBottomColor: 'transparent' },

  typeFilterChipActive: { borderBottomColor: '#2196F3' },
  typeFilterText: { color: '#888', fontSize: 14 },
  typeFilterTextActive: {
    color: '#2196F3' 
  },
  filterTitle: {

    color: '#121212',
    fontSize: 20,
    textAlign: "left",
    paddingHorizontal: 16,
  },
  filtersRow: {
    paddingLeft: 16,
    paddingRight: 8,
    direction: Platform.OS === 'ios' ? 'rtl' : 'ltr',
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
    alignItems: 'center',
    // justifyContent: Platform.OS === 'ios' ? 'flex-end' : 'flex-end',   
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
    paddingBottom: 100,
    width: '100%',
  },
  productsRow: {
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
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
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeIconButton: {
    position: 'absolute',
    top: 16,
    right: Platform.OS === 'ios' ? 16 : 'auto',
    left: Platform.OS === 'ios' ? 'auto' : 16,
    padding: 4,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#888',
    marginBottom: 24,
  },
  modalButtonsRow: {
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
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