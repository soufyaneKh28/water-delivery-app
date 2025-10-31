# Quick Fix Summary for FIS_AUTH_ERROR

## The Problem
You changed your package name and created a new Firebase project, but the new `google-services.json` has an empty `oauth_client` array, causing `FIS_AUTH_ERROR`.

## The Solution (3 Steps)

### Step 1: Add SHA Fingerprints to Firebase Console

Your SHA fingerprints are:
```
SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
SHA256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
```

1. Go to https://console.firebase.google.com/
2. Open your **miaahaljunaidi** project
3. Click gear icon ⚙️ → **Project settings**
4. Scroll to "Your apps" → Click on `com.miaahaljunaidi.app`
5. Find "**SHA certificate fingerprints**" section
6. Click "**Add fingerprint**"
7. Paste the **SHA1** value above
8. Click "**Add fingerprint**" again  
9. Paste the **SHA256** value above

### Step 2: Download New google-services.json

1. Still in Firebase Console, in your Android app settings
2. Click "**Download google-services.json**"
3. Replace your current `google-services.json` file (root folder)
4. Also replace `android/app/google-services.json` with the same file

**Important:** The new file should have the `oauth_client` array populated (not empty).

### Step 3: Rebuild Your App

```bash
cd android && ./gradlew clean && cd ..
npx expo prebuild --clean
npx expo run:android
```

Or with EAS Build:
```bash
eas build --platform android --profile development --clear-cache
```

## What Changed in Your Code

I've already made these changes:
- ✅ Added `POST_NOTIFICATIONS` permission to `AndroidManifest.xml` (required for Android 13+)
- ✅ Added `expo-notifications` plugin to `app.json`
- ✅ Restored Google Services configuration (you need this for Firebase)

## Result

After adding SHA fingerprints and rebuilding:
- ✅ No more `FIS_AUTH_ERROR`
- ✅ Notifications work on Android
- ✅ Firebase properly initialized

## Need More Details?

- **Detailed Firebase setup**: See `FIREBASE_OAUTH_FIX.md`
- **General Android notifications**: See `ANDROID_NOTIFICATION_FIX.md`
- **Get SHA fingerprints again**: Run `bash scripts/get-sha-fingerprints.sh`

## Why This Happens

Firebase needs SHA certificate fingerprints to:
1. Generate OAuth client configuration
2. Enable secure communication between your app and Firebase
3. Properly initialize Firebase Installation Service (FIS)

Without SHA fingerprints → Empty `oauth_client` → `FIS_AUTH_ERROR`


