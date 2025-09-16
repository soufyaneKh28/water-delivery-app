import { supabase } from '../../lib/supabase';

// Base API URL
export const API_BASE_URL = 'https://water-supplier-2.onrender.com/api/k1';

// Helper function to get access token
export const getAccessToken = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

// Generic API call function with authentication and retry logic
export const apiCall = async (endpoint, options = {}, retryCount = 0) => {
  const maxRetries = 2;
  
  try {
    const token = await getAccessToken();
    
    if (!token) {
      throw new Error('No access token available. Please login again.');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, try to refresh
        try {
          await supabase.auth.refreshSession();
          // Retry the request with new token
          const newToken = await getAccessToken();
          if (newToken) {
            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), 10000);
            
            const retryResponse = await fetch(url, {
              ...options,
              signal: retryController.signal,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
                ...options.headers,
              },
            });
            
            clearTimeout(retryTimeoutId);
            
            if (!retryResponse.ok) {
              throw new Error(`API call failed: ${retryResponse.status}`);
            }
            // Safely handle empty bodies on retry
            const retryText = await retryResponse.text();
            return retryText ? JSON.parse(retryText) : {};
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('Authentication failed. Please login again.');
        }
      }
      
      // Retry on server errors (5xx) or network errors
      if ((response.status >= 500 || response.status === 0) && retryCount < maxRetries) {
        console.log(`Retrying API call (${retryCount + 1}/${maxRetries}) for endpoint: ${endpoint}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return apiCall(endpoint, options, retryCount + 1);
      }
      
      throw new Error(`API call failed: ${response.status}`);
    }

    // Safely handle empty bodies (e.g., DELETE 204 No Content)
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your internet connection.');
    }
    
    // Retry on network errors
    if (retryCount < maxRetries && (error.message.includes('Network') || error.message.includes('fetch'))) {
      console.log(`Retrying API call (${retryCount + 1}/${maxRetries}) for endpoint: ${endpoint}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return apiCall(endpoint, options, retryCount + 1);
    }
    
    console.error('API call error:', error);
    throw error;
  }
};

// Specific API functions
export const api = {
  // Locations
  getLocations: () => apiCall('/locations/getAllLocations'),
  deleteLocation: (locationId) => apiCall(`/locations/deleteLocation/${locationId}`, {
    method: 'DELETE',
  }),
  
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
  
  // Coupon Products
  getCouponProducts: () => apiCall('/couponsProducts/getAllCouponsProducts'),
  getGuestData: () => apiCall('/users/guest'),
  createCouponProduct: (productData) => apiCall('/couponsProducts/createCouponProduct', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  updateCouponProduct: (productId, productData) => apiCall(`/couponsProducts/updateCouponProduct/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(productData),
  }),
  deleteCouponProduct: (productId) => apiCall(`/couponsProducts/deleteCouponProduct/${productId}`, {
    method: 'DELETE',
  }),
}; 