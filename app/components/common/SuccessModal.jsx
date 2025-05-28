import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { colors } from '../../styling/colors';
import CustomText from './CustomText';

const SuccessModal = ({ visible, product }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <View style={styles.checkmark}>
              <View style={styles.checkmarkStem} />
              <View style={styles.checkmarkKick} />
            </View>
          </View>
          <CustomText type="bold" style={styles.title}>تمت الإضافة بنجاح</CustomText>
          <CustomText style={styles.message}>
            تم إضافة {product?.name} إلى سلة المشتريات
          </CustomText>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    width: 30,
    height: 30,
    position: 'relative',
  },
  checkmarkStem: {
    position: 'absolute',
    width: 3,
    height: 20,
    backgroundColor: 'white',
    left: 11,
    top: 0,
    transform: [{ rotate: '45deg' }],
  },
  checkmarkKick: {
    position: 'absolute',
    width: 3,
    height: 10,
    backgroundColor: 'white',
    left: 5,
    bottom: 5,
    transform: [{ rotate: '-45deg' }],
  },
  title: {
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default SuccessModal; 