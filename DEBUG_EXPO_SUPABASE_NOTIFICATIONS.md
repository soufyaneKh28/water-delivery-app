# Debug: Expo + Supabase Notification Issue

## Your Architecture (Confirmed)

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Setup                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (React Native)                                    │
│  ├─ Registers device tokens                                 │
│  └─ Stores in Supabase: device_tokens table                │
│                                                              │
│  Supabase (Database)                                        │
│  └─ Table: device_tokens                                    │
│     └─ Token format: ExponentPushToken[...]                │
│                                                              │
│  Backend (Express)                                          │
│  ├─ Queries Supabase for tokens                            │
│  ├─ Sends via: Expo Push Service                           │
│  └─ URL: https://exp.host/--/api/v2/push/send             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## ✅ What We Know Works

- Expo notification tool: ✅ Works (proves FCM credentials are correct)
- Token registration: ✅ Works (tokens stored in Supabase)
- Order status update: ✅ Works

## ❌ What Doesn't Work

- Backend sending notification after status change

## 🔍 Debugging Steps

### Step 1: Verify Tokens Are in Supabase

Open Supabase dashboard and check:

```sql
-- Check device_tokens table
SELECT * FROM device_tokens 
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;
```

**Questions:**
1. Do you see tokens?
2. Do they look like: `ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]`?
3. Do they have the correct `user_id` linked to your test client?

### Step 2: Check Backend's Supabase Connection

In your Express backend, check if Supabase client is properly configured:

```javascript
// backend/config/supabase.js or similar
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,        // Should be: https://xxx.supabase.co
  process.env.SUPABASE_SERVICE_KEY // Should be: eyJxxx... (service role key)
);

// Test connection
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('device_tokens')
      .select('count');
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
    } else {
      console.log('✅ Supabase connected. Tokens count:', data);
    }
  } catch (err) {
    console.error('❌ Supabase error:', err);
  }
}
```

### Step 3: Check Row Level Security (RLS)

Supabase might be blocking your backend from reading tokens!

**In Supabase Dashboard:**
1. Go to **Authentication** → **Policies**
2. Find the `device_tokens` table
3. Check if there are RLS policies

**Two options:**

#### Option A: Disable RLS for device_tokens (Quick fix)
```sql
ALTER TABLE device_tokens DISABLE ROW LEVEL SECURITY;
```

#### Option B: Add Policy for Service Role (Better)
```sql
-- Allow service role to read all tokens
CREATE POLICY "Service role can read all tokens"
ON device_tokens
FOR SELECT
TO service_role
USING (true);
```

### Step 4: Check Backend Notification Code

In your Express backend's `changeOrderStatus` endpoint:

```javascript
router.patch('/orders/changeOrderStatus/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // 1. Update order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select('*, user_id(*)')
      .single();
    
    if (orderError) throw orderError;
    
    console.log('✅ Order updated:', orderId);
    console.log('📋 Order user_id:', order.user_id);
    
    // 2. Get user's device tokens
    const userId = order.user_id?.id || order.user_id; // Handle both formats
    console.log('🔍 Looking up tokens for user:', userId);
    
    const { data: tokens, error: tokenError } = await supabase
      .from('device_tokens')
      .select('player_id')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (tokenError) {
      console.error('❌ Error fetching tokens:', tokenError);
    } else {
      console.log('📱 Tokens found:', tokens?.length || 0);
      if (tokens && tokens.length > 0) {
        console.log('📱 Tokens:', tokens.map(t => t.player_id));
      }
    }
    
    // 3. Send notifications
    if (tokens && tokens.length > 0) {
      const statusMessages = {
        'new': 'قيد الانتظار',
        'processing': 'قيد المعالجة',
        'on-the-way': 'في الطريق',
        'delivered': 'تم التوصيل',
        'cancelled': 'تم الإلغاء',
      };
      
      const statusLabel = statusMessages[status] || status;
      const orderNumber = generateOrderNumber(orderId);
      
      for (const tokenRow of tokens) {
        const token = tokenRow.player_id;
        console.log('📤 Sending notification to:', token.substring(0, 30) + '...');
        
        try {
          const response = await axios.post('https://exp.host/--/api/v2/push/send', {
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
          }, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          });
          
          console.log('✅ Notification sent:', response.data);
        } catch (pushError) {
          console.error('❌ Push error:', pushError.response?.data || pushError.message);
        }
      }
    } else {
      console.log('⚠️ No device tokens found for user:', userId);
    }
    
    res.json({ status: 'success', data: order });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});
```

