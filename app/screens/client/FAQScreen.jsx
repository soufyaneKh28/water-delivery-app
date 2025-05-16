import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import BackButton from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

const FAQS = [
  {
    question: 'كيف يمكنني تقديم طلب مياه؟',
    answer: 'يمكنك تقديم طلبك بسهولة عبر التطبيق من خلال تصفح المنتجات، اختيار الكمية المطلوبة، وإتمام عملية الشراء.'
  },
  {
    question: 'ما هي أوقات التوصيل المتاحة؟',
    answer: 'أوقات التوصيل متاحة من الساعة 8 صباحاً حتى 10 مساءً طوال أيام الأسبوع.'
  },
  {
    question: 'هل يوجد حد أدنى للطلب؟',
    answer: 'نعم، الحد الأدنى للطلب هو عبوتان.'
  },
  {
    question: 'كيف يمكنني الدفع مقابل طلبي؟',
    answer: 'يمكنك الدفع نقداً عند الاستلام أو عبر وسائل الدفع الإلكتروني المتاحة في التطبيق.'
  },
  {
    question: 'هل تتوفر عبوات مياه قابلة لإعادة التعبئة؟',
    answer: 'نعم، نوفر عبوات مياه قابلة لإعادة التعبئة حسب الطلب.'
  },
];

export default function FAQScreen({ navigation }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
       <BackButton />
        <CustomText type="bold" style={styles.headerTitle}>الأسئلة الشائعة</CustomText>
        <View style={{ width: 40}} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="bold" style={styles.title}>الأسئلة الشائعة</CustomText>
        <CustomText style={styles.subtitle}>
          هنا تجد إجابات عن أكثر الأسئلة شيوعاً حول خدماتنا. إذا لم تجد إجابة لسؤالك، لا تتردد في التواصل معنا.
        </CustomText>
        <View style={styles.accordionList}>
          {FAQS.map((faq, idx) => (
            <View key={idx}>
              <TouchableOpacity
                style={[styles.accordionHeader, openIndex === idx && styles.accordionHeaderOpen]}
                activeOpacity={0.8}
                onPress={() => setOpenIndex(openIndex === idx ? -1 : idx)}
              >
                <CustomText type="bold" style={styles.accordionQuestion}>{faq.question}</CustomText>
                <Ionicons
                  name={openIndex === idx ? 'chevron-down' : 'chevron-back'}
                  size={20}
                  color={colors.secondary}
                //   style={{ transform: [{ rotate: I18nManager.isRTL ? '0deg' : '180deg' }] }}
                />
              </TouchableOpacity>
              {openIndex === idx && (
                <View style={styles.accordionBody}>
                  <CustomText style={styles.accordionAnswer}>{faq.answer}</CustomText>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
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
    paddingTop: 48,
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    // borderBottomWidth: 1,

    // borderBottomColor: '#F2F4F7',
  },
  backButton: {
    padding: 4,
    marginLeft: 8,
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
    // fontWeight: 'bold',
    marginBottom: 8,
    // textAlign: 'right',
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 24,
    // textAlign: 'right',
    lineHeight: 22,
  },
  accordionList: {
    gap: 10,
  },
  accordionHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F2F4F7',
  },
  accordionHeaderOpen: {
    backgroundColor: '#EAF2FF',
    borderColor: '#EAF2FF',
  },
  accordionQuestion: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    // textAlign: 'right',
  },
  accordionBody: {
    backgroundColor: '#EAF2FF',
    borderRadius: 12,
    padding: 16,
    marginTop: -8,
    marginBottom: 8,
  },
  accordionAnswer: {
    fontSize: 15,
    color: '#222',
    // textAlign: 'right',
    lineHeight: 22,
  },
}); 