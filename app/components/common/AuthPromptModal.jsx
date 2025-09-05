import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { colors } from '../../styling/colors';
import CustomText from './CustomText';
import PrimaryButton from './PrimaryButton';

export default function AuthPromptModal({ visible, onClose, title = 'تسجيل الدخول مطلوب', message = 'الرجاء تسجيل الدخول أو إنشاء حساب لإكمال هذا الإجراء.' }) {
  const navigation = useNavigation();

  const goToLogin = () => {
    onClose && onClose();
    navigation.replace('Auth', { screen: 'Login' });
  };

  const goToSignup = () => {
    onClose && onClose();
    navigation.replace('Auth', { screen: 'SignUp' });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modal}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="إغلاق">
                <CustomText type="bold" style={styles.closeText}>×</CustomText>
              </TouchableOpacity>
              <CustomText type="bold" style={styles.title}>{title}</CustomText>
              <CustomText style={styles.message}>{message}</CustomText>
              <View style={styles.buttonsRow}>
                <PrimaryButton title="تسجيل الدخول" style={styles.button} onPress={goToLogin} />
                <PrimaryButton title="إنشاء حساب" style={[styles.button, styles.secondary]} onPress={goToSignup} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 22,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  title: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
});


