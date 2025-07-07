# OneSignal Notification Setup Guide

This guide will help you set up OneSignal notifications for your water delivery app.

## Prerequisites

1. OneSignal account (free tier available)
2. Your OneSignal App ID
3. Your OneSignal REST API Key

## Setup Steps

### 1. OneSignal Configuration

1. **Get your OneSignal App ID:**
   - Log in to your OneSignal dashboard
   - Go to Settings > Keys & IDs
   - Copy your OneSignal App ID

2. **Get your REST API Key:**
   - In the same page, copy your REST API Key
   - This is used by your backend to send notifications

### 2. Update Configuration Files

#### Update NotificationService.js
Replace `YOUR_ONESIGNAL_APP_ID` in `app/services/NotificationService.js`:

```javascript
const ONESIGNAL_APP_ID = 'your-actual-onesignal-app-id';
```

#### Update Backend Configuration
In your backend's OneSignal configuration file, update:

```javascript
const ONESIGNAL_REST_API_KEY = 'your-actual-rest-api-key';
const ONESIGNAL_APP_ID = 'your-actual-onesignal-app-id';
```

### 3. Supabase Database Setup

Make sure you have the `user_devices` table in your Supabase database with the following structure:

```sql
CREATE TABLE user_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  device_type TEXT DEFAULT 'mobile',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_player_id ON user_devices(player_id);

-- Create unique constraint to prevent duplicate devices
CREATE UNIQUE INDEX idx_user_devices_unique ON user_devices(user_id, player_id);
```

### 4. App Configuration

The app is already configured with OneSignal in `app.json`. Make sure the following is present:

```json
{
  "expo": {
    "plugins": [
      [
        "onesignal-expo-plugin",
        {
          "mode": "development"
        }
      ]
    ]
  }
}
```

### 5. Testing the Implementation

1. **Build and run the app:**
   ```bash
   npx expo run:ios
   # or
   npx expo run:android
   ```

2. **Test notification registration:**
   - Log in as a user
   - Check the console logs for "OneSignal initialized successfully"
   - Verify that the user is registered for notifications

3. **Test notification sending:**
   - Use the notification settings screen to test notifications
   - Check that the `player_id` is saved to the `user_devices` table

## How It Works

### For Admin Users:
1. When an admin logs in, their device is registered with OneSignal
2. The `player_id` is saved to the `user_devices` table
3. When a new order is created, your backend sends notifications to all admin devices
4. Admins receive notifications about new orders

### For Client Users:
1. When a client logs in, their device is registered with OneSignal
2. The `player_id` is saved to the `user_devices` table
3. When an order status changes, your backend sends notifications to the client's device
4. Clients receive notifications about order status updates

## Notification Flow

1. **User Login:**
   - OneSignal initializes
   - User device gets a `player_id`
   - `player_id` is saved to `user_devices` table
   - User is registered for notifications

2. **New Order (Admin Notification):**
   - Client places an order
   - Backend calls `sendNotificationForNewOrder(orderId)`
   - Backend fetches all admin `player_id`s from `user_devices` table
   - Notification is sent to all admin devices

3. **Order Status Update (Client Notification):**
   - Admin updates order status
   - Backend calls `sendNotificationForStatusChange(order)`
   - Backend fetches client's `player_id` from `user_devices` table
   - Notification is sent to client's device

4. **User Logout:**
   - User device is unregistered from OneSignal
   - `player_id` is removed from `user_devices` table

## Troubleshooting

### Common Issues:

1. **Notifications not working:**
   - Check that OneSignal App ID is correct
   - Verify notification permissions are granted
   - Check console logs for errors

2. **Player ID not saved:**
   - Check Supabase connection
   - Verify `user_devices` table exists
   - Check for database permission errors

3. **Backend notifications failing:**
   - Verify REST API key is correct
   - Check that `player_id`s exist in database
   - Review backend logs for errors

### Debug Steps:

1. **Check OneSignal initialization:**
   ```javascript
   console.log('Player ID:', await OneSignal.User.pushSubscription.getPushSubscriptionId());
   ```

2. **Check database entries:**
   ```sql
   SELECT * FROM user_devices WHERE user_id = 'your-user-id';
   ```

3. **Test notification sending:**
   Use OneSignal dashboard to send test notifications

## Security Considerations

1. **API Keys:**
   - Never commit API keys to version control
   - Use environment variables for sensitive data
   - Rotate API keys regularly

2. **User Data:**
   - Only store necessary device information
   - Implement proper data deletion on logout
   - Follow GDPR/privacy regulations

3. **Notification Content:**
   - Sanitize notification content
   - Don't include sensitive information in notifications
   - Use appropriate notification channels

## Additional Features

### Custom Notification Channels (Android)
You can create custom notification channels for different types of notifications:

```javascript
// In your backend notification sending
{
  android_channel_id: 'orders',
  // ... other notification data
}
```

### Rich Notifications
You can send rich notifications with images and actions:

```javascript
{
  headings: { en: 'Order Update' },
  contents: { en: 'Your order has been confirmed' },
  big_picture: 'https://example.com/image.jpg',
  buttons: [
    { id: 'view_order', text: 'View Order' },
    { id: 'contact_support', text: 'Contact Support' }
  ]
}
```

### Notification History
You can implement notification history by storing notifications in your database and displaying them in the app.

## Support

If you encounter any issues:

1. Check the OneSignal documentation
2. Review console logs for errors
3. Test with OneSignal dashboard
4. Verify database connections and permissions

## Files Modified/Created

- `app/services/NotificationService.js` - Main notification service
- `app/context/AuthContext.js` - Integrated notification registration
- `app/index.jsx` - Added OneSignal initialization
- `app/screens/client/NotificationSettingsScreen.jsx` - Client notification settings
- `app/screens/admin/NotificationSettingsScreen.jsx` - Admin notification settings
- `NOTIFICATION_SETUP.md` - This setup guide 