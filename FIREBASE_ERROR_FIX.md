# Firebase FIS_AUTH_ERROR Fix

## Problem
The app shows an error alert with `FIS_AUTH_ERROR` after creating a new Firebase project with a new package name.

## Root Cause
1. Package name was changed and a new Firebase project was created
2. The new `google-services.json` file has an **empty `oauth_client` array**
3. Firebase Installation Service fails because OAuth client configuration is missing
4. OAuth client is only generated when **SHA certificate fingerprints** are added to Firebase Console

## Solution (Updated January 2025)

### The Correct Fix: Add SHA Fingerprints to Firebase

Your notifications **were working before** with Firebase, so you need to keep Firebase properly configured.

#### Your SHA Fingerprints (Debug Keystore)
```
SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
SHA256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
```

#### Steps to Fix:

1. **Go to Firebase Console**
   - Visit https://console.firebase.google.com/
   - Open project: **miaahaljunaidi**

2. **Add SHA Fingerprints**
   - Click gear icon ⚙️ → Project settings
   - Find your Android app: `com.miaahaljunaidi.app`
   - Scroll to "SHA certificate fingerprints"
   - Click "Add fingerprint" and paste SHA1
   - Click "Add fingerprint" and paste SHA256

3. **Download New google-services.json**
   - In Firebase Console, click "Download google-services.json"
   - Replace your current `google-services.json` file
   - Also replace `android/app/google-services.json`
   - Verify the new file has `oauth_client` array populated

4. **Rebuild Your App**
   ```bash
   cd android && ./gradlew clean && cd ..
   npx expo prebuild --clean
   npx expo run:android
   ```

### What Changed in Code

I've already updated:
- ✅ Added `POST_NOTIFICATIONS` permission to `AndroidManifest.xml`
- ✅ Added `expo-notifications` plugin to `app.json`
- ✅ Kept Firebase/Google Services configuration (you need this!)

### Why SHA Fingerprints Are Required

Firebase uses SHA fingerprints to:
- Generate OAuth client configuration
- Enable secure Firebase ↔ App communication
- Initialize Firebase Installation Service (FIS)
- Support Firebase Authentication and other Firebase services

**Without SHA fingerprints:**
- `oauth_client` array is empty in `google-services.json`
- Firebase Installation Service can't initialize
- Result: `FIS_AUTH_ERROR`

**With SHA fingerprints:**
- Firebase generates OAuth client configuration
- `oauth_client` array is populated
- Firebase initializes successfully
- Notifications work properly

## Previous Temporary Workaround (Not Needed Anymore)

Previously, error handling was added to suppress the error:
- `app/context/NotificationContext.jsx` - Lines 106-123
- `app/screens/client/Home.jsx` - Lines 100-114

**This suppression is still in place** but once you add SHA fingerprints and update `google-services.json`, the error won't occur at all.

## Quick Reference

- **Detailed Firebase setup**: See `FIREBASE_OAUTH_FIX.md`
- **Quick summary**: See `QUICK_FIX_SUMMARY.md`
- **Get SHA fingerprints**: Run `bash scripts/get-sha-fingerprints.sh`

## Date
Updated: January 2025

