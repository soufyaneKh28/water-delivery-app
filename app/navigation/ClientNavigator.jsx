import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Image, View } from 'react-native';

// Import client screens
import CustomText from '../components/common/CustomText';
import AddLocationScreen from '../screens/client/AddLocationScreen';
import CartScreen from '../screens/client/CartScreen';
import CategoryScreen from '../screens/client/CategoryScreen';
import CheckoutScreen from '../screens/client/CheckoutScreen';
import ContactScreen from '../screens/client/ContactScreen';
import CouponsScreen from '../screens/client/CouponsScreen';
import EditProfileScreen from '../screens/client/EditProfileScreen';
import FAQScreen from '../screens/client/FAQScreen';
import HomeScreen from '../screens/client/Home';
import MapScreen from '../screens/client/MapScreen';
import MyOrdersScreen from '../screens/client/MyOrdersScreen';
import OrderDetailsScreen from '../screens/client/OrderDetailsScreen';
import ProductDetailsScreen from '../screens/client/ProductDetailsScreen';
import ProfileScreen from '../screens/client/ProfileScreen';
import ResetPasswordScreen from '../screens/client/ResetPasswordScreen';
import TermsScreen from '../screens/client/TermsScreen';
import { colors } from '../styling/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export function ClientTabs() {
  return (
    <Tab.Navigator initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center' , height: 20 }}>
              <Image
                source={focused ? require('../../assets/icons/home_active.png') : require('../../assets/icons/home_inactive.png')}
                style={{ width: 24, height: 24, resizeMode: 'contain' }}
              />
              <CustomText type='bold' style={{ fontSize: 12, width: '100%', textAlign: 'center',  color: focused ? '#2196F3' : '#9DB2CE', marginTop: 2 }}>
              الرئيسية
              </CustomText>
            </View>
            );
          } else if (route.name === 'Profile') {
            const iconName = focused ? 'person' : 'person-outline';
            return(
              <View style={{ alignItems: 'center', justifyContent: 'center' , height: 20 }}>
              <Image
                source={focused ? require('../../assets/icons/profile_active.png') : require('../../assets/icons/profile_inactive.png')}
                style={{ width: 24, height: 24, resizeMode: 'contain' }}
              />
              <CustomText type='bold' style={{ fontSize: 12, width: '100%', textAlign: 'center',  color: focused ? '#2196F3' : '#9DB2CE', marginTop: 2 }}>
                حسابي
              </CustomText>
            </View>
            );
          } else if (route.name === 'Cart') {
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center' , height: 20 }}>
              <Image
                source={focused ? require('../../assets/icons/cart_active.png') : require('../../assets/icons/cart_inactive.png')}
                style={{ width: 24, height: 24, resizeMode: 'contain' }}
              />
              <CustomText type='bold' style={{ fontSize: 12, width: '100%', textAlign: 'center',  color: focused ? '#2196F3' : '#9DB2CE', marginTop: 2 }}>
              السلة
              </CustomText>
            </View>
            );
          } else if (route.name === 'Coupons') {
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center' , height: 20 }}>
              <Image
                source={focused ? require('../../assets/icons/coupons_active.png') : require('../../assets/icons/coupons_inactive.png')}
                style={{ width: 24, height: 24, resizeMode: 'contain' }}
              />
              <CustomText type='bold' style={{ fontSize: 12, width: '100%', textAlign: 'center',  color: focused ? '#2196F3' : '#9DB2CE', marginTop: 2 }}>
              كوبونات
              </CustomText>
            </View>
            )
          }
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        headerShown: false,
        
        tabBarStyle: {
          elevation: 0,
          shadowOpacity: 0,
          // borderTopWidth: 1,
          // borderTopColor: colors.gray[200],
          height: 90,
          // paddingBottom: 20,
          paddingTop: 18,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'الملف الشخصي',
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          title: 'السلة',
        }}
      />
      <Tab.Screen 
        name="Coupons" 
        component={CouponsScreen}
        options={{
          title: 'كوبونات',
        }}
      />
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'الرئيسية',
        }}
      />
    </Tab.Navigator>
  );
}

export default function ClientNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        // animation: 'slide_from_right',
        // animation:"slide_from_left",
        // animationDuration: 100,
        animation:"ios_from_left",

        // cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        // gestureDirection: 'horizontal-inverted'
      }}
    >
      <Stack.Screen 
        name="ClientTabs" 
        component={ClientTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
       <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClientFAQ"
        component={FAQScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddLocation"
        component={AddLocationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Category"
        component={CategoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MapAddLocation"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyOrders"
        component={MyOrdersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
} 