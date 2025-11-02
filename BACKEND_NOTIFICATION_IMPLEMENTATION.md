# Backend Notification Implementation Guide

## Current Situation

- ✅ Expo notification tool works (FCM configured correctly)
- ✅ Order status updates work
- ❌ Order status change notifications DON'T work

## Problem

When admin changes order status:
1. Frontend calls: `PATCH /api/k1/orders/changeOrderStatus/:orderId`
2. Backend updates order status ✅
3. Backend returns success ✅
4. Frontend tries to send notification ❌ (backend endpoint missing)

## Solution: Backend Sends Notifications Automatically

### Why Backend Should Handle This

1. **Security**: Backend has direct database access to device tokens
2. **Reliability**: No dependency on frontend being online
3. **Simplicity**: One API call does everything
4. **Performance**: Faster than frontend making multiple calls

### Implementation

#### Step 1: Install Expo Server SDK (Node.js)

```bash
npm install expo-server-sdk
```

#### Step 2: Modify `changeOrderStatus` Endpoint

```javascript
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

// PATCH /api/k1/orders/changeOrderStatus/:orderId
router.patch('/orders/changeOrderStatus/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // 1. Update order status
    const result = await db.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, orderId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }
    
    const updatedOrder = result.rows[0];
    
    // 2. Get user's device tokens
    const tokensResult = await db.query(
      'SELECT player_id FROM device_tokens WHERE user_id = $1 AND is_active = true',
      [updatedOrder.user_id]
    );
    
    // 3. Send push notifications
    if (tokensResult.rows.length > 0) {
      const pushTokens = tokensResult.rows.map(row => row.player_id);
      
      // Filter valid Expo tokens
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
        const orderNumber = generateOrderNumber(orderId); // Use your order number generator
        
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
        
        // Send notifications in chunks
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];
        
        for (const chunk of chunks) {
          try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
            console.log('✅ Notifications sent:', ticketChunk);
          } catch (error) {
            console.error('❌ Error sending notifications:', error);
          }
        }
        
        // Optional: Store tickets for tracking
        // await storeNotificationTickets(tickets, orderId);
      }
    }
    
    // 4. Return success
    res.json({ 
      status: 'success', 
      data: updatedOrder,
      notificationsSent: tokensResult.rows.length 
    });
    
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Helper function to generate order number (example)
function generateOrderNumber(uuid) {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = ((hash << 5) - hash) + uuid.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString().padStart(8, '0').slice(0, 8);
}
```

#### Step 3: Database Schema (If Not Already Present)

```sql
-- Ensure you have a device_tokens table
CREATE TABLE IF NOT EXISTS device_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  device_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, player_id)
);

CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_active ON device_tokens(user_id, is_active);
```

#### Step 4: Test

```bash
# Test updating order status
curl -X PATCH \
  'https://water-supplier-2.onrender.com/api/k1/orders/changeOrderStatus/ORDER_ID' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"status": "on-the-way"}'
```

Expected result:
```json
{
  "status": "success",
  "data": { /* order data */ },
  "notificationsSent": 1
}
```

And the client should receive a push notification!

### Alternative: Python/FastAPI Implementation

```python
from exponent_server_sdk import (
    PushClient,
    PushMessage,
    PushServerError,
)

@router.patch("/orders/changeOrderStatus/{order_id}")
async def change_order_status(
    order_id: str,
    status: str,
    current_user: User = Depends(get_current_user)
):
    # 1. Update order
    order = await db.update_order_status(order_id, status)
    
    # 2. Get device tokens
    tokens = await db.get_user_device_tokens(order.user_id)
    
    # 3. Send notifications
    if tokens:
        status_labels = {
            'new': 'قيد الانتظار',
            'processing': 'قيد المعالجة',
            'on-the-way': 'في الطريق',
            'delivered': 'تم التوصيل',
            'cancelled': 'تم الإلغاء',
        }
        
        status_label = status_labels.get(status, status)
        order_number = generate_order_number(order_id)
        
        for token in tokens:
            try:
                PushClient().publish(
                    PushMessage(
                        to=token,
                        title='🔔 تحديث حالة الطلب',
                        body=f'تم تحديث حالة طلبك #{order_number} إلى: {status_label}',
                        data={
                            'orderId': order_id,
                            'status': status,
                            'type': 'order_status_update'
                        },
                        sound='default',
                        channel_id='default',
                    )
                )
            except PushServerError as error:
                print(f'Error sending notification: {error}')
    
    return {"status": "success", "data": order}
```

## Testing After Implementation

### 1. Check Backend Logs

When order status changes, you should see:
```
✅ Notifications sent: [{ status: 'ok' }]
```

### 2. Test from Admin Panel

1. As admin: Change order status
2. Check backend logs for notification confirmation
3. Client device should receive notification

### 3. Verify Notification Content

Notification should show:
- Title: "🔔 تحديث حالة الطلب"
- Body: "تم تحديث حالة طلبك #12345678 إلى: في الطريق"

## Error Handling

### Common Errors

#### "DeviceNotRegistered"
- Token is invalid/expired
- User needs to reinstall app or login again
- Mark token as inactive in database

#### "InvalidCredentials"
- FCM credentials not properly configured
- Re-upload service account key to Expo

#### "MessageTooBig"
- Notification body is too long
- Reduce message size

### Error Handling Code

```javascript
const tickets = await expo.sendPushNotificationsAsync(chunk);

for (const ticket of tickets) {
  if (ticket.status === 'error') {
    console.error('Error details:', ticket.details);
    
    // Handle specific errors
    if (ticket.details?.error === 'DeviceNotRegistered') {
      // Mark token as inactive
      await db.query(
        'UPDATE device_tokens SET is_active = false WHERE player_id = $1',
        [token]
      );
    }
  }
}
```

## Benefits of Backend Implementation

1. **Automatic**: Works without frontend changes
2. **Reliable**: Always sends notifications when status changes
3. **Fast**: Single API call, no multiple requests
4. **Secure**: Tokens stay in backend database
5. **Scalable**: Handles multiple devices per user
6. **Trackable**: Can log notification history

## Migration Path

If you implement this:

1. ✅ Backend handles notifications automatically
2. ❌ Remove frontend notification code (optional, can keep as fallback)
3. ✅ Test thoroughly
4. ✅ Deploy to production

## Summary

Current flow:
```
Admin changes status → Backend updates DB → Frontend tries to send notification (fails)
```

New flow:
```
Admin changes status → Backend updates DB + sends notification → Success! ✅
```

This is the **recommended production approach** for sending order status notifications.

