import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

export default function TermsScreen({ navigation }) {
  // Dummy handlers for contact actions


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackBtn />
        <CustomText type="bold" style={styles.headerTitle}>الشروط والأحكام</CustomText>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="bold" style={styles.title}>شروط الاستخدام</CustomText>
        <CustomText style={styles.subtitle}>
        تأسست مخصوم في لبنان في أكتوبر 2010. بدأت كسوق إلكتروني يقدم للعملاء خصومات على مجموعة متنوعة من الخدمات مثل المطاعم والفنادق والمنتجعات الصحية.

في عام 2018، أضافت مخصوم خدمة التجارة الإلكترونية إلى خط أعمالها.

مع أكثر من 30,000 منتج، هدفنا هو توفير تجربة تسوق سلسة لعملائنا، وأسعار تنافسية، وتسليم سريع في الوقت المحدد، ودعم ممتاز قبل وبعد البيع. نقدم مجموعة من المنتجات والخدمات مثل المنزل والمطبخ، ومنتجات الأطفال، والأجهزة، والألعاب والمزيد، بالإضافة إلى قسائمنا للتوفير على الخدمات المحلية مثل المنتجعات الصحية والفنادق والمنتجعات الشاطئية والمزيد.
        </CustomText>
    
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: colors.white,
    direction: 'rtl',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingTop: 30,
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
    direction: 'rtl',
  },
  title: {
    fontSize: 22,
    color: colors.black,
    textAlign: "left",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: "left",
    marginBottom: 24,
    lineHeight: 28,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    alignItems: 'center',
    // padding: 18 ,
    paddingVertical: 20,
    paddingHorizontal: 14,
    // marginHorizontal: 4,
    minHeight: 130,
    // elevation: 1,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  cardTitle: {
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 10,
    marginTop: 10,      
    // width: '100%',
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  socialLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 12,
    // textAlign: 'center',
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    marginHorizontal: 2,
  },
  socialIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  socialIcon: {
    width: 50,
    height: 50,
    marginLeft: 15,
    resizeMode: 'contain',
  },
  socialText: {
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'right',
  },
}); 