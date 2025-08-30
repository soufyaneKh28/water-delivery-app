import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import GuestCategoryScreen from '../screens/guest/GuestCategoryScreen';
import GuestHomeScreen from '../screens/guest/GuestHome';
import GuestProductDetails from '../screens/guest/GuestProductDetails';

const Stack = createStackNavigator();

const GuestNavigator = () => {
  return (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GuestHome" component={GuestHomeScreen} />
    <Stack.Screen name="GuestProductDetails" component={GuestProductDetails} />
    <Stack.Screen name="GuestCategory" component={GuestCategoryScreen} />
    </Stack.Navigator>
  )
}

export default GuestNavigator   