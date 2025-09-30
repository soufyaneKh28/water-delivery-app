import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

const FAQS = [
  {
    question: 'كيف يمكنني تقديم طلب مياه؟',
    answer:
      'يمكنك تقديم طلبك بسهولة عبر التطبيق من خلال تصفح المنتجات، اختيار الكمية المطلوبة، وإتمام عملية الشراء.',
  },
  {
    question: 'ما هي أوقات التوصيل المتاحة؟',
    answer:
      'أوقات التوصيل متاحة من الساعة 8 صباحاً حتى 10 مساءً طوال أيام الأسبوع.',
  },
  {
    question: 'هل يوجد حد أدنى للطلب؟',
    answer: 'نعم، الحد الأدنى للطلب هو عبوتان.',
  },
  {
    question: 'كيف يمكنني الدفع مقابل طلبي؟',
    answer:
      'يمكنك الدفع نقداً عند الاستلام أو عبر وسائل الدفع الإلكتروني المتاحة في التطبيق.',
  },
  {
    question: 'هل تتوفر عبوات مياه قابلة لإعادة التعبئة؟',
    answer: 'نعم، نوفر عبوات مياه قابلة لإعادة التعبئة حسب الطلب.',
  },
];

// Accordion item with animation
function AnimatedAccordionItem({ faq, isOpen, onToggle }) {
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      height.value = withTiming(100, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      height.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
    overflow: 'hidden',
  }));

  return (
    <View style={ isOpen ? { marginBottom: 8 } : { marginBottom: 0 } }>
      <TouchableOpacity
        style={[styles.accordionHeader, isOpen && styles.accordionHeaderOpen]}
        activeOpacity={0.8}
        onPress={onToggle}
      >
        <CustomText type="bold" style={styles.accordionQuestion}>
          {faq.question}
        </CustomText>
        <Ionicons
          name={isOpen ? 'chevron-down' : 'chevron-back'}
          size={20}
          color={colors.secondary}
        />
      </TouchableOpacity>

      <Animated.View style={[styles.accordionBody, animatedStyle]}>
        <CustomText style={styles.accordionAnswer}>{faq.answer}</CustomText>
      </Animated.View>
    </View>
  );
}

export default function FAQScreen({ navigation }) {
  const [openIndex, setOpenIndex] = useState(0);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const onPress = () => {
    scale.value = withTiming(scale.value === 1 ? 1.5 : 1, {
      duration: 300,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackBtn />
        <CustomText type="bold" style={styles.headerTitle}>
          الأسئلة الشائعة
        </CustomText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="bold" style={styles.title}>
          الأسئلة الشائعة
        </CustomText>
        <CustomText style={styles.subtitle}>
          هنا تجد إجابات عن أكثر الأسئلة شيوعاً حول خدماتنا. إذا لم تجد إجابة لسؤالك، لا تتردد في التواصل معنا.
        </CustomText>

        <View style={styles.accordionList}>
          {FAQS.map((faq, idx) => (
            <AnimatedAccordionItem
              key={idx}
              faq={faq}
              isOpen={openIndex === idx}
              onToggle={() => setOpenIndex(openIndex === idx ? -1 : idx)}
            />
          ))}
        </View>

        {/* Animation Test Box */}
        {/* <Animated.View style={[styles.box, animatedStyle]} />
        <Button title="Animate" onPress={onPress} /> */}
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
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row',
    alignItems: 'center',
    paddingTop: 20,
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
    // textAlign: Platform.OS === 'ios' ? "left" : "right",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    // textAlign: Platform.OS === 'ios' ? "left" : "right",
    marginBottom: 24,
    lineHeight: 22,
  },
  accordionList: {
    // gap: 10,
    // gap: -10,
  },
  accordionHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row',
    alignItems: 'center',
    // marginBottom: 8,
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
    // textAlign: Platform.OS === 'ios' ? "left" : "right",
  },
  accordionBody: {
    backgroundColor: '#EAF2FF',
    borderRadius: 12,
    padding: 16,
    marginTop: -8,
    // marginBottom: 8,
  },
  accordionAnswer: {
    fontSize: 15,
    color: '#222',
    lineHeight: 22,
    textAlign: Platform.OS === 'ios' ? "left" : "right",
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: 'tomato',
    // marginBottom: 20,
  },
});
