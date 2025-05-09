import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { I18nManager } from 'react-native';

// Import admin screens
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
          let iconName;
          if (route.name === 'الرئيسية') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'الطلبات') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'المنتجات') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'حسابي') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontFamily: 'Cairo', fontSize: 13 },
        tabBarStyle: { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' },
      })}
      initialRouteName="الرئيسية"
    >
      <Tab.Screen 
        name="الرئيسية" 
        component={AdminDashboard}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="الطلبات" 
        component={Orders}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="المنتجات" 
        component={Products}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="حسابي" 
        component={Profile}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AdminTabs" 
        component={AdminTabs} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
} 