### Step 5: Check Backend Environment Variables

Make sure your backend has:

```bash
# .env file
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...  # This should be the SERVICE ROLE key, not anon key!
```

**Important**: Use **service_role** key, NOT **anon** key! The service role bypasses RLS.

### Step 6: Check Supabase Table Structure

Your `device_tokens` table should look like:

```sql
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,           -- The ExponentPushToken[...]
  device_type TEXT,                  -- 'ios' or 'android'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Step 7: Test Backend Query Directly

Add this test endpoint temporarily:

```javascript
// Test endpoint
router.get('/test-notification/:userId', async (req, res) => {
  const { userId } = req.params;
  
  console.log('🧪 Testing notification for user:', userId);
  
  // 1. Check if we can query Supabase
  const { data: tokens, error } = await supabase
    .from('device_tokens')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('❌ Supabase error:', error);
    return res.json({ error: error.message });
  }
  
  console.log('📱 Tokens found:', tokens);
  
  if (tokens.length === 0) {
    return res.json({ message: 'No tokens found', userId });
  }
  
  // 2. Try to send
  const token = tokens[0].player_id;
  
  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', {
      to: token,
      title: 'Test from Backend',
      body: 'This is a test notification',
      sound: 'default',
    });
    
    console.log('✅ Success:', response.data);
    res.json({ success: true, response: response.data });
  } catch (err) {
    console.error('❌ Push error:', err.response?.data || err.message);
    res.json({ error: err.response?.data || err.message });
  }
});
```

Then test it:
```bash
curl https://water-supplier-2.onrender.com/api/k1/test-notification/YOUR_USER_ID
```

## Common Issues & Solutions

### Issue 1: RLS Blocking Backend

**Symptom**: Backend can't read tokens, error about permissions

**Solution**:
```sql
-- Option 1: Disable RLS (quick)
ALTER TABLE device_tokens DISABLE ROW LEVEL SECURITY;

-- Option 2: Add service role policy (better)
CREATE POLICY "Service role full access"
ON device_tokens TO service_role
USING (true)
WITH CHECK (true);
```

### Issue 2: Wrong Supabase Key

**Symptom**: Backend gets empty results or auth errors

**Solution**: Make sure using **service_role** key, not **anon** key
```javascript
// Wrong:
const supabase = createClient(url, SUPABASE_ANON_KEY);

// Right:
const supabase = createClient(url, SUPABASE_SERVICE_KEY);
```

### Issue 3: user_id Format Mismatch

**Symptom**: Tokens exist but query returns empty

**Solution**: Check the format of user_id in both tables
```javascript
// Debug:
console.log('Order user_id type:', typeof order.user_id);
console.log('Order user_id value:', order.user_id);

// Handle both object and string:
const userId = order.user_id?.id || order.user_id;
```

### Issue 4: Table Name Mismatch

**Symptom**: Error: relation "device_tokens" does not exist

**Solution**: Check actual table name in Supabase (might be different)
```javascript
// Check all tables:
const { data } = await supabase.from('_metadata').select('*');
```

## Quick Diagnostic Checklist

- [ ] Tokens exist in Supabase device_tokens table
- [ ] Backend has SUPABASE_SERVICE_KEY configured
- [ ] RLS is disabled OR policy allows service role
- [ ] Backend Supabase client is initialized correctly
- [ ] changeOrderStatus endpoint includes notification code
- [ ] Backend logs show token query attempts
- [ ] user_id format matches between orders and device_tokens

## Summary

Your setup is actually simpler than I thought! Since you use:
- Expo tokens in Supabase
- Backend sends via Expo Push Service

**You don't need Firebase credentials in backend at all!**

The issue is most likely:
1. **RLS blocking backend** (most common)
2. **Wrong Supabase key** (anon instead of service_role)
3. **Backend code not querying tokens properly**

Run the test endpoint and check backend logs to see exactly what's happening!

