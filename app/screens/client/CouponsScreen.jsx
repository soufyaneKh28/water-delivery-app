import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { colors } from '../../styling/colors';

export default function CouponsScreen() {
  return (
    <View style={styles.container}>
      {/* Balance Section */}
      <View style={styles.balanceCard}>
        <CustomText type="regular" style={styles.balanceLabel}>رصيدي</CustomText>
        <CustomText type="bold" style={styles.balanceValue}>50</CustomText>
        <CustomText type="regular" style={styles.balanceUnit}>كوبون</CustomText>
      </View>

      {/* Buy Coupon Book Section */}
      <CustomText type="bold" style={styles.sectionTitle}>شراء دفتر كوبونات</CustomText>
      <View style={styles.couponBookList}>
        <View style={styles.couponBookCard}>
          <PrimaryButton title="شراء الدفتر" style={styles.buyButton} onPress={() => {}} />
          <CustomText type="regular" style={styles.couponBookText}>دفتر 25 كوبون</CustomText>
          <Image source={require('../../../assets/icons/coupons_active.png')} style={styles.couponIcon} />
        </View>
        <View style={styles.couponBookCard}>
          <PrimaryButton title="شراء الدفتر" style={styles.buyButton} onPress={() => {}} />
          <CustomText type="regular" style={styles.couponBookText}>دفتر 50 كوبون</CustomText>
          <Image source={require('../../../assets/icons/coupons_active.png')} style={styles.couponIcon} />
        </View>
      </View>

      {/* Bottle Refill Section */}
      <CustomText type="bold" style={styles.sectionTitle}>تعبئة قارورة</CustomText>
      <View style={styles.bottleCard}>
        <Image source={require('../../../assets/images/bottle.png')} style={styles.bottleImage} />
        <View style={styles.bottleInfo}>
          <CustomText type="bold" style={styles.bottleTitle}>عبوة مياه كبيرة</CustomText>
          <CustomText type="regular" style={styles.bottleSize}>20 لتر</CustomText>
          <CustomText type="regular" style={styles.bottleCoupon}>1 كوبون</CustomText>
        </View>
        <PrimaryButton title="طلب اعادة تعبئة" style={styles.refillButton} onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
    direction: 'rtl',
  },
  balanceCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  balanceLabel: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 4,
  },
  balanceValue: {
    color: colors.primary,
    fontSize: 48,
    marginBottom: 2,
  },
  balanceUnit: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  couponBookList: {
    marginBottom: 24,
  },
  couponBookCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buyButton: {
    width: 100,
    height: 40,
    marginLeft: 12,
  },
  couponBookText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  couponIcon: {
    width: 32,
    height: 32,
    marginLeft: 8,
    resizeMode: 'contain',
  },
  bottleCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  bottleImage: {
    width: 100,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  bottleInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  bottleTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  bottleSize: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  bottleCoupon: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: 'bold',
  },
  refillButton: {
    width: '100%',
    height: 44,
  },
}); 