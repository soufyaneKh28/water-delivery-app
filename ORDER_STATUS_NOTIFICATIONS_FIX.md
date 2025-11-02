# Order Status Notification Fix

## Problem
Notifications are not being sent to clients when order status changes on Android devices.

## Root Cause
The app was only updating the order status in the database but **not sending push notifications** to the client who placed the order.

## Solution Implemented

### Frontend Changes (OrderDetails.jsx)

Added notification sending functionality that triggers after successfully updating an order status:

1. **New Helper Function**: `sendNotificationToClient()`
   - Retrieves client's device tokens from backend
   - Sends push notification via Expo Push Service
   - Handles multiple devices per user
   - Includes proper error handling

2. **Modified**: `handleStatusChange()` function
   - Now calls `sendNotificationToClient()` after successful status update
   - Passes order information and new status to notification function

### What Was Added

```javascript
// Helper function to send push notification to client
const sendNotificationToClient = async (userId, orderNumber, newStatus, accessToken) => {
  try {
    // Get client's device token(s) from backend
    const deviceResponse = await axios.get(
      `${API_BASE_URL}/notifications/getDeviceTokens/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (deviceResponse.data && deviceResponse.data.tokens && deviceResponse.data.tokens.length > 0) {
      const tokens = deviceResponse.data.tokens;
      
      // Status messages in Arabic
      const statusMessages = {
        'new': 'قيد الانتظار',
        'processing': 'قيد المعالجة',
        'on-the-way': 'في الطريق',
        'delivered': 'تم التوصيل',
        'cancelled': 'تم الإلغاء',
      };

      const statusMessage = statusMessages[newStatus] || newStatus;

      // Send notification to each device token
      const notifications = tokens.map(token => ({
        to: token,
        sound: 'default',
        title: '🔔 تحديث حالة الطلب',
        body: `تم تحديث حالة طلبك #${orderNumber} إلى: ${statusMessage}`,
        data: { 
          orderId: orderNumber,
          status: newStatus,
          type: 'order_status_update'
        },
        channelId: 'default',
      }));

      // Send via Expo Push Service
      for (const notification of notifications) {
        await axios.post(
          'https://exp.host/--/api/v2/push/send',
          notification,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
};
```

## Backend Requirements

### Required Endpoint: Get Device Tokens

Your backend needs to have this endpoint implemented:

**Endpoint**: `GET /api/k1/notifications/getDeviceTokens/:userId`

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "status": "success",
  "tokens": [
    "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]"
  ]
}
```

### Backend Implementation (Node.js/Express Example)

```javascript
// GET device tokens for a specific user
router.get('/notifications/getDeviceTokens/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Query your device_tokens table or collection
    const tokens = await db.query(
      'SELECT player_id FROM device_tokens WHERE user_id = $1 AND is_active = true',
      [userId]
    );
    
    const tokenList = tokens.rows.map(row => row.player_id);
    
    res.json({
      status: 'success',
      tokens: tokenList
    });
  } catch (error) {
    console.error('Error fetching device tokens:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch device tokens'
    });
  }
});
```

### Database Schema (If Not Already Present)

Your `device_tokens` table should have:

```sql
CREATE TABLE device_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  device_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_player_id ON device_tokens(player_id);
```

## Alternative: Backend-Side Notification Sending (Recommended)

For better security and scalability, you can have the backend send notifications automatically when order status changes:

### Backend Implementation

```javascript
// In your changeOrderStatus endpoint
router.patch('/orders/changeOrderStatus/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Update order status
    const order = await db.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, orderId]
    );
    
    if (order.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }
    
    const updatedOrder = order.rows[0];
    
    // Get user's device tokens
    const tokens = await db.query(
      'SELECT player_id FROM device_tokens WHERE user_id = $1 AND is_active = true',
      [updatedOrder.user_id]
    );
    
    // Send push notifications
    if (tokens.rows.length > 0) {
      const notifications = tokens.rows.map(row => ({
        to: row.player_id,
        sound: 'default',
        title: '🔔 تحديث حالة الطلب',
        body: `تم تحديث حالة طلبك #${order.order_number} إلى: ${getStatusLabel(status)}`,
        data: { 
          orderId: orderId,
          status: status,
          type: 'order_status_update'
        },
        channelId: 'default',
      }));
      
      // Send to Expo Push API
      const expo = require('expo-server-sdk');
      const expoClient = new expo.Expo();
      
      try {
        const chunks = expoClient.chunkPushNotifications(notifications);
        const tickets = [];
        
        for (const chunk of chunks) {
          const ticketChunk = await expoClient.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        }
        
        console.log('📤 Notifications sent:', tickets);
      } catch (error) {
        console.error('❌ Error sending notifications:', error);
      }
    }
    
    res.json({ status: 'success', data: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});
```

## Testing

### 1. Test Device Token Registration

Check if device tokens are being saved:

```javascript
// In your app, check logs for:
console.log('📤 Sending push token to backend...');
console.log('✅ Token registered with backend successfully');
```

### 2. Test Notification Sending

When you change an order status, check logs for:

```javascript
// Frontend logs:
console.log('🔔 Sending notification to client:', userId);
console.log('✅ Notification sent successfully');

// Or if using backend:
// Backend logs:
console.log('📤 Notifications sent:', tickets);
```

### 3. Verify on Device

1. Place a test order as a client
2. Switch to admin panel
3. Change the order status
4. Check if notification appears on client device

## Troubleshooting

### Issue: "No device tokens found for user"

**Cause**: User hasn't logged in or token wasn't registered

**Solution**:
1. Have the client log out and log back in
2. Check backend logs for token registration
3. Verify database has the token

### Issue: "Error 400: Invalid token"

**Cause**: Token format is incorrect or expired

**Solution**:
1. Verify token starts with `ExponentPushToken[`
2. Have user reinstall app and re-login
3. Check if token is being properly stored

### Issue: "Notification sent but not received"

**Cause**: Multiple possible reasons

**Solutions**:
1. Check FCM credentials are uploaded (✅ Done)
2. Verify notification permissions are granted on device
3. Check Android notification channel settings
4. Ensure app is not in battery optimization
5. Test with Expo notification tool first

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Admin changes order status                                       │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend: Update order status in database                        │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Successful response received                          │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Get user's device tokens from backend                 │
│ GET /notifications/getDeviceTokens/:userId                       │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Send push notification to each device                 │
│ POST https://exp.host/--/api/v2/push/send                       │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Expo Push Service → FCM → Client Device                         │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ Client receives notification: "تحديث حالة الطلب"                 │
│ "تم تحديث حالة طلبك #12345678 إلى: في الطريق"                  │
└─────────────────────────────────────────────────────────────────┘
```

## Summary

✅ **What Was Fixed**:
- Added notification sending after order status change
- Retrieves client device tokens
- Sends formatted push notifications
- Handles errors gracefully

⚠️ **Backend Requirement**:
- Must implement `/notifications/getDeviceTokens/:userId` endpoint
- OR implement automatic notification sending on backend

🎯 **Next Steps**:
1. Implement the required backend endpoint
2. Test with a real order
3. Verify notifications are received on Android device
4. Optionally move notification logic to backend for better security

## Files Modified

- `app/screens/admin/OrderDetails.jsx` - Added notification sending functionality

