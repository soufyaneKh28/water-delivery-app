import axios from 'axios';

export async function patchOrderStatus(orderId, status, accessToken) {
  if (!accessToken) throw new Error('No access token found');
  console.log('status', status);

  try {
    const response = await axios.patch(
      `https://water-supplier-2.onrender.com/api/k1/orders/changeOrderStatus/${orderId}`,
      { status },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to update order status');
  }
} 