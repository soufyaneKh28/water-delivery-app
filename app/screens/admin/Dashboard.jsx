import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
// import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../../lib/supabase';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [successRate, setSuccessRate] = useState('0%');

  const fetchOrdersCount = async () => {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
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
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status');
    
    if (!error && orders) {
      const totalOrders = orders.length;
      const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
      const rate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
      setSuccessRate(`${rate}%`);
    }
  };

  React.useEffect(() => {
    fetchOrdersCount();
    fetchClientsCount();
    fetchProductsCount();
    fetchSuccessRate();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([
      fetchOrdersCount(),
      fetchClientsCount(),
      fetchProductsCount(),
      fetchSuccessRate(),
    ]).finally(() => setRefreshing(false));
  }, []);

  // Example data
  const userName = 'سفيان خلف الله';
  const profit = '14.000';
  const profitChange = '+15%';

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ flexGrow: 1 }}
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
            <CustomText type="regular" style={styles.welcomeSubtitle}>{userName}</CustomText>
          </View>
          <View style={styles.avatarCircle}>
            <Ionicons name="water-outline" size={28} color={colors.primary} />
          </View>
        </View>

        {/* Profit Card */}
   
        <View style={{width:'100%'}} >
        <LinearGradient
        // Background Linear Gradient
        colors={['#2196F3', '#1870B5']}
        start={{ x: 1, y: 0.9 }}
        end={{ x: 1, y: 0.1 }}
        
        style={[ styles.profitCard]}
      >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <CustomText type="regular" style={styles.profitLabel}>مبلغ الربح</CustomText>
              <CustomText type="bold" style={styles.profitAmount}>{profit} دينار</CustomText>
              <View style={styles.profitChangeRow}>
                <CustomText type="regular" style={styles.profitChangeText}>من الشهر الماضي</CustomText>
                <View style={styles.profitChangeBadge}>
                  <CustomText type="bold" style={styles.profitChangeBadgeText}>{profitChange}</CustomText>
                </View>
              </View>
            </View>
          </View>
            <Image source={require('../../../assets/images/linear_chart.png')} style={{width:"100%",height:50 , objectFit:"cover" , marginTop:15}}/>
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
            <CustomText type="medium" style={styles.statLabel}>إجمالي الطلبات</CustomText>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#E6F7EC' }]}> 
              <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
            </View>
            <CustomText type="bold" style={styles.statNumber}>{successRate}</CustomText>
            <CustomText type="medium" style={styles.statLabel}>نسبة النجاح</CustomText>
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
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  welcomeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: "flex-end",
    paddingTop: 24,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    color: colors.primary,
    // textAlign: 'right',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    // textAlign: 'right',
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
    // textAlign: 'right',
  },
  profitLabel: {
    fontSize: 16,
    color: '#fff',
    // textAlign: 'right',
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
    flexDirection: 'row-reverse',
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
    alignItems: "flex-start",
    justifyContent: "flex-end",
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
}); 