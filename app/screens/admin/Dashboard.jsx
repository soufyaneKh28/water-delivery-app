import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
// import Svg, { Path } from 'react-native-svg';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../../lib/supabase';
import CustomText from '../../components/common/CustomText';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { colors } from '../../styling/colors';

import AsyncStorage from '@react-native-async-storage/async-storage';




export default function AdminDashboard() {
  const { user, expoPushToken: authExpoPushToken, sendTokenToBackendManually } = useAuth();
  const { 
    expoPushToken, 
    notification, 
    permissionStatus, 
    isLoading: notificationLoading,
    hasRequestedPermission,
    initializePermissionRequest,
    adminNotifications,
    sendTokenToBackendOnce,
    refreshPermissionStatus,
    clearStoredNotificationData,
    syncPushTokenWithAuth
  } = useNotification();
  
  const [refreshing, setRefreshing] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [successRate, setSuccessRate] = useState('0%');
  const [totalProfit, setTotalProfit] = useState('0');

  useEffect(() => {
    const initPushFlow = async () => {
      // Use the notification context's permission request instead of bypassing it
      await initializePermissionRequest();
      
      // Sync push token with auth context
      await syncPushTokenWithAuth();
      
      console.log('expoPushToken (notification):', expoPushToken);
      console.log('expoPushToken (auth):', authExpoPushToken);
      console.log('user?.id', user?.id);
      
      // Try to send token to backend using auth context (which handles it automatically)
      if (authExpoPushToken && user?.id) {
        console.log('🔄 Auth context will handle token registration automatically');
      } else if (expoPushToken && user?.id) {
        console.log('📤 Manual token registration via notification context');
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (accessToken) {
          await sendTokenToBackendOnce(user.id, accessToken, expoPushToken);
        }
      }
    };
    console.log('the useeffect is running');

    initPushFlow();
  }, [initializePermissionRequest, expoPushToken, authExpoPushToken, user?.id, sendTokenToBackendOnce, syncPushTokenWithAuth]);


  const fetchOrdersCount = async () => {
    const today = dayjs().startOf('day');
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
      .lte('created_at', today.endOf('day').toISOString());
    if (!error) setOrdersCount(count || 0);
  };

  const fetchClientsCount = async () => {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (!error) setClientsCount(count || 0);
  };

  const fetchProductsCount = async () => {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    if (!error) setProductsCount(count || 0);
  };

  const fetchSuccessRate = async () => {
    const today = dayjs().startOf('day');
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status')
      .gte('created_at', today.toISOString())
      .lte('created_at', today.endOf('day').toISOString());
    
    if (!error && orders) {
      const totalOrders = orders.length;
      const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
      const rate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
      setSuccessRate(`${rate}%`);
    }
  };

  const fetchTotalProfit = async () => {
    const today = dayjs().startOf('day');
    const { data, error } = await supabase
      .from('orders')
      .select('total, status')
      .eq('status', 'delivered')
      .gte('created_at', today.toISOString())
      .lte('created_at', today.endOf('day').toISOString());
    
    if (!error && data) {
      const sum = data.reduce((acc, order) => acc + (order.total || 0), 0);
      setTotalProfit(sum.toLocaleString());
    }
  };

  React.useEffect(() => {
    fetchOrdersCount();
    fetchClientsCount();
    fetchProductsCount();
    fetchSuccessRate();
    fetchTotalProfit();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([
      fetchOrdersCount(),
      fetchClientsCount(),
      fetchProductsCount(),
      fetchSuccessRate(),
      fetchTotalProfit(),
    ]).finally(() => setRefreshing(false));
  }, []);

  // Example data
  const profitChange = '+15%';

  // Test different request formats
  const testDifferentFormats = async () => {
    if (!user?.id || !expoPushToken) {
      alert('User ID or push token not available');
      return;
    }

    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
      alert('Access token not available');
      return;
    }

    const testCases = [
      {
        name: 'Correct Format (player_id)',
        body: {
          user_id: user.id,
          player_id: expoPushToken,
          device_type: Platform.OS,
        }
      },
      {
        name: 'Alternative Format (userId)',
        body: {
          userId: user.id,
          player_id: expoPushToken,
          device_type: Platform.OS,
        }
      },
      {
        name: 'Alternative Format (expo_push_token)',
        body: {
          user_id: user.id,
          expo_push_token: expoPushToken,
          device_type: Platform.OS,
        }
      },
      {
        name: 'Alternative Format (token)',
        body: {
          user_id: user.id,
          token: expoPushToken,
          device_type: Platform.OS,
        }
      },
      {
        name: 'Alternative Format (push_token)',
        body: {
          user_id: user.id,
          push_token: expoPushToken,
          device_type: Platform.OS,
        }
      },
      {
        name: 'Alternative Format (deviceType)',
        body: {
          user_id: user.id,
          player_id: expoPushToken,
          deviceType: Platform.OS,
        }
      }
    ];

    console.log('🧪 Testing different request formats...');

    for (const testCase of testCases) {
      try {
        console.log(`\n📤 Testing: ${testCase.name}`);
        console.log('📦 Request body:', JSON.stringify(testCase.body, null, 2));

        const response = await fetch('https://water-supplier-2.onrender.com/api/k1/notifications/registerDevice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(testCase.body),
        });

        console.log(`📡 Response status: ${response.status}`);

        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ SUCCESS with format:', testCase.name);
          console.log('📦 Response data:', responseData);
          alert(`✅ SUCCESS with format: ${testCase.name}`);
          return;
        } else {
          const errorText = await response.text();
          console.log(`❌ FAILED with format: ${testCase.name}`);
          console.log('❌ Error response:', errorText);
        }
      } catch (error) {
        console.log(`❌ ERROR with format: ${testCase.name}`, error);
      }
    }

    alert('❌ All formats failed. Check console for details.');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ flexGrow: 1 , paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]} // Android
            tintColor={colors.primary} // iOS
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeRow}>
          <View style={{  }}>
            <CustomText type="bold" style={styles.welcomeTitle}>مرحباً بعودتك!</CustomText>
            <CustomText type="regular" style={styles.welcomeSubtitle}>{user?.user_metadata?.username || ''}</CustomText>
          </View>
          <View style={styles.avatarCircle}>
            <Ionicons name="water-outline" size={28} color={colors.primary} />
          </View>
        </View>

        {/* Notification Permission Request */}
        {/* <NotificationPermissionRequest /> */}
        
        {/* Notification Debug Info */}
        {/* <NotificationDebugInfo /> */}

        {/* Notification Test Section */}
        {/* <View style={styles.notificationSection}>
          <CustomText type="bold" style={styles.notificationTitle}>Push Notification Test</CustomText>
          <Text style={styles.notificationText}>Permission Status: {permissionStatus}</Text>
          <Text style={styles.notificationText}>Has Requested: {hasRequestedPermission ? 'Yes' : 'No'}</Text>
          <Text style={styles.notificationText}>Loading: {notificationLoading ? 'Yes' : 'No'}</Text>
          <Text style={styles.notificationText}>Your Expo push token: {expoPushToken || 'Not available'}</Text>
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationText}>Title: {notification && notification.request.content.title} </Text>
            <Text style={styles.notificationText}>Body: {notification && notification.request.content.body}</Text>
            <Text style={styles.notificationText}>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
          </View>
          <View style={styles.buttonRow}>
            <Button
              title="Refresh Permission"
              onPress={async () => {
                await refreshPermissionStatus();
              }}
            />
            <Button
              title="Clear Data"
              onPress={async () => {
                await clearStoredNotificationData();
              }}
            />
            <Button
              title="Send Token to Backend"
              onPress={async () => {
                const success = await sendTokenToBackendManually();
                if (success) {
                  alert('Token sent to backend successfully!');
                } else {
                  alert('Failed to send token to backend. Check console for details.');
                }
              }}
              disabled={!authExpoPushToken}
            />
         
          </View>
          
        </View> */}
  
        {/* Profit Card */}
        <View style={{width:'100%'}} >
          <LinearGradient
            colors={['#2196F3', '#1870B5']}
            start={{ x: 1, y: 0.9 }}
            end={{ x: 1, y: 0.1 }}
            style={[ styles.profitCard]}
          >
            <View style={{ flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <CustomText type="regular" style={styles.profitLabel}>ربح اليوم</CustomText>
                <CustomText type="bold" style={styles.profitAmount}>{totalProfit} دينار</CustomText>
                {/* <View style={styles.profitChangeRow}>
                  <CustomText type="regular" style={styles.profitChangeText}>من الشهر الماضي</CustomText>
                  <View style={styles.profitChangeBadge}>
                    <CustomText type="bold" style={styles.profitChangeBadgeText}>{profitChange}</CustomText>
                  </View>
                </View> */}
              </View>
            </View>
            <Image source={require('../../../assets/images/linear_chart.png')} style={{width:"100%",height:60 , objectFit:"cover" , marginTop:15}}/>
          </LinearGradient>
        </View>
           

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFEAD1' }]}> 
              <MaterialIcons name="groups" size={28} color="#FFA726" />
            </View>
            <CustomText type="bold" style={styles.statNumber}>{clientsCount}</CustomText>
            <CustomText type="medium" style={styles.statLabel}>إجمالي العملاء</CustomText>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#E3F0FF' }]}> 
              <Ionicons name="cart" size={28} color="#42A5F5" />
            </View>
            <CustomText type="bold" style={styles.statNumber}>{ordersCount}</CustomText>
            <CustomText type="medium" style={styles.statLabel}>طلبات اليوم</CustomText>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#E6F7EC' }]}> 
              <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
            </View>
            <CustomText type="bold" style={styles.statNumber}>{successRate}</CustomText>
            <CustomText type="medium" style={styles.statLabel}>نسبة النجاح اليوم</CustomText>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#F3E6FF' }]}> 
              <FontAwesome5 name="box-open" size={24} color="#AB47BC" />
            </View>
            <CustomText type="bold" style={styles.statNumber}>{productsCount}</CustomText>
            <CustomText type="medium" style={styles.statLabel}>إجمالي المنتجات</CustomText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    direction: 'rtl',
    // flexDirection: 'row-revers',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  welcomeRow: {
    flexDirection: Platform.OS === 'ios' ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: "flex-end",
    paddingTop: 24,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    color: colors.primary,
    textAlign: Platform.OS === 'ios' ? 'right' : 'left',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: Platform.OS === 'ios' ? 'left' : 'right',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F7FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  profitCard: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  profitAmount: {
    fontSize: 28,
    color: '#fff',
    textAlign: Platform.OS === 'ios' ? 'right' : 'left',
  },
  profitLabel: {
    fontSize: 16,
    color: '#fff',
    textAlign: Platform.OS === 'ios' ? 'left' : 'right',
    // marginBottom: 8,
  },
  profitChangeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  profitChangeText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 8,
  },
  profitChangeBadge: {
    backgroundColor: "#FFFFFF4D",
    justifyContent: "center",
    alignItems: "center", 
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
  },
  profitChangeBadgeText: {
    color: colors.white,
    fontSize: 13,
  },
  chartSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  statsGrid: {
    flexDirection: Platform.OS === 'ios' ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 24,
    gap:10,
    rowGap:15
  },
  statCard: {
    width: '48%',
    // flex:1,
    maxWidth: '50%',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 10,
    // marginBottom: 10,
    alignItems: Platform.OS === 'ios' ? 'flex-start' : 'flex-end',
    justifyContent: Platform.OS === 'ios' ? 'flex-end' : 'flex-start',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.06,
    // shadowRadius: 4,
    // elevation: 2,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 23,
    color: '#222',
    // marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  notificationSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  notificationTitle: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: 10,
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  notificationInfo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
}); 