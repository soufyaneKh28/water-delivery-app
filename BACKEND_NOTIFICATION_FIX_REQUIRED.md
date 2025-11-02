# Backend Notification Fix - REQUIRED

## Current Status

✅ **Working**: Expo push tool sends notifications to Android device
❌ **NOT Working**: Order status change notifications

## Why It's Not Working

Your device tokens are stored in your **backend database**, not Supabase. The frontend cannot access them.

```
Device Tokens Location:
Backend DB → device_tokens table ✅ (Tokens stored here)
Supabase   → No device_tokens table ❌ (Frontend trying to query here)
```

## The Fix: Backend Sends Notifications Automatically

### What Your Backend Developer Needs to Do

Modify the `changeOrderStatus` endpoint to **automatically send push notifications** after updating the order status.

### Step 1: Install Expo Server SDK

In your backend project:

```bash
npm install expo-server-sdk
```

### Step 2: Modify the Endpoint

**File**: Your backend endpoint that handles order status changes  
**Route**: `PATCH /api/k1/orders/changeOrderStatus/:orderId`

**Add this code AFTER successfully updating the order status:**

```javascript
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

router.patch('/orders/changeOrderStatus/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // 1. Update order status (YOUR EXISTING CODE)
    const updatedOrder = await updateOrderStatus(orderId, status);
    
    if (!updatedOrder) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }
    
    // 2. GET USER'S DEVICE TOKENS (NEW CODE)
    const userDeviceTokens = await db.query(
      'SELECT player_id FROM device_tokens WHERE user_id = $1 AND is_active = true',
      [updatedOrder.user_id]
    );
    
    // 3. SEND PUSH NOTIFICATIONS (NEW CODE)
    if (userDeviceTokens.rows && userDeviceTokens.rows.length > 0) {
      const pushTokens = userDeviceTokens.rows.map(row => row.player_id);
      
      // Filter valid Expo push tokens
      const validTokens = pushTokens.filter(token => Expo.isExpoPushToken(token));
      
      if (validTokens.length > 0) {
        // Status messages in Arabic
        const statusMessages = {
          'new': 'قيد الانتظار',
          'processing': 'قيد المعالجة',
          'on-the-way': 'في الطريق',
          'delivered': 'تم التوصيل',
          'cancelled': 'تم الإلغاء',
        };
        
        const statusLabel = statusMessages[status] || status;
        const orderNumber = generateOrderNumber(orderId); // Use your order number function
        
        // Create notification messages
        const messages = validTokens.map(token => ({
          to: token,
          sound: 'default',
          title: '🔔 تحديث حالة الطلب',
          body: `تم تحديث حالة طلبك #${orderNumber} إلى: ${statusLabel}`,
          data: { 
            orderId: orderId,
            status: status,
            type: 'order_status_update'
          },
          channelId: 'default',
        }));
        
        // Send in chunks (Expo requirement)
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];
        
        for (const chunk of chunks) {
          try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
            console.log('✅ Notifications sent:', tickets.length);
          } catch (error) {
            console.error('❌ Error sending notifications:', error);
          }
        }
      }
    }
    
    // 4. Return success (YOUR EXISTING CODE)
    res.json({ 
      status: 'success', 
      data: updatedOrder 
    });
    
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Helper function to generate order number (if you don't have one)
function generateOrderNumber(uuid) {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = ((hash << 5) - hash) + uuid.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString().padStart(8, '0').slice(0, 8);
}
```

### Step 3: Test

1. As client: Place an order (Android device)
2. As admin: Change order status
3. Check backend logs: Should see "✅ Notifications sent: 1"
4. Client device: Should receive notification! 🎉

## Why This Approach Is Better

| Frontend Sends | Backend Sends |
|----------------|---------------|
| ❌ No access to device tokens | ✅ Has direct database access |
| ❌ Needs extra API endpoint | ✅ All in one endpoint |
| ❌ Can fail if frontend crashes | ✅ Always reliable |
| ❌ Slower (multiple requests) | ✅ Faster (one operation) |

## Alternative: Quick Test (If Backend Can't Be Modified)

If you can't modify the backend right now, you can test by having the backend return the user's device tokens in the response:

### Backend Quick Fix:

```javascript
// In changeOrderStatus endpoint, add this to the response:
const userDeviceTokens = await db.query(
  'SELECT player_id FROM device_tokens WHERE user_id = $1',
  [updatedOrder.user_id]
);

res.json({ 
  status: 'success', 
  data: updatedOrder,
  deviceTokens: userDeviceTokens.rows.map(r => r.player_id) // Add this
});
```

### Frontend Adjustment:

Then update the frontend to use the returned tokens instead of querying Supabase.

## Summary

**Current Issue**: Frontend tries to get tokens from Supabase, but they're in the backend database

**Best Solution**: Backend automatically sends notifications when order status changes

**Implementation Time**: ~15-20 minutes for backend developer

**Result**: Order status notifications will work perfectly! ✅

## Questions for Your Backend Developer

1. Do you have the `device_tokens` table in your database?
2. Does the `changeOrderStatus` endpoint currently return the order object?
3. Can you add the notification sending code after updating the order status?

## Testing Checklist

After backend modification:

- [ ] Install `expo-server-sdk` in backend
- [ ] Add notification code to `changeOrderStatus` endpoint
- [ ] Test: Change order status
- [ ] Check backend logs for "✅ Notifications sent"
- [ ] Verify client receives notification
- [ ] Confirm iOS notifications still work

## Need Help?

If your backend is written in a different language (Python, PHP, Java, etc.), I can provide equivalent code. Just let me know what backend framework you're using!

