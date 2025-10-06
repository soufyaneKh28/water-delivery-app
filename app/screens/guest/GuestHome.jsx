import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/client/ProductCard';
import AuthPromptModal from '../../components/common/AuthPromptModal';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';
import { API_BASE_URL } from '../../utils/api';

const { width } = Dimensions.get('window');


export default function GuestHome() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  const progress = useSharedValue(0);


//   useEffect(() => {
//     loadDemoData();
//   }, []);

  // Demo data for guest users

  // Load demo data for guest users


  const getAll = async () => {
    setIsLoadingOffers(true);
    setIsLoadingCategories(true);
    setIsLoadingProducts(true);
    try {   
    const data = await fetch(`${API_BASE_URL}/users/guest`);
    const dataJson = await data.json();
    console.log(dataJson.data);
    setOffers(dataJson.data.offers);
    setCategories(dataJson.data.categories);
    setProducts(dataJson.data.products);
    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
  finally {
    setIsLoadingOffers(false);
    setIsLoadingCategories(false);
    setIsLoadingProducts(false);
  }

  
  };

  useEffect(() => {
    getAll();
    // loadDemoData();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    getAll();
    setRefreshing(false);
  }, []);

  const handleCategoryPress = (category) => {
    // Navigate to category screen for guest users
    navigation.navigate('GuestCategory', { category });
  };

  const handleProductPress = (product) => {
    // Navigate to product details for guest users
    navigation.navigate('GuestProductDetails', { product });
  };

  const handleAddLocationPress = () => {
    setAuthModalVisible(true);
  };

  // Adding to cart is allowed for guests via ProductCard default handler

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 50 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="جاري التحديث..."
            titleColor={colors.primary}
          />
        }
      >
        <Image source={require('../../../assets/images/home-bg.png')} style={styles.backgroundImage} />
        
        {/* Add Location Button (above offers) */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.addLocationButton]}
            onPress={handleAddLocationPress}
          >
            <View style={styles.addLocationContent}>
              <Image source={require('../../../assets/icons/location.png')} style={{width: 24, height: 24, objectFit: 'cover'}} />
              <CustomText type="bold" style={styles.addLocationText}>أضف عنوان التوصيل</CustomText>
            </View>
          </TouchableOpacity>
        </View>



        {/* Offers Carousel */}
        <View style={styles.offersContainer}>
          {isLoadingOffers ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : offers.length > 0 ? (
            <View>
              <Carousel
                autoPlayInterval={3000}
                data={offers}
                height={220}
                loop={true}
                autoPlay={true}
                pagingEnabled={true}
                snapEnabled={true}
                width={width}
                style={{}}
                mode="parallax"
                modeConfig={{
                  parallaxScrollingScale: 0.9,
                  parallaxScrollingOffset: 50,
                }}
                onProgressChange={progress}
                renderItem={({ item }) => (
                  <Image 
                    source={{ uri: item.image_url }} 
                    style={styles.offerImage} 
                  />
                )}
              />
            </View>
          ) : (
            <View style={styles.emptyOffersContainer}>
              <CustomText type="regular" style={styles.emptyOffersText}>لا توجد عروض متاحة حالياً</CustomText>
            </View>
          )}
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesContainer}>
          <CustomText type="bold" style={styles.categoriesTitle}>الفئات</CustomText>
          {isLoadingCategories ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScrollContent}
              style={[styles.categoriesScroll, categories.length > 3 ? {flexDirection: 'row'} : {flexDirection: 'row-reverse'}]}
            >
              {categories.map((category) => (
                <TouchableOpacity 
                  key={category.id} 
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category)}
                >
                  <View style={styles.categoryImage}>
                    <Image source={{uri : category.image_url}} style={{width: 37, height: 37 , borderRadius: 50}} />
                  </View>  
                  <CustomText type="medium" style={styles.categoryTitle}>{category.title}</CustomText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Products Section */}
        <View style={styles.section}>
          <CustomText type="bold" style={styles.sectionTitle}>المنتجات</CustomText>
          {isLoadingProducts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {products.filter((p) => p.price_type === 'money').map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.title}
                  size={product.size}
                  price={`${product.price} د.أ`}
                  oldPrice={product.old_price ? `${product.old_price} د.أ` : undefined}
                  description={product.description}
                  id={product.id}
                  image={product.image_url ? { uri: product.image_url } : require('../../../assets/images/bottle.png')}
                  onPress={() => handleProductPress(product)}
                  
                //   isGuest={true}
                />
              ))}
            </View>
          )}
        </View>

        {/* Guest Message */}
        <View style={styles.guestMessageContainer}>
          <CustomText type="bold" style={styles.guestMessageTitle}>
            استمتع بتصفح المنتجات
          </CustomText>
          <CustomText style={styles.guestMessageText}>
            يمكنك تصفح جميع المنتجات والعروض. سجل دخولك للوصول إلى المزيد من الميزات مثل إضافة المنتجات إلى السلة وتتبع الطلبات.
          </CustomText>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => setAuthModalVisible(true)}
          >
            <CustomText type="bold" style={styles.ctaButtonText}>
              إنشاء حساب الآن
            </CustomText>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AuthPromptModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.white,
  },
  backgroundImage: {
    width: '100%',
    height: 500,
    position: 'absolute',
    top: -150,
    left: 0,
    objectFit: 'cover',
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  locationPlaceholderText: {
    fontSize: 13,
    color: colors.gray[500],
  },
  addLocationButton: {
    backgroundColor: colors.primaryLight,
    width: '100%',
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addLocationContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addLocationText: {
    color: colors.primary,
    fontSize: 16,
  },
  offersContainer: {
    marginTop: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 10,
  },
  emptyOffersContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyOffersText: {
    color: colors.gray[500],
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.black,
    marginBottom: 15,
    textAlign: 'right',
  },
  categoriesContainer: {
    // marginTop: 10,

    paddingHorizontal: 20,
  },
  categoriesTitle: {
    fontSize: 20,
    // marginBottom: 15,
    textAlign: 'right',
    // marginHorizontal: 20,
    color: colors.black,
  },
  categoriesScroll: {
    // marginHorizontal: -20, 


    direction: '',
    //  flexDirection: 'row-reverse',
// paddingHorizontal: 20,
    width: '100%',
  },
  categoriesScrollContent: {
    // paddingHorizontal: 20,
    // flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
    // justifyContent: 'flex-start',
    // alignItems: 'flex-end',
    direction: 'rtl',
    // marginEnd: -150,
    gap: 20,
    // width: '100%',
    // paddingHorizontal: 20,
  },
  categoryCard: {
    // width: 120,
    alignItems: 'center',
    // backgroundColor: colors.white,
    borderRadius: 12,

  },
  categoryImage: {
    width: 69,
    height: 69,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: colors.primaryLight,
  },
  categoryTitle: {
    fontSize: 14,
    color: colors.secondary,
    textAlign: 'center',
  },

  productsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  guestMessageContainer: {
    backgroundColor: colors.primary,
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  guestMessageTitle: {
    color: colors.white,
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  guestMessageText: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
