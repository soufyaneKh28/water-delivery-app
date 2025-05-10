import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Image } from 'react-native';

// Import client screens
import EditProfileScreen from '../screens/client/EditProfileScreen';
import HomeScreen from '../screens/client/Home';
import ProfileScreen from '../screens/client/ProfileScreen';
import { colors } from '../styling/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export function ClientTabs() {
  return (
    <Tab.Navigator initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return (
              <Image
                source={focused ? require('../../assets/icons/home_active.png') : require('../../assets/icons/home_inactive.png')}
                style={{ width: size, height: size, resizeMode: 'contain' }}
              />
            );
          } else if (route.name === 'Profile') {
            const iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        headerShown: false,
        
        tabBarStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 1,
          borderTopColor: colors.gray[200],
          height: 70,
          paddingBottom: 20,
          paddingTop: 8,
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
        animation: 'slide_from_right',
        animationDuration: 200,
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
    </Stack.Navigator>
  );
} 