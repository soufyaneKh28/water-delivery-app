# Backend FCM Credentials Update - URGENT

## Situation

- ✅ Backend WAS sending notifications automatically (before package change)
- ✅ Expo notification tool WORKS (after uploading new credentials)
- ❌ Backend notifications DON'T WORK (still using old credentials)

## Root Cause

When you changed the Android package name:
- `com.?????.???` (OLD) → `com.miaahaljunaidi.app` (NEW)

You updated the Expo credentials, but your **backend still has the OLD Firebase credentials!**

```
┌─────────────────────────────────────────────────────────┐
│                  Firebase Credentials                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Expo (for notification tool):                          │
│  ✅ NEW credentials → Works                             │
│                                                          │
│  Backend (for automatic notifications):                 │
│  ❌ OLD credentials → Fails silently                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Where Backend Stores FCM Credentials

Your backend likely has FCM credentials in one of these places:

### Option 1: Service Account JSON File

```javascript
// Backend code might have:
const serviceAccount = require('./firebase-adminsdk-OLD.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

### Option 2: Environment Variables

```bash
# .env file or environment config
FIREBASE_PROJECT_ID=old-project-id
FIREBASE_PRIVATE_KEY=old-private-key
FIREBASE_CLIENT_EMAIL=old-client-email
```

### Option 3: FCM Server Key (Legacy)

```javascript
// Might be using old FCM server key
const FCM_SERVER_KEY = 'OLD-SERVER-KEY-HERE';
```

## 🔧 How to Fix

### Step 1: Get NEW Service Account Key

You already did this for Expo. You need the SAME file for your backend.

If you don't have it anymore:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select: **miaahaljunaidi**
3. Settings ⚙️ → **Service accounts**
4. Click **"Generate new private key"**
5. Download the JSON file

### Step 2: Update Backend Credentials

#### If using Service Account File:

Replace the old file with the new one:

```bash
# In your backend project
# OLD file: firebase-adminsdk-OLD.json
# NEW file: miaahaljunaidi-firebase-adminsdk-xxxxx.json

# Replace it:
cp ~/Downloads/miaahaljunaidi-firebase-adminsdk-xxxxx.json ./config/firebase-adminsdk.json
```

Then make sure your backend code loads this file:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./config/firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

#### If using Environment Variables:

Update your `.env` file or environment config with values from the new service account JSON:

```bash
# Open the downloaded JSON file and copy these values:
FIREBASE_PROJECT_ID=miaahaljunaidi
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[YOUR NEW KEY]\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@miaahaljunaidi.iam.gserviceaccount.com
```

Then in your backend code:

```javascript
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  })
});
```

#### If using Legacy FCM Server Key:

**Don't use this!** Legacy keys are deprecated. Switch to service account instead.

But if you must update it temporarily:
1. Firebase Console → Project settings → **Cloud Messaging** tab
2. Find "Server key" under "Cloud Messaging API (Legacy)"
3. Copy the new key
4. Update in your backend

### Step 3: Restart Backend

After updating credentials:

```bash
# Restart your backend server
# The exact command depends on your setup:

# If using PM2:
pm2 restart your-app-name

# If using Docker:
docker restart your-container-name

# If using systemd:
sudo systemctl restart your-service-name

# If development:
# Just stop and start your server
```

### Step 4: Test

1. Place an order as client (Android)
2. As admin, change order status
3. Check backend logs for notification success
4. Client should receive notification! ✅

## 🔍 How to Verify Backend Has Old Credentials

### Check Backend Logs

When you change order status, check your backend server logs. You might see:

```
❌ Error sending notification: Invalid credentials
❌ Error: app/invalid-credential
❌ 401 Unauthorized
❌ DeviceNotRegistered
```

These errors mean the backend is using wrong/old credentials.

### Check Backend Configuration Files

Look for Firebase-related files:

```bash
# In your backend project, search for:
find . -name "*firebase*.json"
find . -name "*serviceAccount*.json"
find . -name "*.env"
grep -r "FIREBASE" .env* config/
```

Check the dates on these files - if they're old (before package change), they need updating!

## 📊 Comparison

| Credential Location | Package Name | Status |
|---------------------|--------------|--------|
| **Expo Dashboard** | `com.miaahaljunaidi.app` | ✅ Updated (tool works) |
| **Backend Server** | `com.?????.???` | ❌ OLD (needs update) |

## 🚨 Common Mistakes

### Mistake 1: Only Updating Expo
❌ Uploading new credentials to Expo only affects the push notification tool
✅ Backend needs its OWN copy of the credentials

### Mistake 2: Wrong File Location
❌ Putting new credentials in wrong directory
✅ Check where backend actually loads credentials from

### Mistake 3: Not Restarting Backend
❌ Updating file but not restarting server
✅ Always restart after credential changes

### Mistake 4: Environment Variable Format
❌ Private key needs `\n` properly formatted
✅ Use `.replace(/\\n/g, '\n')` when loading

## 🧪 Quick Test

After updating backend credentials, test with this API call:

```bash
# Test the changeOrderStatus endpoint
curl -X PATCH https://water-supplier-2.onrender.com/api/k1/orders/changeOrderStatus/YOUR_ORDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "processing"}'
```

Then check:
1. ✅ Order status updated?
2. ✅ Notification sent? (check backend logs)
3. ✅ Client received notification?

## 📝 Checklist for Backend Developer

- [ ] Located where backend stores FCM credentials
- [ ] Downloaded NEW service account key from Firebase
- [ ] Backed up OLD credentials (just in case)
- [ ] Replaced OLD credentials with NEW ones
- [ ] Verified file path is correct
- [ ] Updated environment variables (if using)
- [ ] Restarted backend server
- [ ] Tested by changing order status
- [ ] Checked backend logs for success
- [ ] Verified client received notification

## 🔑 Key Files to Check

In your backend project, look for:

```
/config/firebase-adminsdk.json       ← Service account file
/.env                                 ← Environment variables
/config/firebase.js                   ← Firebase initialization
/src/services/notification.js         ← Notification service
```

## 💡 Quick Debug Commands

```bash
# Find Firebase files in backend
find . -name "*firebase*" -type f | grep -v node_modules

# Check environment variables
cat .env | grep FIREBASE

# Check when credential file was last modified
ls -la config/*firebase* 2>/dev/null || echo "No firebase config found"

# Search for Firebase initialization in code
grep -r "admin.initializeApp" . --include="*.js"
```

## 🎯 Expected Backend Code

After Firebase admin is initialized, your notification code should look like:

```javascript
const admin = require('firebase-admin');

// Send notification
const message = {
  notification: {
    title: '🔔 تحديث حالة الطلب',
    body: `تم تحديث حالة طلبك إلى: ${statusLabel}`
  },
  data: {
    orderId: orderId,
    status: status,
    type: 'order_status_update'
  },
  token: deviceToken // or use tokens: [array]
};

const response = await admin.messaging().send(message);
console.log('✅ Notification sent:', response);
```

## 📚 Additional Resources

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Send Messages to Multiple Devices](https://firebase.google.com/docs/cloud-messaging/send-message)

## Summary

**Problem**: Backend has OLD Firebase credentials for OLD package name

**Solution**: Update backend with NEW Firebase credentials for NEW package name

**Result**: Order status notifications will work again! 🎉

---

**Action Required**: Share this with your backend developer. They need to update the Firebase credentials in your backend server to match the new Android package name.

