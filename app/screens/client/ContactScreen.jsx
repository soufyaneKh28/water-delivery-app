import React from 'react';
import { Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

export default function ContactScreen({ navigation }) {
  // Dummy handlers for contact actions
  const handleCall = () => Linking.openURL('tel:123456789');
  const handleMail = () => Linking.openURL('mailto:support@email.com');
  const handleInstagram = () => Linking.openURL('https://www.instagram.com/');
  const handleFacebook = () => Linking.openURL('https://www.facebook.com/');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <CustomText type="bold" style={styles.headerTitle}>اتصل بنا</CustomText>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="bold" style={styles.title}>تواصل معنا</CustomText>
        <CustomText style={styles.subtitle}>
          لا تتردد في الاتصال بنا سواء كان لديك اقتراح لتحسيننا، أو شكوى لمناقشتها، أو مشكلة لحلها.
        </CustomText>
        {/* Contact Cards */}
        <View style={styles.cardsRow}>
          <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={handleMail}>
     
              <Image source={require('../../../assets/icons/email.png')} style={styles.icon} />
        
            <CustomText type="bold" style={styles.cardTitle}>راسلنا عبر البريد الإلكتروني</CustomText>
            <CustomText style={styles.cardDesc}>فريقنا متصل الاثنين - الجمعة، 9-17</CustomText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={handleCall}>
          <Image source={require('../../../assets/icons/phone.png')} style={styles.icon} />
            <CustomText type="bold" style={styles.cardTitle}>اتصل بنا</CustomText>
            <CustomText style={styles.cardDesc}>فريقنا على الخط من الاثنين إلى الجمعة، 9-17</CustomText>
          </TouchableOpacity>
        </View>
        <CustomText type="regular" style={styles.socialLabel}>اتصل بنا عبر وسائل التواصل الاجتماعي</CustomText>
        {/* Social Media Buttons */}
        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8} onPress={handleInstagram}>
        
            {/* Replace with Instagram icon if available */}
            <Image source={require('../../../assets/icons/instagram.png')} style={styles.socialIcon} />
         
          <CustomText type='bold' style={styles.socialText}>إنستقرام</CustomText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8} onPress={handleFacebook}>
      
            {/* Replace with Facebook icon if available */}
            <Image source={require('../../../assets/icons/facebook.png')} style={styles.socialIcon} />
          
          <CustomText type='bold' style={styles.socialText}>إنستقرام</CustomText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  title: {
    fontSize: 22,
    color: colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 24,
    lineHeight: 22,
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