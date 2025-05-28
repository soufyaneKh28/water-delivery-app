import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { CartProvider } from './app/context/CartContext';
// ... other imports ...

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        {/* ... rest of your app ... */}
      </NavigationContainer>
    </CartProvider>
  );
} 