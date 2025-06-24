import axios from 'axios';
import { supabase } from '../../lib/supabase';

export async function patchOrderStatus(orderId, status) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('No access token found');
  console.log('status', status);

  try {
    const response = await axios.patch(
      `https://water-supplier-2.onrender.com/api/k1/orders/changeOrderStatus/${orderId}`,
      { status },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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