import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { colors } from '../../styling/colors';
import CustomText from './CustomText';
import PrimaryButton from './PrimaryButton';

export default function ErrorModal({
  visible,
  onClose,
  title = 'خطأ',
  message = 'حدث خطأ غير متوقع',
  buttonText = 'حسناً',
  onButtonPress,
  showIcon = true,
}) {
  const handleButtonPress = () => {
    if (onButtonPress) {
      onButtonPress();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {showIcon && (
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={60} color={colors.error} />
            </View>
          )}
          
          <CustomText type="bold" style={styles.title}>
            {title}
          </CustomText>
          
          <CustomText style={styles.message}>
            {message}
          </CustomText>
          
          <PrimaryButton
            title={buttonText}
            style={styles.button}
            onPress={handleButtonPress}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
    color: colors.error,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#222',
    marginBottom: 24,
    lineHeight: 20,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 50,
  },
}); 