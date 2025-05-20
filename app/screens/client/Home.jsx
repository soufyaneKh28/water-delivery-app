// import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Dimensions, Image, Modal, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import ProductCard from '../../components/client/ProductCard';
import CustomText from '../../components/common/CustomText';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styling/colors';
// import { useFocusEffect } from '@react-navigation/native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// import * as React from "react";
export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('New Home');
  const navigation = useNavigation();

  const defaultDataWith6Colors = [
    "#B0604D",
    "#899F9C",
    "#B3C680",
    "#5C6265",
    "#F5D399",
    "#F1F1F1",
  ];

  const progress = useSharedValue(0);
const { width } = Dimensions.get('window');

const images = [
  'https://i.ibb.co/4wxK0XKn/offer1.png',
  'https://fastly.picsum.photos/id/74/4288/2848.jpg?hmac=q02MzzHG23nkhJYRXR-_RgKTr6fpfwRgcXgE0EKvNB8',
  'https://fastly.picsum.photos/id/74/4288/2848.jpg?hmac=q02MzzHG23nkhJYRXR-_RgKTr6fpfwRgcXgE0EKvNB8',
];

  // Sample offers data - you can replace this with your actual offers data
  const offers = [
    { id: 1, image: require('../../../assets/images/offer1.png') },
    { id: 2, image: require('../../../assets/images/offer1.png') },
    { id: 3, image: require('../../../assets/images/offer1.png') },
  ];

  const categories = [
    { id: 1, title: 'مياه معدنية', image: require('../../../assets/images/category-1.png') },
    { id: 2, title: 'مياه نقية', image: require('../../../assets/images/category-1.png') },
    // { id: 3, title: 'مياه غازية', image: require('../../../assets/images/offer1.png') },
    // { id: 4, title: 'مياه فوارة', image: require('../../../assets/images/offer1.png') },
  ];

  const addresses = [
    { label: 'New Home', address: '759 Ashcraft Court San Diego\nSan Diego' },
    { label: 'Work', address: '759 Ashcraft Court San Diego\nSan Diego' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLocationButtonPress = () => {
    setAddressModalVisible(true);
  };

  const handleSelectAddress = (label) => {
    setSelectedAddress(label);
    setAddressModalVisible(false);
  };

  const handleAddLocation = () => {
    setAddressModalVisible(false);
    navigation.navigate('MapAddLocation');
  };

  return (
    <SafeAreaView style={styles.container}>
     <StatusBar style="light" backgroundColor="#1B7CC8" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        <Image source={require('../../../assets/images/home-bg.png')} style={{width: '100%', height:500 , position: 'absolute', top: -150, left: 0  , objectFit: 'cover'}} />
        <View style={styles.header}>
         <TouchableOpacity style={styles.locationButton} onPress={handleLocationButtonPress}>
            <Image source={require('../../../assets/icons/location.png')} style={{width: 24, height: 24 , objectFit: 'cover'}} />
            <View style={{flex: 1 , textAlign: 'right' , alignItems: 'flex-end'}}>
              <CustomText type="regular" style={styles.locationText}>تسليم إلى</CustomText>
              <CustomText type="bold" style={styles.locationTextMain}>{selectedAddress === 'New Home' ? '759 Ashcraft Court San Diego' : '759 Ashcraft Court San Diego'}</CustomText>
            </View>
            <Image source={require('../../../assets/icons/arrow-down.png')} style={{width: 24, height: 24 , objectFit: 'cover'}} />
         </TouchableOpacity>
        </View>

        {/* Offers Carousel */}
        <View style={styles.offersContainer}>
          {/* <CustomText type="semiBold" style={styles.offersTitle}>العروض الحالية</CustomText> */}
      
            <View
			id="carousel-component"
			dataSet={{ kind: "basic-layouts", name: "parallax" }}
		>
			<Carousel
				autoPlayInterval={2000}
				data={images}
				height={220}
				loop={true}
				pagingEnabled={true}
				snapEnabled={true}
				width={width}
				style={{
					// backgroundColor: 'red',
				}}
				mode="parallax"
				modeConfig={{
					parallaxScrollingScale: 0.9,
					parallaxScrollingOffset: 50,
				}}
				onProgressChange={progress}
        renderItem={({ item }) => (
          // <TouchableOpacity style={{width: '100%', height: '100%'}}>

          <Image source={{ uri: item }} style={[styles.image, { width: '100%', height: '100%' , objectFit: "cover" }]} />
          // </TouchableOpacity>
        )}
			/>
		</View>
          {/* </View> */}
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesContainer}>
          <CustomText type="bold" style={styles.categoriesTitle}>الفئات</CustomText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryImage}>
                  <Image source={category.image} style={{width: 37, height: 37 , borderRadius: 50}} />
                </View>  
                <CustomText type="medium" style={styles.categoryTitle}>{category.title}</CustomText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <CustomText type="bold" style={styles.productsTitle}>المنتجات</CustomText>
          <View style={styles.productsRow}>
            <ProductCard
              image={require('../../../assets/images/bottle.png')}
              title="عبوة مياه كبيرة"
              size="20 لتر"
              price={"$2"}
              onMenuPress={() => {}}
            />
            <ProductCard
              image={require('../../../assets/images/bottle.png')}
              title="عبوة مياه صغيرة"
              size="10 لتر"
              price={"$1"}
              onMenuPress={() => {}}
            />
            <ProductCard
              image={require('../../../assets/images/bottle.png')}
              title="عبوة مياه صغيرة"
              size="10 لتر"
              price={"$1"}
              onMenuPress={() => {}}
            />
          </View>
        </View>

        {/* Order Status */}
        {/* <View style={styles.orderStatusContainer}>
          <View style={styles.orderStatusItem}>
            <CustomText type="semiBold" style={styles.orderStatusText}>الطلبات المعلقة</CustomText>
          </View>
        </View> */}

      </ScrollView>

      <View >

      <Modal
        visible={addressModalVisible}
        transparent
        animationType="slide"
  
        onRequestClose={() => setAddressModalVisible(false)}
        >
        <View style={{flex:1,  position:"relative", backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
       
          <TouchableOpacity  style={{position: 'absolute', top: 20, left: 20 , width:30, height:30 ,zIndex: 1000, alignItems: 'center', justifyContent: 'center'}} onPress={() => setAddressModalVisible(false)}>
            <Ionicons name="close" size={22} color={colors.black} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            {/* <View style={{ width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, marginBottom: 8 }} /> */}
            <CustomText type="bold" style={{ fontSize: 18 }}>عنوان التوصيل</CustomText>
          </View>
          {addresses.map((item, idx) => (
            <TouchableOpacity
            key={item.label}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: selectedAddress === item.label ? '#F3F6FA' : '#fff', borderRadius: 16, padding: 16, marginBottom: 10 }}
            onPress={() => handleSelectAddress(item.label)}
            >
              <Image source={require('../../../assets/icons/edit.png')} style={{ width: 22, height: 22, marginLeft: 12 }} />
              <View style={{ flex: 1  , alignItems: 'flex-end'}}>
                <CustomText type="bold" style={{ fontSize: 16  , textAlign: 'right'}}>{item.label}</CustomText>
                <CustomText type="regular" style={{ fontSize: 13, color: '#888' , textAlign: 'right'}}>{item.address}</CustomText>
              </View>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#BFD6F6', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                {selectedAddress === item.label && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#BFD6F6' }} />}
              </View>
            </TouchableOpacity>
          ))}
          <View style={{width: '100%' , height: 1 , backgroundColor: '#E0E0E0' , marginTop: 20}}></View>
          <TouchableOpacity onPress={handleAddLocation} style={{ flexDirection: 'row-reverse', alignItems: 'center', marginTop: 20 }}>
            <CustomText type="bold" style={{ color: '#222', fontSize: 15, marginLeft: 8 }}>أضف عنواناً جديداً</CustomText>
            <CustomText style={{ fontSize: 24, color: '#222' }}>+</CustomText>
          </TouchableOpacity>
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
    paddingVertical: 7,
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
    fontSize: 18,
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
    flexDirection: 'row-reverse',
  },
  categoriesScrollContent: {
    // paddingHorizontal: 20,
    // flexDirection: 'row-reverse',
    // marginEnd: -150,
    gap: 25,
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
}); 

