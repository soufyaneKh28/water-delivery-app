# Push Notification Architecture Explained

## Understanding FCM Credentials for Expo Push Notifications

### The Two Types of FCM Files

```
┌─────────────────────────────────────────────────────────────────┐
│                    FCM Credential Files                         │
└─────────────────────────────────────────────────────────────────┘

1. google-services.json (✓ You have this)
   ├─ Location: In your app bundle
   ├─ Purpose: Allows your app to connect to Firebase
   ├─ Used by: Your mobile app (client-side)
   └─ Contains: Project info, API keys, client IDs

2. Service Account Key JSON (✗ You need to upload this)
   ├─ Location: Uploaded to Expo servers
   ├─ Purpose: Allows Expo to send notifications on your behalf
   ├─ Used by: Expo Push Service (server-side)
   └─ Contains: Private key, service account credentials
```

## The Problem

```
┌──────────────┐                    ┌──────────────┐
│   Your App   │                    │    Expo      │
│   (Android)  │                    │    Servers   │
│              │                    │              │
│ ✓ Has Push   │                    │ ✗ Cannot     │
│   Token      │                    │   Send to    │
│              │                    │   FCM        │
│ ✓ Has        │                    │              │
│   google-    │                    │ Missing FCM  │
│   services   │                    │ Credentials! │
│   .json      │                    │              │
└──────────────┘                    └──────────────┘
       │                                   │
       │                                   │
       └───────────────┬───────────────────┘
                       │
                       ▼
                ┌──────────────┐
                │   Firebase   │
                │     FCM      │
                │              │
                │ ❌ Cannot    │
                │    verify    │
                │    Expo's    │
                │    request   │
                └──────────────┘

Error: "InvalidCredentials: Unable to retrieve the FCM server key"
```

## The Solution

```
┌──────────────┐                    ┌──────────────┐
│   Your App   │                    │    Expo      │
│   (Android)  │                    │    Servers   │
│              │                    │              │
│ ✓ Has Push   │                    │ ✓ Has FCM    │
│   Token      │                    │   Service    │
│              │                    │   Account    │
│ ✓ Has        │                    │   Key        │
│   google-    │                    │              │
│   services   │                    │ Can send     │
│   .json      │                    │ to FCM!      │
└──────────────┘                    └──────────────┘
       │                                   │
       │          Notification             │
       │◄──────────────────────────────────│
       │                                   │
       └───────────────┬───────────────────┘
                       │
                       ▼
                ┌──────────────┐
                │   Firebase   │
                │     FCM      │
                │              │
                │ ✓ Verifies   │
                │   Expo's     │
                │   request    │
                │              │
                │ ✓ Delivers   │
                │   push       │
                └──────────────┘

Success: Notification delivered!
```

## How Push Notifications Flow

### Current Flow (Not Working)

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Test notification on expo.dev/notifications             │
│                                                                  │
│  User Action:                                                   │
│  • Enter Expo push token: ExponentPushToken[xxxxx]             │
│  • Enter message: "Test notification"                           │
│  • Click "Send"                                                 │
│                                                                  │
│  ❌ Result: InvalidCredentials error                            │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Expo tries to send to FCM                               │
│                                                                  │
│  Expo Server attempts:                                          │
│  • Parse token → Find it's for Android (FCM)                   │
│  • Look up FCM credentials for project                          │
│  • ❌ NOT FOUND! No service account key uploaded               │
│                                                                  │
│  Error: Cannot authenticate with Firebase                       │
└─────────────────────────────────────────────────────────────────┘
```

### Fixed Flow (After Uploading Credentials)

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Test notification on expo.dev/notifications             │
│                                                                  │
│  User Action:                                                   │
│  • Enter Expo push token: ExponentPushToken[xxxxx]             │
│  • Enter message: "Test notification"                           │
│  • Click "Send"                                                 │
│                                                                  │
│  ✓ Request sent to Expo servers                                │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Expo sends to FCM                                       │
│                                                                  │
│  Expo Server:                                                   │
│  • Parse token → Android device (FCM)                           │
│  • Look up FCM credentials for project                          │
│  • ✓ FOUND! Service account key exists                         │
│  • Sign request with service account credentials                │
│  • Send to FCM API                                              │
│                                                                  │
│  ✓ Authenticated successfully                                   │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: FCM delivers to device                                  │
│                                                                  │
│  Firebase Cloud Messaging:                                      │
│  • Verify Expo's credentials ✓                                  │
│  • Find device with matching token                              │
│  • Deliver notification to device                               │
│                                                                  │
│  ✓ Notification delivered!                                      │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: User sees notification                                  │
│                                                                  │
│  Android Device:                                                │
│  • Receive notification from FCM                                │
│  • Display in notification tray                                 │
│  • Play sound/vibration                                         │
│  • Update badge count                                           │
│                                                                  │
│  🔔 "Test notification"                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Fix Steps

### 1. Get the Service Account Key

Go to Firebase Console and download the private key:

```bash
https://console.firebase.google.com/
→ Select project: miaahaljunaidi
→ ⚙️ Project settings
→ Service accounts tab
→ "Generate new private key"
→ Download: miaahaljunaidi-firebase-adminsdk-xxxxx.json
```

### 2. Upload to Expo

Run the automated script:

```bash
cd /Users/mac/Downloads/water-delivery-app
./scripts/setup-fcm-credentials.sh
```

Or manually with EAS CLI:

```bash
eas login
eas credentials
# Select: Android → production → Google Service Account
# Upload the downloaded JSON file
```

### 3. Test Again

Go back to [expo.dev/notifications](https://expo.dev/notifications) and test again!

## Key Concepts

### Why Two Files?

| File | Purpose | Location | Access Level |
|------|---------|----------|--------------|
| `google-services.json` | Client configuration | In your app | Public (can be in source code) |
| `service-account.json` | Server authentication | Expo servers | **Private** (never commit!) |

### Security Note

- ✓ `google-services.json` - Safe to commit to git
- ✗ `service-account.json` - **NEVER commit** (contains private keys)

Your `.gitignore` has been updated to prevent accidental commits of service account keys.

## Common Questions

### Q: Why does iOS work but Android doesn't?

**A:** iOS uses Apple Push Notification service (APNs) with certificates that are automatically managed by Expo/EAS. Android uses FCM which requires explicit service account credentials.

### Q: Do I need to rebuild my app?

**A:** No! The service account key is only used by Expo's servers. Your app doesn't need any changes or rebuilding.

### Q: Is this a one-time setup?

**A:** Yes! Once uploaded, the credentials persist for your project unless you revoke/change them in Firebase.

### Q: Can I test without the Expo tool?

**A:** Yes! Once credentials are uploaded, you can send notifications from your own backend using the Expo Push API or `expo-server-sdk-node`.

### Q: What if I have multiple apps?

**A:** Each Firebase project needs its own service account key uploaded to Expo. If you have multiple apps using the same Firebase project, you only need to upload once.

## Resources

- 📚 [Expo Push Notifications Overview](https://docs.expo.dev/push-notifications/overview/)
- 🔥 [Firebase Console](https://console.firebase.google.com/)
- 🎯 [Expo Notification Tool](https://expo.dev/notifications)
- 📖 [FCM Setup Guide](./FCM_CREDENTIALS_SETUP_GUIDE.md)
- 🚀 [Setup Script](./scripts/setup-fcm-credentials.sh)


