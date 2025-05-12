import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { I18nManager, Image, View } from 'react-native';
import CustomText from '../components/common/CustomText';

// Import admin screens
import AddProduct from '../screens/admin/AddProduct';
import AdminDashboard from '../screens/admin/Dashboard';
import Orders from '../screens/admin/Orders';
import Products from '../screens/admin/Products';
import Profile from '../screens/admin/Profile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'الرئيسية') {
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center' , height: 20 }}>
                <Image
                  source={focused ? require('../../assets/icons/home_active.png') : require('../../assets/icons/home_inactive.png')}
                  style={{ width: size, height: size, resizeMode: 'contain' }}
                />
                <CustomText type='bold' style={{ fontSize: 12, width: '100%', textAlign: 'center', color: focused ? '#2196F3' : '#9DB2CE', marginTop: 2 }}>
                  الرئيسية
                </CustomText>
              </View>
            );
          } else if (route.name === 'الطلبات') {
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center' , height: 20    }}>
                <Image
                  source={focused ? require('../../assets/icons/cart_active.png') : require('../../assets/icons/cart_inactive.png')}
                  style={{ width: size, height: size, resizeMode: 'contain' }}
                />
                <CustomText type='bold' style={{ fontSize: 12, width: '100%', textAlign: 'center', color: focused ? '#2196F3' : '#9DB2CE', marginTop: 2 }}>
                  الطلبات
                </CustomText>
              </View>
            );
          } else if (route.name === 'المنتجات') {
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center' , height: 20 }}>
                <Image
                  source={focused ? require('../../assets/icons/products_active.png') : require('../../assets/icons/products_inactive.png')}
                  style={{ width: 24, height: 24, resizeMode: 'contain' }}
                />
                <CustomText type='bold' style={{ fontSize: 12, width: '100%', textAlign: 'center', color: focused ? '#2196F3' : '#9DB2CE', marginTop: 2 }}>
                  المنتجات
                </CustomText>
              </View>
            );
          } else if (route.name === 'حسابي') {
            return (
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
          } 
          
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        // tabBarLabelStyle: { fontFamily: 'Cairo', fontSize: 13, display: 'none' },
        tabBarStyle: { 
          flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
          elevation: 0,
          shadowOpacity: 0,
          // borderTopWidth: 1,
          // borderTopColor: '#E0E0E0',
          // justifyContent: 'center',
          // alignItems: 'center',
          height: 100,
          // paddingBottom: 70,     
           position: 'absolute',
          paddingTop: 30,
           shadowColor: '#000',
    shadowOffset: { width: 10, height: 100 },
    shadowOpacity: 0.90,
    shadowRadius: 30,
    elevation: 4,
        },
      })}
      initialRouteName="الرئيسية"
    >
      <Tab.Screen 
        name="حسابي" 
        component={Profile}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="المنتجات" 
        component={Products}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="الطلبات" 
        component={Orders}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="الرئيسية" 
        component={AdminDashboard}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        // animation: 'slide_from_left',
        animation:"ios_from_left",
        animationDuration: 200,
      }}
    >
      <Stack.Screen 
        name="AdminTabs" 
        component={AdminTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddProduct" 
        component={AddProduct} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
} 