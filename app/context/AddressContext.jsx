import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const AddressContext = createContext();

export function AddressProvider({ children }) {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const { user } = useAuth();

  // Clear selected address when user changes
  useEffect(() => {
    if (!user) {
      setSelectedAddress(null);
    }
  }, [user?.id]);

  const clearSelectedAddress = () => {
    setSelectedAddress(null);
  };

  return (
    <AddressContext.Provider value={{ selectedAddress, setSelectedAddress, clearSelectedAddress }}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
} 