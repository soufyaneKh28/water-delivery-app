import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // If item exists, add the new quantity to existing quantity
        return prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      } else {
        // If item doesn't exist, add new item with the specified quantity or default to 1
        return [...prevCart, { 
          ...product, 
          quantity: product.quantity || 1 
        }];
      }
    });

    // Show success modal
    setAddedProduct(product);
    // setShowSuccessModal(true);
    
    // Hide modal after 2 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
      setAddedProduct(null);
    }, 2000);
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prevCart => 
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      showSuccessModal,
      setShowSuccessModal,
      addedProduct
    }}>
      {children}
    </CartContext.Provider>
  );
}; 