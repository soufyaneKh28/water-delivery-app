# Firebase OAuth Client Fix for FIS_AUTH_ERROR

## Problem
After creating a new Firebase project with your new package name, the `google-services.json` file has an empty `oauth_client` array, causing `FIS_AUTH_ERROR`.

## Root Cause
The new Firebase project doesn't have the required OAuth client configuration. This happens when:
1. You create a new Firebase project
2. You add an Android app to the project
3. BUT you don't add the SHA certificate fingerprints

Firebase needs the SHA fingerprints to generate the OAuth client configuration.

## Solution: Add SHA Certificates to Firebase

### Step 1: Get Your SHA-1 and SHA-256 Fingerprints

#### For Debug Build (Development)
Run this command in your project root:

```bash
cd android && ./gradlew signingReport
```

Look for the output under `Variant: debug` and `Config: debug`:
```
SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
SHA-256: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

Copy both the SHA-1 and SHA-256 values.

#### Alternative Method (Using Keytool)
```bash
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Step 2: Add SHA Fingerprints to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **miaahaljunaidi**
3. Click on the gear icon ⚙️ next to "Project Overview"
4. Click "Project settings"
5. Scroll down to "Your apps" section
6. Find your Android app (`com.miaahaljunaidi.app`)
7. Click on it to expand
8. Scroll down to "SHA certificate fingerprints"
9. Click "Add fingerprint"
10. Paste your **SHA-1** fingerprint
11. Click "Add fingerprint" again
12. Paste your **SHA-256** fingerprint

### Step 3: Download Updated google-services.json

1. Still in Firebase Console, in your Android app settings
2. Click "Download google-services.json" button
3. Replace your current `google-services.json` file with the new one
4. Also replace `android/app/google-services.json` with the same file

The new file should now have the `oauth_client` array populated with entries.

### Step 4: Verify the New google-services.json

Open the new `google-services.json` and check that the `oauth_client` array is NOT empty:

```json
{
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:991105949975:android:47ad1525ee733e8b7a5752",
        "android_client_info": {
          "package_name": "com.miaahaljunaidi.app"
        }
      },
      "oauth_client": [
        {
          "client_id": "XXXXX.apps.googleusercontent.com",
          "client_type": 3
        }
      ],
      "api_key": [
        {
          "current_key": "AIzaSyBrcYkc_jxpmv3cAzOc_Ht1Tb5PRpvvRZA"
        }
      ],
      ...
    }
  ]
}
```

The `oauth_client` array should now have at least one entry.

### Step 5: Rebuild Your App

After updating the `google-services.json`:

```bash
cd android && ./gradlew clean && cd ..
npx expo prebuild --clean
npx expo run:android
```

Or with EAS Build:
```bash
eas build --platform android --profile development --clear-cache
```

## Important Notes

### For Production Builds
When you create a production keystore for release builds, you'll need to:
1. Generate SHA fingerprints from your production keystore
2. Add those fingerprints to Firebase Console as well
3. Download the updated `google-services.json` again

To get SHA from production keystore:
```bash
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

### Package Name Must Match
Ensure the package name in Firebase matches exactly:
- Firebase Console Android app: `com.miaahaljunaidi.app`
- `android/app/build.gradle`: `applicationId 'com.miaahaljunaidi.app'`
- `app.json`: `"package": "com.miaahaljunaidi.app"`

### Multiple Apps
If you have both a development and production version of your app:
1. Add both as separate Android apps in Firebase
2. Each with their own package name
3. Each with their own SHA fingerprints

## Verification

After rebuilding with the updated `google-services.json`:

1. Install the app on a physical Android device
2. Open the app
3. You should NOT see the `FIS_AUTH_ERROR` anymore
4. Notifications should work properly
5. Check logcat for successful Firebase initialization:
   ```
   Firebase app initialized successfully
   ```

## Troubleshooting

### Still seeing FIS_AUTH_ERROR?
1. Verify the `oauth_client` array is not empty in `google-services.json`
2. Make sure you replaced BOTH copies:
   - `/google-services.json` (root)
   - `/android/app/google-services.json`
3. Clean and rebuild completely:
   ```bash
   cd android && ./gradlew clean
   rm -rf android/app/build
   cd ..
   npx expo prebuild --clean
   npx expo run:android
   ```

### Wrong package name?
If you see errors about package name mismatch:
1. Check `android/app/build.gradle` → `applicationId`
2. Check `app.json` → `android.package`
3. Check Firebase Console → Your Android app → Package name
4. All three must match exactly

### Can't find SHA fingerprints?
Make sure you have:
- Android SDK installed
- Java/JDK installed
- Run the command from the project root directory
- The `android/app/debug.keystore` file exists

## Why This Happens

When you create a new Firebase project:
1. You add an Android app with a package name
2. Firebase generates a basic `google-services.json`
3. BUT without SHA fingerprints, Firebase can't create the OAuth client
4. The empty `oauth_client` causes Firebase Installation Service (FIS) to fail
5. This results in `FIS_AUTH_ERROR`

Adding the SHA fingerprints allows Firebase to:
- Generate the OAuth client configuration
- Enable proper Firebase app initialization
- Allow notifications and other Firebase services to work

## Date
Created: January 2025


