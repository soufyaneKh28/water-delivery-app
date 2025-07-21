# Global Notification System for Admin Side

## Overview

The admin side now has a global notification system that handles push notification permissions and token management across all admin screens. The system automatically requests permissions when the dashboard loads and stores the push token globally for use throughout the admin interface.

## Key Features

### 🔔 **Global Permission Management**
- Automatic permission request when dashboard loads
- Persistent storage of permission status and push token
- Native permission modal appears when needed
- Graceful handling of permission denial

### 💾 **Persistent Storage**
- Push token stored in AsyncStorage
- Permission status tracked and stored
- Data persists across app restarts
- No need to re-request permissions

### 🌐 **Global Context**
- Single notification context for all admin screens
- Shared push token across all components
- Centralized notification management
- Easy access from any admin screen

## Implementation

### 1. Notification Context (`app/context/NotificationContext.jsx`)

The core of the global notification system:

```javascript
export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  
  // Auto-request permission when dashboard loads
  const initializePermissionRequest = async () => {
    if (!hasRequestedPermission && !isLoading) {
      await requestNotificationPermission();
    }
  };
};
```

### 2. Admin Navigator Integration

The `NotificationProvider` wraps all admin screens:

```javascript
export default function AdminNavigator() {
  return (
    <NotificationProvider>
      <Stack.Navigator>
        {/* All admin screens */}
      </Stack.Navigator>
    </NotificationProvider>
  );
}
```

### 3. Dashboard Auto-Initialization

The dashboard automatically triggers permission request:

```javascript
export default function AdminDashboard() {
  const { initializePermissionRequest } = useNotification();
  
  useEffect(() => {
    initializePermissionRequest();
  }, [initializePermissionRequest]);
}
```

## Usage

### Accessing Notification Data

Any admin screen can access notification data:

```javascript
import { useNotification } from '../../context/NotificationContext';

const MyAdminScreen = () => {
  const { 
    expoPushToken, 
    notification, 
    permissionStatus,
    adminNotifications 
  } = useNotification();
  
  // Use notification data
};
```

### Sending Notifications

Use the predefined admin notifications:

```javascript
// Send test notification
await adminNotifications.sendTestNotification(expoPushToken);

// Send new order notification
await adminNotifications.sendNewOrderNotification(expoPushToken, orderNumber);

// Send status update notification
await adminNotifications.sendOrderStatusUpdateNotification(expoPushToken, orderNumber, status);
```

### Permission Request Component

The `NotificationPermissionRequest` component shows a banner when permissions are needed:

```javascript
import NotificationPermissionRequest from '../../components/admin/NotificationPermissionRequest';

// In your screen
<NotificationPermissionRequest />
```

## Flow

### 1. Dashboard Load
1. Dashboard loads and calls `initializePermissionRequest()`
2. System checks if permission has been requested before
3. If not requested, shows native permission modal
4. If granted, gets push token and stores it
5. If denied, shows custom alert with settings option

### 2. Permission Storage
- Permission status stored in AsyncStorage
- Push token stored in AsyncStorage
- Data persists across app sessions

### 3. Global Access
- All admin screens can access the same push token
- No need to re-request permissions
- Consistent notification state across app

## Storage Keys

```javascript
const STORAGE_KEYS = {
  PUSH_TOKEN: 'admin_push_token',
  NOTIFICATION_PERMISSION: 'admin_notification_permission',
};
```

## Admin Notification Types

### Predefined Notifications

1. **Test Notification**
   - Title: "اختبار الإشعارات"
   - Body: "هذا إشعار تجريبي من لوحة الإدارة"

2. **New Order Notification**
   - Title: "طلب جديد"
   - Body: "لديك طلب جديد برقم #[orderNumber]"

3. **Order Status Update**
   - Title: "تحديث حالة الطلب"
   - Body: "تم تحديث حالة الطلب #[orderNumber] إلى [status]"

4. **Low Stock Alert**
   - Title: "تنبيه المخزون"
   - Body: "المنتج [productName] منخفض في المخزون"

5. **Daily Summary**
   - Title: "ملخص اليوم"
   - Body: "تم إنجاز [ordersCount] طلب بإجمالي ربح [totalProfit] دينار"

## Error Handling

### Permission Denied
- Shows Arabic alert explaining importance
- Option to open app settings
- Graceful degradation - app continues to work

### Token Generation Failed
- Logs error for debugging
- Continues without notifications
- No app crash

### Network Issues
- Retry logic for failed requests
- Timeout protection (10 seconds)
- Graceful error handling

## Benefits

### 🚀 **Performance**
- Single permission request
- No duplicate token generation
- Efficient storage and retrieval

### 🛡️ **Reliability**
- Persistent storage prevents data loss
- Error handling prevents crashes
- Graceful degradation

### 🎯 **User Experience**
- Automatic permission handling
- Clear Arabic messaging
- Consistent behavior across screens

### 🔧 **Developer Experience**
- Easy to use hook (`useNotification`)
- Predefined notification types
- Centralized management

## Testing

### Test Notification Button
Both Dashboard and Orders screens have test buttons:

```javascript
<Button
  title="Send Test Notification"
  onPress={async () => {
    if (expoPushToken) {
      await adminNotifications.sendTestNotification(expoPushToken);
    } else {
      alert('Push token not available. Please check notification permissions.');
    }
  }}
  disabled={!expoPushToken}
/>
```

### Debug Information
The notification test section shows:
- Permission status
- Has requested permission
- Loading state
- Push token availability
- Received notification details

## Future Enhancements

1. **Notification Categories**: Different notification types for different admin roles
2. **Custom Notifications**: Allow admins to send custom notifications
3. **Notification History**: Track sent and received notifications
4. **Settings Integration**: Link to app settings for permission management
5. **Background Sync**: Periodic token refresh and validation 