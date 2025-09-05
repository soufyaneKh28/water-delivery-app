import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Image, View } from 'react-native';
import CustomText from '../components/common/CustomText';
import CartScreen from '../screens/client/CartScreen';
import ContactScreen from '../screens/client/ContactScreen';
import FAQScreen from '../screens/client/FAQScreen';
import GuestCategoryScreen from '../screens/guest/GuestCategoryScreen';
import GuestCouponsScreen from '../screens/guest/GuestCouponsScreen';
import GuestHomeScreen from '../screens/guest/GuestHome';
import GuestProductDetails from '../screens/guest/GuestProductDetails';
import GuestProfileScreen from '../screens/guest/GuestProfileScreen';
import { colors } from '../styling/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function GuestTabs() {
  return (
    <Tab.Navigator initialRouteName="Home"
    
      screenOptions={({ route }) => ({

        tabBarShowLabel: false,
        
        tabBarIcon: ({ focused }) => {
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
          height: 90,
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
        component={GuestProfileScreen}
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
        component={GuestCouponsScreen}
        options={{
          title: 'كوبونات',
        }}
      />
      <Tab.Screen 
        name="Home" 
        component={GuestHomeScreen}
        options={{
          title: 'الرئيسية',
        }}
      />
    </Tab.Navigator>
  );
}

const GuestNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false , animation:"ios_from_left"}}>
      <Stack.Screen name="GuestTabs" component={GuestTabs} />
      <Stack.Screen name="GuestProductDetails" component={GuestProductDetails} />
      <Stack.Screen name="GuestCategory" component={GuestCategoryScreen} />
      <Stack.Screen name="GuestFAQ" component={FAQScreen} />
      <Stack.Screen name="GuestContact" component={ContactScreen} />
    </Stack.Navigator>
  );
};

export default GuestNavigator