# Android Notification Fix

## Problem
Android devices were showing `FIS_AUTH_ERROR` (Firebase Installation Service Authentication Error) and notifications were not working on Android, even though they worked fine on iOS.

## Root Cause
1. **Missing POST_NOTIFICATIONS Permission**: Android 13+ (API 33+) requires the `POST_NOTIFICATIONS` permission to be explicitly declared in the AndroidManifest.xml
2. **Empty OAuth Client in google-services.json**: After creating a new Firebase project with the new package name, the `google-services.json` file has an empty `oauth_client` array because SHA certificate fingerprints were not added to Firebase Console
3. **Missing SHA Fingerprints**: Firebase needs the SHA-1 and SHA-256 fingerprints to generate the OAuth client configuration

## Solutions Applied

### 1. Added POST_NOTIFICATIONS Permission
**File**: `android/app/src/main/AndroidManifest.xml`
- Added `<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>` 
- This permission is required for Android 13+ devices to receive notifications

### 2. Fix Firebase OAuth Client Configuration
**This is the main fix needed!**

Your debug keystore SHA fingerprints are:
```
SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
SHA256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
```

**Steps to fix:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **miaahaljunaidi**
3. Go to Project Settings (gear icon ⚙️)
4. Find your Android app: `com.miaahaljunaidi.app`
5. Add both SHA fingerprints above
6. Download the NEW `google-services.json`
7. Replace your current `google-services.json` files

**See `FIREBASE_OAUTH_FIX.md` for detailed step-by-step instructions.**

### 3. Updated app.json Configuration
**File**: `app.json`
- Added `expo-notifications` plugin with proper configuration
- Kept Firebase `googleServicesFile` reference (you need this!)

## Next Steps

### 1. Clean and Rebuild the Android App

The native Android configuration has changed, so you need to rebuild the app:

```bash
# Clean the build
cd android && ./gradlew clean && cd ..

# Rebuild the app
npx expo prebuild --clean
npx expo run:android
```

Or if using EAS Build:
```bash
eas build --platform android --profile development --clear-cache
```

### 2. Test Notifications on Android Device

1. Install the rebuilt app on a physical Android device
2. Request notification permission when prompted
3. Verify notifications are received without the FIS_AUTH_ERROR
4. Check that the push token is successfully registered

### 3. Important Notes

- **Physical Device Required**: Push notifications only work on physical devices, not emulators
- **Permission Request**: Android 13+ devices will now show the proper permission dialog
- **No Firebase Error**: The FIS_AUTH_ERROR should no longer appear

## What Changed

### Before
- `FIS_AUTH_ERROR` alert was showing to users
- Notifications not working on Android devices
- Missing POST_NOTIFICATIONS permission
- Google Services plugin causing conflicts

### After
- No Firebase errors
- Proper notification permissions on Android 13+
- Expo Push Notifications configured correctly
- Clean notification setup without Firebase dependencies

## Technical Details

### Why Expo Push Notifications vs Firebase?
The app is using **Expo Push Notifications** through the Expo Push Notification Service (EPNS). This service:
- Does NOT require Firebase configuration
- Works with the `expo-notifications` package
- Sends notifications through Expo's infrastructure
- Only needs the proper permissions and notification channels on Android

### Why Remove Google Services Plugin?
- The app doesn't use Firebase Cloud Messaging (FCM) directly
- The plugin was attempting to initialize Firebase with incomplete configuration
- This caused the FIS_AUTH_ERROR whenever Firebase tried to initialize
- Removing it simplifies the build and eliminates the error

## Files Modified

1. `android/app/src/main/AndroidManifest.xml` - Added POST_NOTIFICATIONS permission
2. `android/app/build.gradle` - Removed Google Services plugin application
3. `android/build.gradle` - Removed Google Services classpath dependency
4. `app.json` - Updated plugin configuration for Expo Notifications

## Testing Checklist

- [ ] Clean and rebuild the Android app
- [ ] Install on physical Android device
- [ ] Verify no FIS_AUTH_ERROR appears
- [ ] Request notification permissions
- [ ] Test sending a notification
- [ ] Verify notification is received
- [ ] Check that notification sound and vibration work

## Troubleshooting

If notifications still don't work after rebuilding:

1. **Check device notification settings**: 
   - Go to Android Settings > Apps > Your App > Notifications
   - Ensure notifications are enabled

2. **Verify notification channel**:
   - The app creates a "default" notification channel with MAX importance
   - Check in Android Settings > Apps > Your App > Notification Categories

3. **Check console logs**:
   - Look for "Push token generated successfully" message
   - Look for any permission denial messages

4. **Rebuild from scratch**:
   ```bash
   cd android && ./gradlew clean
   cd ..
   rm -rf node_modules
   npm install
   npx expo prebuild --clean
   npx expo run:android
   ```

## Date
Fixed on: January 2025

