# Fix Android Notifications After Package Name Change

## Problem Summary

- ✅ iOS notifications working (`com.aljunaidiwater.app`)
- ❌ Android notifications NOT working (new package: `com.miaahaljunaidi.app`)
- Changed Android package name due to Play Store account deletion
- FCM credentials in Expo still linked to OLD package name

## Root Cause

When you change the Android package name, Firebase treats it as a **completely different app**. The FCM credentials uploaded to Expo are tied to the OLD package name, so they don't work with the NEW package name.

```
Old Android Package: com.something.old         → Old FCM Credentials in Expo ❌
New Android Package: com.miaahaljunaidi.app    → Need NEW FCM Credentials ✅
iOS Package:        com.aljunaidiwater.app     → Working fine (different service)
```

## Solution: Re-upload FCM Credentials for New Package

### Step 1: Verify Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **miaahaljunaidi**
3. Click ⚙️ → **Project settings**
4. Scroll to **Your apps** section
5. Check if Android app exists with package name: `com.miaahaljunaidi.app`

**If the app exists:**
- ✅ Proceed to Step 2

**If the app does NOT exist:**
1. Click **"Add app"** → Android icon
2. Enter package name: `com.miaahaljunaidi.app`
3. Register the app
4. Download the new `google-services.json` (you already have this)
5. Continue to Step 2

### Step 2: Download NEW Service Account Key

Even if you already have a service account key, you need to ensure it's configured for the new package:

1. In Firebase Console → ⚙️ **Project settings**
2. Go to **Service accounts** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** to download
5. Save the file (e.g., `miaahaljunaidi-firebase-adminsdk-xxxxx.json`)

### Step 3: Remove Old FCM Credentials from Expo (Important!)

Before uploading new credentials, remove the old ones:

```bash
cd /Users/mac/Downloads/water-delivery-app
eas credentials
```

1. Select: **Android**
2. Select: **production** (or your build profile)
3. Select: **Google Service Account Key**
4. Choose: **Remove Google Service Account Key**
5. Confirm removal

### Step 4: Upload NEW FCM Credentials to Expo

```bash
eas credentials
```

1. Select: **Android**
2. Select: **production**
3. Select: **Google Service Account Key**
4. Choose: **Upload a service account key from a local file**
5. Navigate to the JSON file you downloaded in Step 2
6. Confirm upload

You should see:
```
✔ Successfully uploaded service account key
```

### Step 5: Verify in Expo Dashboard

1. Go to [Expo Dashboard](https://expo.dev/)
2. Navigate to your project: **soufyanekh28/miaah-aljunaidi**
3. Go to **Credentials** → **Android** → **production**
4. Verify you see:
   - ✅ **Google Service Account Key** - Present
   - Package name should be: `com.miaahaljunaidi.app`

### Step 6: Rebuild the Android App

After uploading new credentials, rebuild your app:

```bash
# For preview/testing
eas build --platform android --profile preview

# For production
eas build --platform android --profile production
```

### Step 7: Test Notifications

#### Test with Expo Tool

1. Install the newly built app on your Android device
2. Log in and ensure notification permissions are granted
3. Get your Expo push token from the app logs
4. Go to [expo.dev/notifications](https://expo.dev/notifications)
5. Enter your token and send a test notification
6. ✅ Should work now!

#### Test Order Status Notification

1. As client (Android): Place an order
2. As admin: Change the order status
3. Client should receive notification ✅

## Troubleshooting

### Issue: "Still not receiving notifications"

**Check 1: Correct Build Installed?**
Make sure you installed the NEW build (after re-uploading FCM credentials)

```bash
# Check build list
eas build:list --platform android
```

Install the most recent build that was created AFTER you re-uploaded the credentials.

**Check 2: Token Registration**
Check app logs to verify token is being registered:

```
📤 Sending push token to backend...
✅ Token registered with backend successfully
```

**Check 3: FCM Credentials Match**
Verify in Firebase Console:
1. Go to Project settings → Your apps
2. Check that Android app package name is: `com.miaahaljunaidi.app`
3. Verify SHA fingerprints are configured (if using)

### Issue: "Expo credentials command errors"

**Solution**: Update EAS CLI

```bash
npm install -g eas-cli@latest
eas login
```

### Issue: "Multiple Android apps in Firebase"

If you have both old and new package names in Firebase:

**Option 1**: Keep both (recommended)
- Old app for existing users
- New app for new installs
- Upload credentials for NEW app to Expo

**Option 2**: Remove old app
- Only if no users are on old app
- Keep only `com.miaahaljunaidi.app`

## iOS vs Android Differences

| Platform | Package Name | Status | Notes |
|----------|-------------|--------|-------|
| iOS | `com.aljunaidiwater.app` | ✅ Working | Unchanged, no issues |
| Android (Old) | `com.?????.???` | ❌ Deprecated | Play Store deleted |
| Android (New) | `com.miaahaljunaidi.app` | ⚠️ Needs credentials | Current package |

## Important Notes

### Why iOS Still Works

iOS uses **Apple Push Notification service (APNs)** with certificates/keys that are managed by EAS automatically. When you build iOS apps, EAS handles the certificates, so changing the Android package doesn't affect iOS.

### Why Android Stopped Working

Android uses **Firebase Cloud Messaging (FCM)** which requires:
1. Package name registered in Firebase
2. `google-services.json` file with that package name
3. Service account key uploaded to Expo for that specific Firebase project

When you changed the package name, #2 was updated but #3 wasn't, causing the mismatch.

## Verification Checklist

After completing all steps:

- [ ] Firebase has Android app with `com.miaahaljunaidi.app`
- [ ] Downloaded NEW service account key
- [ ] Removed OLD FCM credentials from Expo
- [ ] Uploaded NEW FCM credentials to Expo
- [ ] Rebuilt Android app (new build created)
- [ ] Installed new build on device
- [ ] Tested with Expo notification tool → Works ✅
- [ ] Tested order status change → Works ✅
- [ ] iOS notifications still working → Works ✅

## Quick Reference Commands

```bash
# Login to EAS
eas login

# Manage credentials
eas credentials

# Build Android
eas build --platform android --profile production

# Check build status
eas build:list --platform android

# View project info
eas project:info
```

## Summary

The fix is straightforward:
1. Remove old FCM credentials from Expo
2. Upload new service account key to Expo
3. Rebuild Android app
4. Test notifications

After this, Android notifications will work just like iOS! 🎉

