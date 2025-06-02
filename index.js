import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { AddressProvider } from './app/context/AddressContext';
import { AuthProvider } from './app/context/AuthContext';
import { CartProvider } from './app/context/CartContext';
import AppNavigator from './app/navigation/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <CartProvider>
          <AddressProvider>
            <AppNavigator />
          </AddressProvider>
        </CartProvider>
      </AuthProvider>
    </NavigationContainer>
  );
} 