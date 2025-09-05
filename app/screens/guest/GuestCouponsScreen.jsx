import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import AuthPromptModal from '../../components/common/AuthPromptModal';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { colors } from '../../styling/colors';
import { API_BASE_URL } from '../../utils/api';

export default function GuestCouponsScreen() {
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [couponProducts, setCouponProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const openAuth = () => setAuthModalVisible(true);

  useEffect(() => {
    const fetchGuestProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users/guest`);
        const json = await response.json();
        const allProducts = json?.data?.products || [];
        const couponOnly = allProducts.filter((p) => p.price_type === 'coupon');
        setCouponProducts(couponOnly);
      } catch (error) {
        setCouponProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchGuestProducts();
  }, []);

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        <CustomText type="bold" style={styles.sectionTitle}>رصيدي</CustomText>
        <View style={styles.balanceCard}>
          <CustomText type="regular" style={styles.balanceUnit}>كوبون</CustomText>
          <CustomText type="bold" style={styles.balanceValue}>0</CustomText>
        </View>

        <CustomText type="bold" style={styles.sectionTitle}>شراء دفتر كوبونات</CustomText>
        <View style={styles.couponBookList}>
          <View style={styles.couponBookCard}>
            <PrimaryButton title="سجّل لتشتري" style={styles.buyButton} onPress={openAuth} />
            <CustomText type="medium" style={styles.couponBookText}>دفتر 25 كوبون</CustomText>
            <Image source={require('../../../assets/icons/coupons_active.png')} style={styles.couponIcon} />
          </View>
          <View style={styles.couponBookCard}>
            <PrimaryButton title="سجّل لتشتري" style={styles.buyButton} onPress={openAuth} />
            <CustomText type="medium" style={styles.couponBookText}>دفتر 50 كوبون</CustomText>
            <Image source={require('../../../assets/icons/coupons_active.png')} style={styles.couponIcon} />
          </View>
        </View>

        <CustomText type="bold" style={styles.sectionTitle}>المنتجات المتاحة للكوبونات</CustomText>
        {isLoadingProducts ? (
          <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : couponProducts.length === 0 ? (
          <View style={styles.emptyProductsContainer}>
            <CustomText type="regular" style={styles.emptyProductsText}>لا توجد منتجات متاحة للكوبونات حالياً</CustomText>
          </View>
        ) : (
          couponProducts.map((product) => (
            <View key={product.id} style={styles.bottleCard}>
              <Image 
                source={product.image_url ? { uri: product.image_url } : require('../../../assets/images/bottle.png')} 
                style={styles.bottleImage} 
              />
              <View style={styles.bottleInfo}>
                <View>
                  <CustomText type="bold" style={styles.bottleTitle}>{product.title}</CustomText>
                  <CustomText type="regular" style={styles.bottleSize}>{product.size}</CustomText>
                </View>
                <CustomText type="bold" style={styles.bottleCoupon}>{product.price} كوبون</CustomText>
              </View>
              <PrimaryButton 
                title="طلب المنتج" 
                style={styles.refillButton} 
                onPress={openAuth}
              />
            </View>
          ))
        )}
      </ScrollView>

      <AuthPromptModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 20,
    textAlign: 'right',
  },
  balanceCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  balanceValue: {
    color: colors.secondary,
    fontSize: 48,
    marginBottom: 2,
  },
  balanceUnit: {
    color: colors.secondary,
    fontSize: 16,
    marginRight: 5,
    marginTop: 5,
  },
  couponBookList: {
    marginBottom: 24,
  },
  couponBookCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buyButton: {
    height: 40,
    marginLeft: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
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
  emptyProductsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyProductsText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
    padding: 20,
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
    width: '100%',
    height: 166,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  bottleInfo: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 12,
    width: '100%',
  },
  bottleTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
    textAlign: 'right',
  },
  bottleSize: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
    textAlign: 'right',
  },
  bottleCoupon: {
    fontSize: 18,
    color: colors.primary,
  },
  refillButton: {
    width: '100%',
    height: 45,
    borderRadius: 50,
  },
});


