import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import Svg, { Path } from 'react-native-svg';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a network request
    setTimeout(() => {
      // Here you would typically fetch new data
      setRefreshing(false);
    }, 2000);
  }, []);

  // Example data
  const userName = 'سفيان خلف الله';
  const profit = '14.000';
  const profitChange = '+15%';
  const orders = 1555;
  const customers = 566;
  const successRate = '90%';
  const products = 14;

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <CustomText type="bold" style={styles.welcomeTitle}>مرحباً بعودتك!</CustomText>
            <CustomText type="regular" style={styles.welcomeSubtitle}>{userName}</CustomText>
          </View>
          <View style={styles.avatarCircle}>
            <Ionicons name="water-outline" size={28} color={colors.primary} />
          </View>
        </View>

        {/* Profit Card */}
        <View style={styles.profitCard}>
          <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <CustomText type="bold" style={styles.profitAmount}>{profit} دينار</CustomText>
              <CustomText type="regular" style={styles.profitLabel}>مبلغ الربح</CustomText>
              <View style={styles.profitChangeRow}>
                <CustomText type="regular" style={styles.profitChangeText}>من الشهر الماضي</CustomText>
                <View style={styles.profitChangeBadge}>
                  <CustomText type="bold" style={styles.profitChangeBadgeText}>{profitChange}</CustomText>
                </View>
              </View>
            </View>
          </View>
          {/* Simple Line Chart (SVG) */}
          {/* <Svg height="40" width="100%" style={styles.chartSvg}>
            <Path
              d="M0,30 Q30,10 60,25 T120,20 T180,30 T240,15 T300,30"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
            />
          </Svg> */}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFEAD1' }]}> 
              <MaterialIcons name="groups" size={28} color="#FFA726" />
            </View>
            <CustomText type="bold" style={styles.statNumber}>{customers}</CustomText>
            <CustomText type="regular" style={styles.statLabel}>إجمالي العملاء</CustomText>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#E3F0FF' }]}> 
              <Ionicons name="cart" size={28} color="#42A5F5" />
            </View>
            <CustomText type="bold" style={styles.statNumber}>{orders}</CustomText>
            <CustomText type="regular" style={styles.statLabel}>إجمالي الطلبات</CustomText>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#E6F7EC' }]}> 
              <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
            </View>
            <CustomText type="bold" style={styles.statNumber}>{successRate}</CustomText>
            <CustomText type="regular" style={styles.statLabel}>نسبة النجاح</CustomText>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#F3E6FF' }]}> 
              <FontAwesome5 name="box-open" size={24} color="#AB47BC" />
            </View>
            <CustomText type="bold" style={styles.statNumber}>{products}</CustomText>
            <CustomText type="regular" style={styles.statLabel}>إجمالي المنتجات</CustomText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: 24,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    color: colors.primary,
    textAlign: 'right',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
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
    textAlign: 'right',
  },
  profitLabel: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'right',
    marginBottom: 8,
  },
  profitChangeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  profitChangeText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 8,
  },
  profitChangeBadge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
  },
  profitChangeBadgeText: {
    color: colors.primary,
    fontSize: 12,
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
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    color: '#222',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
}); 