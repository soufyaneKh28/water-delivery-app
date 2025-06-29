import { supabase } from '../../lib/supabase';

// Base API URL
const API_BASE_URL = 'https://water-supplier-2.onrender.com/api/k1';

// Helper function to get access token
const getAccessToken = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

// Generic API call function with authentication
export const apiCall = async (endpoint, options = {}) => {
  try {
    const token = await getAccessToken();
    
    if (!token) {
      throw new Error('No access token available. Please login again.');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, try to refresh
        try {
          await supabase.auth.refreshSession();
          // Retry the request with new token
          const newToken = await getAccessToken();
          if (newToken) {
            const retryResponse = await fetch(url, {
              ...options,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
                ...options.headers,
              },
            });
            
            if (!retryResponse.ok) {
              throw new Error(`API call failed: ${retryResponse.status}`);
            }
            
            return await retryResponse.json();
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('Authentication failed. Please login again.');
        }
      }
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Specific API functions
export const api = {
  // Locations
  getLocations: () => apiCall('/locations/getAllLocations'),
  
  // Offers
  getOffers: () => apiCall('/offers/getAllOffers'),
  
  // Categories
  getCategories: () => apiCall('/product_categories/getAllCategory'),
  
  // Products
  getProducts: () => apiCall('/products/getAllProducts'),
  
  // Users
  getAllData: () => apiCall('/users/getAllData'),
  
  // Orders
  createOrder: (orderData) => apiCall('/orders/createOrder', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  
  getOrders: () => apiCall('/orders/getAllOrders'),
  
  updateOrderStatus: (orderId, status) => apiCall(`/orders/changeOrderStatus/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  
  deleteOrder: (orderId) => apiCall(`/orders/deleteOrder/${orderId}`, {
    method: 'DELETE',
  }),
  
  uploadReceipt: (orderId, formData) => apiCall(`/orders/uploadReceipt/${orderId}`, {
    method: 'PATCH',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Admin functions
  addCategory: (formData) => apiCall('/product_categories/createProductCategory', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  updateCategory: (categoryId, categoryData) => apiCall(`/product_categories/updateProductCategory/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  }),
  
  deleteCategory: (categoryId) => apiCall(`/product_categories/deleteProductCategory/${categoryId}`, {
    method: 'DELETE',
  }),
  
  addProduct: (productData) => apiCall('/products/addProduct', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  
  updateProduct: (productId, productData) => apiCall(`/products/updateProduct/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }),
  
  deleteProduct: (productId) => apiCall(`/products/deleteProduct/${productId}`, {
    method: 'DELETE',
  }),
  
  addOffer: (offerData) => apiCall('/offers/addOffer', {
    method: 'POST',
    body: JSON.stringify(offerData),
  }),
  
  updateOffer: (offerId, offerData) => apiCall(`/offers/updateOffer/${offerId}`, {
    method: 'PUT',
    body: JSON.stringify(offerData),
  }),
  
  deleteOffer: (offerId) => apiCall(`/offers/deleteOffer/${offerId}`, {
    method: 'DELETE',
  }),
  
  // Coupons
  getCoupons: () => apiCall('/coupons/getAllCoupons'),
  addCoupon: (couponData) => apiCall('/coupons/addCoupon', {
    method: 'POST',
    body: JSON.stringify(couponData),
  }),
  
  updateCoupon: (couponId, couponData) => apiCall(`/coupons/updateCoupon/${couponId}`, {
    method: 'PUT',
    body: JSON.stringify(couponData),
  }),
  
  deleteCoupon: (couponId) => apiCall(`/coupons/deleteCoupon/${couponId}`, {
    method: 'DELETE',
  }),
}; 