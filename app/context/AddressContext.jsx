import React, { createContext, useContext, useState } from 'react';

const AddressContext = createContext();

export function AddressProvider({ children }) {
  const [selectedAddress, setSelectedAddress] = useState(null);

  return (
    <AddressContext.Provider value={{ selectedAddress, setSelectedAddress }}>
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