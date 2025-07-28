// import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, Platform, RefreshControl, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import Toast from 'react-native-toast-message';
import EmptyCartImage from '../../../assets/images/empty-cart.png';
import { supabase } from '../../../lib/supabase';
import ProductCard from '../../components/client/ProductCard';
import CustomText from '../../components/common/CustomText';
import { useAddress } from '../../context/AddressContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styling/colors';
import { api } from '../../utils/api';
// import { useFocusEffect } from '@react-navigation/native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
// import * as React from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  console.log('Notification sent successfully');
  console.log("message", message);
  console.log("expoPushToken", expoPushToken);
}

function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log("pushTokenStringggggg", pushTokenString);
      AsyncStorage.setItem('expo_push_token', pushTokenString);
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const { selectedAddress, setSelectedAddress } = useAddress();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(
    undefined
  );

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error) => setExpoPushToken(`${error}`));

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);
  

  const progress = useSharedValue(0);
const { width } = Dimensions.get('window');



  const statusColors = {
    new: '#FFD700', // Gold for pending
    processing: '#EEEEEE',
    'on-the-way': '#87CEEB', // Sky blue for on-the-way
    delivered: '#9DFA9F',
    cancelled: '#F44336',
  };

  const statusLabels = {
    new: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    'on-the-way': 'في الطريق',
    delivered: 'تم التوصيل',
    cancelled: 'تم الالغاء',
  };



  // useEffect(() => {
  //   setIsAuthenticated(false);
  // }, []);

  const handleLocationButtonPress = () => {
    if ( savedAddresses?.length > 0) {
      setModalKey(prev => prev + 1); // Force modal re-render
      setAddressModalVisible(true);
    } else {
      navigation.navigate('MapAddLocation');
    }
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setAddressModalVisible(false);
  };

  const handleAddLocation = () => {
    setAddressModalVisible(false);
    navigation.navigate('MapAddLocation');
  };

  const handleEditLocation = (address) => {
    console.log('Edit Address Data:', address);
    setAddressModalVisible(false);
    navigation.navigate('AddLocation', { editAddress: address });
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('Category', { category });
  };

  // const getCategories = async () => {
  //   setIsLoadingCategories(true);
  //   try {
  //     const { data, error } = await supabase
  //       .from('product_categories')
  //       .select('*')
  //       .order('created_at', { ascending: false });

  //     if (error) {
  //       console.error('Error fetching categories:', error);
  //       return;
  //     }
  //     setCategories(data);
  //   } finally {
  //     setIsLoadingCategories(false);
  //   }
  // };

  // const getProducts = async () => {
  //   setIsLoadingProducts(true);
  //   try {
  //     const { data, error } = await supabase
  //       .from('products')
  //       .select('*')
  //       .neq('price_type', 'coupon')
  //       .order('created_at', { ascending: false });
  //     if (error) {
  //       console.error('Error fetching products:', error);
  //       return;
  //     }
  //     // Only show products with price_type 'money'
  //     setProducts((data || []).filter(product => product.price_type === 'money'));
  //   } finally {
  //     setIsLoadingProducts(false);
  //   }
  // };

  const getLocations = async () => {
    setIsLoadingLocations(true);
    setErrorMessage('');
    try {
      const data = await api.getLocations();
      const addresses = data.data || [];
      setSavedAddresses(addresses);
      if (addresses.length > 0 && !selectedAddress) {
        setSelectedAddress(addresses[0]);
      }
      setIsOffline(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setErrorMessage('فشل في تحميل العناوين. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
      setIsOffline(true);
      setSavedAddresses([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // const getOffers = async () => {
  //   setIsLoadingOffers(true);
  //   try {
  //     const data = await api.getOffers();
  //     setOffers(data.data || []);
  //   } catch (error) {
  //     console.error('Error fetching offers:', error);
  //     setOffers([]);
  //   } finally {
  //     setIsLoadingOffers(false);
  //   }
  // };

  const getOffers = async () => {
    setIsLoadingOffers(true);
    try {
      const data = await api.getOffers();
      setOffers(data.data || []);
      setIsOffline(false);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setOffers([]);
    } finally {
      setIsLoadingOffers(false);
    }
  };

  const getCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const data = await api.getCategories();
      setCategories(data.data || []);
      setIsOffline(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const getProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const data = await api.getProducts();
      // Only show products with price_type 'money'
      setProducts((data.data || []).filter(product => product.price_type === 'money'));
      setIsOffline(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Optimized single API call for all data
  // const getAll = async () => {
  //   if (!user) return;
  //   setIsLoadingOffers(true);
  //   setIsLoadingLocations(true);
  //   setIsLoadingCategories(true);
  //   setIsLoadingProducts(true);
  //   setErrorMessage('');
  //   
  //   try {
  //     const data = await api.getAllData();
  //     setOffers(data.data.offers || []);
  //     setSavedAddresses(data.data.locations);
  //     if (data.data.locations.length > 0 && !selectedAddress) {
  //       setSelectedAddress(data.data.locations[0]);
  //     }
  //     setCategories(data.data.categories);
  //     setProducts(data.data.products);
  //     setIsOffline(false);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     setErrorMessage('فشل في تحميل البيانات. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
  //     setIsOffline(true);
  //     setOffers([]);
  //     setSavedAddresses([]);
  //     setCategories([]);
  //     setProducts([]);
  //   } finally {
  //     setIsLoadingOffers(false);
  //     setIsLoadingLocations(false);
  //     setIsLoadingCategories(false);
  //     setIsLoadingProducts(false);
  //   }
  // };

  // Fallback function using the original getAllData approach
  // Use this if parallel calls cause issues
  // const getAllSequential = async () => {
  //   setIsLoadingOffers(true);
  //   try {
  //     const data = await api.getAllData();
  //     setOffers(data.data.offers || []);
  //     setSavedAddresses(data.data.locations);
  //     if (data.data.locations.length > 0 && !selectedAddress) {
  //       setSelectedAddress(data.data.locations[0]);
  //     }
  //     setCategories(data.data.categories);
  //     setProducts(data.data.products);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     setOffers([]);
  //   } finally {
  //     setIsLoadingOffers(false);
  //     setIsLoadingLocations(false);
  //     setIsLoadingCategories(false);
  //     setIsLoadingProducts(false);
  //   }
  // };

  const fetchActiveOrders = async () => {
    if (!user?.id) return;
    
    setIsLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              title,
              image_url,
              price
            )
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['new', 'processing', 'on-the-way'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active orders:', error);
        return;
      }

      setActiveOrders(data || []);
    } catch (error) {
      console.error('Error in fetchActiveOrders:', error);
      setActiveOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };
  // console.log(activeOrders);
  

  const onRefresh = React.useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    setErrorMessage('');
    try {
      // Refresh all data in parallel - much better approach!
      await Promise.allSettled([
        getOffers(),
        getLocations(),
        getCategories(),
        getProducts(),
        fetchActiveOrders()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setErrorMessage('فشل في تحديث البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    // Load each section independently
    getOffers();
    getLocations();
    getCategories();
    getProducts();
    fetchActiveOrders();
  }, [user?.id]);

  // Reset modal state when it closes
  useEffect(() => {
    if (!addressModalVisible) {
      // Small delay to ensure modal is fully closed before resetting
      const timer = setTimeout(() => {
        setModalKey(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [addressModalVisible]);

  // console.log("savedAddresses", savedAddresses);

  const formatAddressString = (address) => {
    const parts = [
      address.label,
      address.city,
      address.address,
      `مبنى ${address.building_no}`,
      `طابق ${address.floor_no}`,
      address.description
    ].filter(Boolean); // Remove any undefined/null values
    
    return parts.join('، ');
  };

  const renderLocationButton = () => {
    if (isOffline) {
      return (
        <TouchableOpacity 
          style={[styles.locationButton, styles.offlineButton]} 
          onPress={() => onRefresh()}
        >
          <View style={styles.offlineContent}>
            <Ionicons name="wifi-outline" size={24} color="#FF6B6B" />
            <CustomText type="bold" style={styles.offlineText}>لا يوجد اتصال بالإنترنت</CustomText>
            <CustomText type="regular" style={styles.offlineSubtext}>اضغط للتحديث</CustomText>
          </View>
        </TouchableOpacity>
      );
    }

    if (savedAddresses?.length == 0 || !selectedAddress) {
      return (
        <TouchableOpacity 
          style={[styles.locationButton, styles.addLocationButton]} 
          onPress={() => navigation.navigate('MapAddLocation')}
        >
          <View style={styles.addLocationContent}>
            <Image source={require('../../../assets/icons/location.png')} style={{width: 24, height: 24, objectFit: 'cover'}} />
            <CustomText type="bold" style={styles.addLocationText}>أضف عنوان التوصيل</CustomText>
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.locationButton} onPress={handleLocationButtonPress}>
        <Image source={require('../../../assets/icons/location.png')} style={{width: 24, height: 24, objectFit: 'cover'}} />
        <View style={{flex: 1, textAlign: 'right', alignItems: 'flex-end'}}>
          <CustomText type="regular" style={styles.locationText}>تسليم إلى</CustomText>
          <CustomText type="bold" style={styles.locationTextMain} numberOfLines={1} ellipsizeMode="tail">
            {selectedAddress ? formatAddressString(selectedAddress) : 'اختر عنوان التوصيل'}
          </CustomText>
        </View>
        <Image source={require('../../../assets/icons/arrow-down.png')} style={{width: 24, height: 24, objectFit: 'cover'}} />
      </TouchableOpacity>
    );
  };

  // console.log("products", products);
  return (
    <SafeAreaView style={styles.container}>
     <StatusBar style="dark" backgroundColor="#1B7CC8" />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 50 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]} // Android
            tintColor={colors.primary} // iOS
            title="جاري التحديث..." // iOS
            titleColor={colors.primary} // iOS
          />
        }
      >
        <Image source={require('../../../assets/images/home-bg.png')} style={{width: '100%', height:500 , position: 'absolute', top: -150, left: 0  , objectFit: 'cover'}} />
        <View style={styles.header}>
          {isLoadingLocations ? (
            <View style={[styles.locationButton, styles.loadingContainer]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            renderLocationButton()
          )}
          

        </View>
        {/* <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
      <Text>Your Expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          await sendPushNotification(expoPushToken);
        }}
      />
    </View> */}
        {/* Error Message */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <CustomText style={styles.errorText}>{errorMessage}</CustomText>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <CustomText style={styles.retryButtonText}>إعادة المحاولة</CustomText>
            </TouchableOpacity>
          </View>
        )}

        {/* Offers Carousel */}
        <View style={styles.offersContainer}>
          {isLoadingOffers ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : offers.length > 0 ? (
            <View
              id="carousel-component"
              dataSet={{ kind: "basic-layouts", name: "parallax" }}
            >
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
                    style={[styles.image, { width: '100%', height: '100%', objectFit: "cover" }]} 
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

        {/* Active Orders Section */}
        {activeOrders.length > 0 && (
          <View style={styles.activeOrderCardContainer}>
            <View style={styles.activeOrderCardSingle}>
              <TouchableOpacity
                style={styles.arrowIconContainer}
                onPress={() => navigation.navigate('OrderDetails', { order: activeOrders[0] })}
              >
                <Ionicons name="chevron-back" size={24} color={colors.secondary} />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <CustomText type="bold" style={styles.activeOrderTitle} numberOfLines={1} ellipsizeMode="tail">
                  { activeOrders[0].order_items.length > 0 ? (activeOrders[0].order_items && activeOrders[0].order_items.length > 0
                    ? activeOrders[0].order_items
                        .map(item => item.product?.title || 'منتج غير معروف')
                        .join('، ')
                    : 'طلب بدون منتجات') : (
                      activeOrders[0].title
                    )}
                </CustomText>
                <CustomText style={styles.activeOrderDate}>
                  تم الطلب بتاريخ: {dayjs(activeOrders[0].created_at).format('D MMMM YYYY - HH:mm')}
                </CustomText>
                <View style={[styles.statusBadgeHome, { backgroundColor: statusColors[activeOrders[0].status] || '#E0E0E0' }]}> 
                  <CustomText style={styles.statusTextHome}>
                    {statusLabels[activeOrders[0].status] || 'غير معروف'}
                  </CustomText>
                </View>
              </View>
            </View>
          </View>
        )}

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
        <View style={styles.productsSection}>
          <CustomText type="bold" style={styles.productsTitle}>المنتجات</CustomText>
          {isLoadingProducts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyProductsContainer}>
              <Image source={EmptyCartImage} style={styles.emptyProductsImage} resizeMode="contain" />
              <CustomText type="bold" style={styles.emptyProductsText}>لا توجد منتجات متاحة حالياً</CustomText>
            </View>
          ) : (
            <View style={styles.productsRow}>
              {products.filter((product)=> product.price_type === 'money').map((product) => (
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
          )}
        </View>

        {/* Order Status */}
        {/* <View style={styles.orderStatusContainer}>
          <View style={styles.orderStatusItem}>
            <CustomText type="semiBold" style={styles.orderStatusText}>الطلبات المعلقة</CustomText>
          </View>
        </View> */}

      </ScrollView>

      <View style={{}}>

      <Modal
        key={modalKey}
        visible={addressModalVisible}
        transparent
        style={{flex: 1}}
        animationType="slide"
        onRequestClose={() => setAddressModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setAddressModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={colors.black} />
              </TouchableOpacity>
              <CustomText type="bold" style={styles.modalTitle}>عنوان التوصيل</CustomText>
            </View>
            
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {savedAddresses && savedAddresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  style={[
                    styles.addressItem,
                    selectedAddress?.id === address.id && styles.selectedAddressItem
                  ]}
                  onPress={() => handleSelectAddress(address)}
                >
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditLocation(address)}
                  >
                    <Image source={require('../../../assets/icons/edit.png')} style={styles.editIcon} />
                  </TouchableOpacity>
                  <View style={styles.addressContent}>
                    <CustomText type="bold" style={styles.addressLabel}>{address.label}</CustomText>
                    <CustomText type="regular" style={styles.addressText} numberOfLines={2} ellipsizeMode="tail">
                      {formatAddressString(address)}
                    </CustomText>
                  </View>
                  <View style={styles.radioButton}>
                    {selectedAddress?.id === address.id && <View style={styles.radioButtonSelected} />}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <View style={styles.divider} />
              <TouchableOpacity onPress={handleAddLocation} style={styles.addLocationButton}>
                <CustomText type="bold" style={styles.addLocationText}>أضف عنواناً جديداً</CustomText>
                <CustomText style={styles.addLocationIcon}>+</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
          </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  _container: {
    flex: 1,
    // flexDirectionro
    backgroundColor: colors.white,
    
  },
  get container() {
    return this._container;
  },
  set container(value) {
    this._container = value;
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.white,
    // paddingBottom: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 20,

  },
  locationButton: {
    width: "100%",
    // height: 40,
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  locationText: {
    fontSize: 13,
    color: "#9DB2CE",
  },
  locationTextMain: {
    fontSize: 16,
    width: '100%',
    color: colors.secondary,
  },
  headerContent: {
    flex: 1,
  },
  image: {
    borderRadius: 10,
    resizeMode: 'cover',
    // objectFit: 'cover',
  },
  welcomeText: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  logoutButton: {
    padding: 8,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: colors.primary,
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
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  orderTitle: {
    fontSize: 16,
  },
  orderStatus: {
    color: '#4CAF50',
    marginTop: 5,
  },
  orderDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  productsScroll: {
    marginHorizontal: -20,
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    width: 150,
  },
  productTitle: {
    fontSize: 16,
  },
  productPrice: {
    color: colors.primary,
    fontSize: 14,
    marginTop: 5,
  },
  offersContainer: {
    // paddingHorizontal: 50,
    // marginTop: 20,
    // flexDirection: 'row-reverse',
  },
  offersTitle: {
    fontSize: 18,
    // marginBottom: 15,
    textAlign: 'right',
    marginHorizontal: 20,
    color: colors.secondary,
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


    direction: 'rtl',
    //  flexDirection: 'row-reverse',
// paddingHorizontal: 20,
    width: '100%',
  },
  categoriesScrollContent: {
    // paddingHorizontal: 20,
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
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
  productsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    justifyContent: 'center',
  },
  productsTitle: {
    fontSize: 20,
    color: colors.black,
    marginBottom: 15,
    textAlign: 'right',
  },
  productsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gridRowGap:20,
    rowGap:15,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  addLocationButton: {
    backgroundColor: colors.primaryLight,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
    padding: 20,
  },
  activeOrderCardContainer: {
  
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  activeOrderCardSingle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 6,
    // elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  arrowIconContainer: {
    marginLeft: 10,
    backgroundColor: '#F5F6FA',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeOrderTitle: {
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: 2,
    textAlign: 'right',
  },
  activeOrderDate: {
    fontSize: 13,
    color: '#8A8A8A',
    marginBottom: 7,
    textAlign: 'right',
  },
  statusBadgeHome: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 22,
    borderRadius: 8,
    marginTop: 2,
  },
  statusTextHome: {
    fontSize: 15,
    color: '#3578E6',
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyProductsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyProductsImage: {
    width: 120,
    height: 120,
    marginBottom: 18,
  },
  emptyProductsText: {
    fontSize: 17,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyOffersContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  emptyOffersText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
  },
  offlineButton: {
    backgroundColor: '#F5F6FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  offlineText: {
    fontSize: 16,
    color: '#FF6B6B',
  },
  offlineSubtext: {
    fontSize: 13,
    color: '#999',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // flex: 1,
    height: '85%',
    // position: 'relative',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  modalScrollView: {
    flex: 1,
    maxHeight: '50%',
  },
  modalScrollContent: {
    paddingBottom: 10,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 5,
  },
  selectedAddressItem: {
    backgroundColor: '#F3F6FA',
  },
  editButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    width: 22,
    height: 22,
  },
  addressContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  addressLabel: {
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'right',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#BFD6F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#BFD6F6',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
    marginTop: 20,
  },
  addLocationButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  addLocationText: {
    color: '#222',
    fontSize: 15,
    marginLeft: 8,
  },
  addLocationIcon: {
    fontSize: 24,
    color: '#222',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
    position: 'relative',
    zIndex: 1,
  },

}); 

const showAddProductToast = () => {
  Toast.show({
    type: 'success',
    text1: 'تمت الإضافة',
    text2: 'تمت إضافة المنتج إلى السلة بنجاح!',
    position: 'bottom',
    visibilityTime: 2500,
  });
};

