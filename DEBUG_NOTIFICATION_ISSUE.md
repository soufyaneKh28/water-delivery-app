# Debug: Why Notifications Don't Work After Status Change

## Let's Find the Real Issue

Since Expo tool works but order status notifications don't, let's systematically debug this.

## Step 1: Check What's Actually Happening

### Test A: Change Order Status & Check Backend Logs

1. Open your backend server logs (live)
2. As admin, change an order status
3. **Watch the logs carefully**

### What to Look For:

#### Scenario 1: Backend Logs Show Notification Attempts
```
✅ Updating order status...
✅ Order status updated
📤 Sending notification to user: xxxx
✅ Notification sent successfully
```
**If you see this**: Backend IS trying to send, but notification not reaching device
→ Possible issue: Token mismatch, FCM credentials, or device token expired

#### Scenario 2: Backend Logs Show Errors
```
✅ Updating order status...
✅ Order status updated
📤 Sending notification to user: xxxx
❌ Error sending notification: [ERROR MESSAGE HERE]
```
**If you see this**: Check the error message
→ Possible issues: Invalid credentials, expired tokens, network error

#### Scenario 3: Backend Logs Show NOTHING About Notifications
```
✅ Updating order status...
✅ Order status updated
[No notification logs]
```
**If you see this**: Backend is NOT trying to send notifications at all!
→ Possible issue: Code not triggering, conditional logic failing, or feature disabled

#### Scenario 4: Backend Logs Show "No tokens found"
```
✅ Updating order status...
✅ Order status updated
📤 Trying to send notification...
⚠️  No device tokens found for user: xxxx
```
**If you see this**: Backend can't find tokens in database
→ Possible issue: Tokens not registered, wrong user ID, or query failing

## Step 2: Verify Token Registration

### Check if device token exists in database

Run this query in your backend database:

```sql
-- Check if user has device tokens
SELECT * FROM device_tokens 
WHERE user_id = 'YOUR_CLIENT_USER_ID' 
AND is_active = true;
```

**Expected result**: Should show at least one token starting with `ExponentPushToken[`

**If empty**: Device didn't register, or tokens got deleted

## Step 3: Check Token Format

Look at a token from your database. Does it look like:

### Option A: Expo Token (Most likely)
```
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```
→ Backend should send to: `https://exp.host/--/api/v2/push/send`

### Option B: FCM Token
```
fcm:dxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
→ Backend should use Firebase Admin SDK

## Step 4: Test Backend Notification Endpoint Directly

If your backend has a test notification endpoint, call it:

```bash
curl -X POST https://water-supplier-2.onrender.com/api/k1/notifications/test \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_ID",
    "title": "Test",
    "body": "Testing notification"
  }'
```

Does this work? If yes → Issue is specific to order status change trigger

## Step 5: Compare Working vs Not Working

### Expo Tool (Working):
- Token: `ExponentPushToken[YOUR_TOKEN]`
- Sends to: `https://exp.host/--/api/v2/push/send`
- Uses: Expo's FCM credentials (uploaded by you)

### Backend (Not Working):
- Token: ??? (Check database)
- Sends to: ??? (Check backend code)
- Uses: ??? (Check what credentials backend has)

## Common Issues & Solutions

### Issue 1: Backend Can't Find User ID

**Problem**: Order object has wrong user ID format

```javascript
// Check what you're passing:
console.log('Order user_id:', order.user_id);
console.log('Type:', typeof order.user_id);

// Might be:
order.user_id = "uuid-string"           // Correct
order.user_id = { id: "uuid-string" }   // Wrong - need to extract .id
```

**Solution**: Make sure you're extracting the actual user ID:
```javascript
const userId = order.user_id?.id || order.user_id;
```

### Issue 2: Token Expired or Changed

**Problem**: User's device token changed but database has old token

**Test**: 
1. Delete all device tokens for that user
2. Log out and log back in on Android device
3. Try changing order status again

### Issue 3: Wrong User Being Queried

**Problem**: Backend queries tokens for admin user instead of client user

**Check**: Add log to see which user backend is querying:
```javascript
console.log('Looking up tokens for user:', userId);
```

### Issue 4: Conditional Logic Blocking Send

**Problem**: Backend has a condition that's preventing notification send

**Example**:
```javascript
// Backend might have something like:
if (order.notification_enabled && user.push_enabled) {
  sendNotification(); // Only sends if both true
}
```

### Issue 5: Different Endpoint Being Called

**Problem**: Frontend calls different endpoint that doesn't trigger notifications

**Check**: Verify the endpoint URL:
```javascript
// In your frontend:
console.log('Calling:', `${API_BASE_URL}/orders/changeOrderStatus/${order.id}`);
```

## Quick Diagnostic Commands

### For Backend Developer:

```bash
# 1. Check if notification code exists
grep -r "sendPushNotification\|sendNotification\|expo.sendPush" . --include="*.js"

# 2. Check order status endpoint
grep -r "changeOrderStatus" . --include="*.js" -A 20

# 3. Check recent notification logs
tail -f logs/app.log | grep -i notification

# 4. Check database for tokens
psql -d your_database -c "SELECT COUNT(*) FROM device_tokens WHERE is_active = true;"
```

## Create Test Case

To isolate the issue, create a minimal test:

```javascript
// Add this temporary endpoint to your backend:
router.post('/test-notification/:userId', async (req, res) => {
  const { userId } = req.params;
  
  // 1. Get tokens
  const tokens = await db.query(
    'SELECT player_id FROM device_tokens WHERE user_id = $1',
    [userId]
  );
  
  console.log('Tokens found:', tokens.rows.length);
  
  if (tokens.rows.length === 0) {
    return res.json({ error: 'No tokens found' });
  }
  
  // 2. Try to send
  const token = tokens.rows[0].player_id;
  console.log('Sending to:', token);
  
  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', {
      to: token,
      title: 'Backend Test',
      body: 'Testing from backend',
      sound: 'default',
    });
    
    console.log('Response:', response.data);
    res.json({ success: true, response: response.data });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.json({ error: error.message, details: error.response?.data });
  }
});
```

Call this endpoint and see what happens!

## Next Steps Based on Results

### If backend logs show nothing:
→ Backend notification code not triggering
→ Check if code was accidentally removed/commented out

### If backend logs show "sending" but errors:
→ Share the exact error message
→ Likely credentials or token format issue

### If backend logs show "no tokens found":
→ Token registration issue
→ Check device_tokens table

### If backend logs show "success" but no notification:
→ Token is invalid/expired
→ Re-register device (logout/login)

## Summary

Before assuming it's credentials, let's verify:
1. ✅ Is backend trying to send? (Check logs)
2. ✅ Are tokens in database? (Check DB)
3. ✅ What error appears? (Check error message)

**Then we'll know exactly what to fix!**

