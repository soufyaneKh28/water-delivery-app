# FCM Credentials Setup Guide for Expo Push Notifications

## Problem
Getting error: `InvalidCredentials: Unable to retrieve the FCM server key for the recipient's app`

This error occurs because Expo's push notification service needs FCM V1 credentials (service account key) to send push notifications to Android devices.

## Solution: Upload FCM Service Account Key to Expo

### Step 1: Get FCM Service Account Key from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **miaahaljunaidi**
3. Click the **gear icon** (⚙️) next to "Project Overview" → **Project settings**
4. Navigate to the **Service accounts** tab
5. Click **"Generate new private key"** button
6. Click **"Generate key"** in the confirmation dialog
7. A JSON file will be downloaded (e.g., `miaahaljunaidi-firebase-adminsdk-xxxxx.json`)
8. **Keep this file secure** - it contains sensitive credentials

### Step 2: Upload FCM Credentials to Expo

You have two options:

#### Option A: Using EAS CLI (Recommended)

1. Install EAS CLI if you haven't already:
```bash
npm install -g eas-cli
```

2. Log in to your Expo account:
```bash
eas login
```

3. Navigate to your project directory:
```bash
cd /Users/mac/Downloads/water-delivery-app
```

4. Upload FCM credentials:
```bash
eas credentials
```

5. Follow the prompts:
   - Select **Android**
   - Select **production** (or the build profile you want)
   - Choose **"FCM Server Key (V1)"**
   - Select **"Upload a service account key from a local file"**
   - Provide the path to the downloaded JSON file

#### Option B: Using Expo Dashboard

1. Go to [Expo Dashboard](https://expo.dev/)
2. Navigate to your project: **soufyanekh28/miaah-aljunaidi**
3. Go to **Credentials** section
4. Select **Android**
5. Find **"Google Service Account Key"** or **"FCM V1 Service Account Key"**
6. Click **"Upload"** and select your downloaded service account JSON file

### Step 3: Verify Configuration

After uploading the credentials, you can verify by:

1. Go to your project settings in Expo Dashboard
2. Navigate to **Credentials** → **Android**
3. You should see **"Google Service Account Key"** listed with a green checkmark

### Step 4: Test Push Notifications Again

Now try testing with the [Expo Push Notification Tool](https://expo.dev/notifications):

1. Enter your **Expo push token** from the app
2. Fill in **Message title** and **Message body**
3. For Android, you can also specify:
   - **Channel ID**: "default" (as configured in your app.json)
4. Click **"Send a Notification"**

The notification should now be sent successfully!

## Additional Notes

### About FCM Credentials

- **google-services.json**: Used by the app to connect to Firebase services (local to the app)
- **FCM V1 Service Account Key**: Used by Expo's servers to send push notifications on your behalf

### Security Best Practices

- **Never commit** the service account key JSON file to version control
- Add it to `.gitignore`:
```
*firebase-adminsdk*.json
*service-account*.json
```

- Store it securely (password manager, secure vault, etc.)
- Only upload it to Expo's dashboard or use it with EAS CLI

### Troubleshooting

If you still get errors:

1. **Check Package Name**: Ensure the package name in your app matches Firebase:
   - Firebase: `com.miaahaljunaidi.app` ✓
   - app.json: `com.miaahaljunaidi.app` ✓

2. **Check Project ID**: Ensure you're using the correct Firebase project:
   - Current project: `miaahaljunaidi`

3. **Rebuild the app**: After uploading FCM credentials, rebuild your app:
```bash
eas build --platform android --profile production
```

4. **Check Expo Push Token**: Make sure you're using a valid Expo push token starting with `ExponentPushToken[...]`

### Testing Locally

If you want to test push notifications from your own backend instead of Expo's tool:

```javascript
// Example using expo-server-sdk
const { Expo } = require('expo-server-sdk');
let expo = new Expo();

let messages = [{
  to: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  sound: 'default',
  body: 'Test notification',
  data: { withSome: 'data' },
}];

let chunks = expo.chunkPushNotifications(messages);
let tickets = [];

for (let chunk of chunks) {
  try {
    let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  } catch (error) {
    console.error(error);
  }
}
```

## Summary

The key issue is that **Expo needs FCM V1 credentials uploaded to their servers** to send push notifications to Android devices. Simply having `google-services.json` in your project is not enough for Expo's push notification service to work.

Once you upload the service account key using EAS CLI or the Expo Dashboard, the push notifications will work correctly!


