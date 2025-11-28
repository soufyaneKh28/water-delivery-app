# Android App Bundle Signing Key Fix

## Problem
Your Android App Bundle is signed with a different key than the previous release:

**Expected (Previous Release):**
- SHA1: `93:99:CE:F0:CC:9F:A1:23:0F:5F:77:D0:41:2C:0C:E5:0F:B3:B3:8C`

**Current Upload:**
- SHA1: `AF:E0:52:11:C3:C9:58:76:81:F2:47:D3:7C:C5:D2:3D:68:12:84:58`

## Solutions

You have **3 options** depending on your situation:

### Option 1: Use Google Play App Signing (Recommended - If You Don't Have the Original Key)

If you've enabled Google Play App Signing (Google manages your signing key):
1. **Generate a new upload key** for EAS to use
2. **Add it to Google Play Console** as an upload certificate

**Steps:**
1. Generate a new upload keystore:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore upload-keystore.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
   ```
   (Remember the passwords you enter!)

2. Get the SHA-1 fingerprint:
   ```bash
   keytool -list -v -keystore upload-keystore.jks -alias upload
   ```

3. In Google Play Console:
   - Go to **Release** → **Setup** → **App signing**
   - Click **Add upload key**
   - Upload your new `upload-keystore.jks` or provide the SHA-1 fingerprint

4. Upload the keystore to EAS:
   ```bash
   eas credentials
   # Select: Android
   # Select: production
   # Choose: Set up a new keystore
   # Upload your upload-keystore.jks file
   ```

### Option 2: Use the Original Keystore (If You Have It)

If you have the original keystore that was used for the previous release:

1. **Find your original keystore file** (the one that generates SHA1: `93:99:CE:F0:CC:9F:A1:23:0F:5F:77:D0:41:2C:0C:E5:0F:B3:B3:8C`)

2. **Verify it's the correct one:**
   ```bash
   keytool -list -v -keystore your-original-keystore.jks -alias your-alias
   ```
   The SHA1 should match: `93:99:CE:F0:CC:9F:A1:23:0F:5F:77:D0:41:2C:0C:E5:0F:B3:B3:8C`

3. **Upload to EAS:**
   ```bash
   eas credentials
   # Select: Android
   # Select: production
   # Choose: Use existing keystore
   # Upload your original keystore file
   ```

### Option 3: Reset App Signing (Only if This is First Upload or Test)

⚠️ **WARNING: This will prevent updates to existing users!**

Only use this if:
- No users have the app installed yet
- This is a test app
- You don't care about existing installations

1. In Google Play Console:
   - Go to **Release** → **Setup** → **App signing**
   - Reset app signing (if available)
   - Or create a completely new app listing

2. Build with a new key:
   ```bash
   eas build --platform android --profile production
   ```

## Recommended: Check Your Current EAS Credentials

First, check what credentials EAS is currently using:

```bash
eas credentials
```

Select:
- **Android**
- **production**

This will show you:
- If credentials exist
- What key is being used
- Option to update them

## Quick Steps Summary

### If Using Google Play App Signing:

1. Generate new upload keystore
2. Add upload certificate to Google Play Console
3. Upload keystore to EAS credentials
4. Rebuild and upload

### If You Have Original Keystore:

1. Verify SHA1 matches expected value
2. Upload keystore to EAS credentials  
3. Rebuild and upload

## Important Notes

- **Once an app is published, you MUST use the same signing key for updates**
- **Google Play App Signing** allows you to use different upload keys (Google re-signs with the app signing key)
- **EAS Build** can store and reuse your keystore automatically
- **Keep your keystore file safe!** If you lose it, you can't update your app.

## Next Steps

1. Run `eas credentials` to see current setup
2. Choose one of the options above based on your situation
3. Upload the correct keystore
4. Rebuild: `eas build --platform android --profile production`
5. Upload to Google Play Console



