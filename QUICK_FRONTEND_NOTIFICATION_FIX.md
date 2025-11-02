# Quick Frontend Notification Fix

## Problem

When you change order status:
- ✅ Expo notification tool works
- ✅ Order status updates
- ❌ Notifications not sent (backend endpoint missing)

## Quick Solution: Query Supabase Directly

Instead of calling a backend endpoint, query device tokens directly from Supabase.

### Implementation

The fix modifies `OrderDetails.jsx` to:
1. Query Supabase `device_tokens` table directly
2. Get all active tokens for the user
3. Send notifications via Expo Push API

### Step 1: Check if device_tokens table exists in Supabase

1. Go to your Supabase dashboard
2. Check if you have a `device_tokens` table
3. It should have columns like:
   - `user_id` (UUID)
   - `player_id` (TEXT) - the Expo push token
   - `is_active` (BOOLEAN)
   - `device_type` (TEXT)

### Step 2: If table doesn't exist, create it

Run this SQL in Supabase SQL Editor:

```sql
-- Create device_tokens table
CREATE TABLE IF NOT EXISTS device_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  device_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_device UNIQUE(user_id, player_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_active ON device_tokens(user_id, is_active);

-- Enable Row Level Security
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own tokens
CREATE POLICY "Users can read own tokens"
  ON device_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own tokens
CREATE POLICY "Users can insert own tokens"
  ON device_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can read all tokens
CREATE POLICY "Admins can read all tokens"
  ON device_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### Step 3: Update OrderDetails.jsx

Replace the `sendNotificationToClient` function with this improved version:

```javascript
// Helper function to send push notification to client (using Supabase)
const sendNotificationToClient = async (userId, orderNumber, newStatus) => {
  try {
    console.log('📤 Sending notification to client...', { userId, orderNumber, newStatus });
    
    // Get client's device tokens from Supabase
    const { data: tokens, error } = await supabase
      .from('device_tokens')
      .select('player_id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error fetching device tokens:', error);
      return;
    }

    console.log('📱 Device tokens:', tokens);

    if (tokens && tokens.length > 0) {
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
      for (const tokenRow of tokens) {
        try {
          const notification = {
            to: tokenRow.player_id,
            sound: 'default',
            title: '🔔 تحديث حالة الطلب',
            body: `تم تحديث حالة طلبك #${orderNumber} إلى: ${statusMessage}`,
            data: { 
              orderId: orderNumber,
              status: newStatus,
              type: 'order_status_update'
            },
            channelId: 'default',
          };

          const pushResponse = await axios.post(
            'https://exp.host/--/api/v2/push/send',
            notification,
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            }
          );
          
          console.log('✅ Notification sent successfully:', pushResponse.data);
        } catch (pushError) {
          console.error('❌ Error sending push notification:', pushError.response?.data || pushError.message);
        }
      }
    } else {
      console.log('⚠️ No device tokens found for user:', userId);
    }
  } catch (error) {
    console.error('❌ Error in sendNotificationToClient:', error);
  }
};
```

### Step 4: Update handleStatusChange

Change this line in `handleStatusChange`:
```javascript
// OLD (with accessToken parameter)
await sendNotificationToClient(clientUserId, orderNumber, newStatus, token);

// NEW (without accessToken parameter)
await sendNotificationToClient(clientUserId, orderNumber, newStatus);
```

## Why This Works

1. ✅ No backend endpoint needed
2. ✅ Direct database access via Supabase
3. ✅ Uses same tokens that backend stores
4. ✅ Works immediately

## Testing

1. Make sure device tokens are being saved to Supabase
2. Change an order status as admin
3. Check console logs for:
   ```
   📤 Sending notification to client...
   📱 Device tokens: [...]
   ✅ Notification sent successfully
   ```
4. Client should receive notification

## Checking Device Tokens in Supabase

Run this query in Supabase SQL Editor:

```sql
-- Check if tokens are being stored
SELECT 
  dt.id,
  dt.user_id,
  p.username,
  LEFT(dt.player_id, 30) || '...' as token_preview,
  dt.device_type,
  dt.is_active,
  dt.created_at
FROM device_tokens dt
LEFT JOIN profiles p ON p.id = dt.user_id
WHERE dt.is_active = true
ORDER BY dt.created_at DESC
LIMIT 10;
```

You should see entries with:
- user_id
- player_id starting with `ExponentPushToken[`
- device_type: `android` or `ios`
- is_active: `true`

## Troubleshooting

### "No device tokens found"

**Problem**: Tokens not in Supabase

**Solution**: Check if backend is saving tokens. Look for logs:
```
📤 Sending push token to backend...
✅ Token registered with backend successfully
```

If tokens go to a different backend endpoint, you need to ensure they're also saved to Supabase.

### "Error fetching device tokens"

**Problem**: RLS policy blocking access

**Solution**: Make sure admin can read tokens. Run:
```sql
-- Allow admins to read all tokens
CREATE POLICY "Admins can read all tokens"
  ON device_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

## Long-Term Solution

This frontend fix works, but **backend implementation is better** because:
- ✅ More secure
- ✅ More reliable
- ✅ Easier to maintain
- ✅ Can track notification history

See `BACKEND_NOTIFICATION_IMPLEMENTATION.md` for the recommended approach.

## Summary

Quick fix:
1. Ensure `device_tokens` table exists in Supabase
2. Update `sendNotificationToClient` to query Supabase
3. Remove `accessToken` parameter
4. Test!

This should get notifications working immediately while you work on the backend solution.

