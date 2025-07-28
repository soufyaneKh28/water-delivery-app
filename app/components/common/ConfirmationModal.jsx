import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '../../styling/colors';
import CustomText from './CustomText';

export default function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  onCancel, // New prop for custom cancel action
  title = 'تأكيد',
  message = 'هل أنت متأكد من هذا الإجراء؟',
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  type = 'default', // 'default', 'danger', 'warning', 'success'
  loading = false,
}) {
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirmButton: styles.dangerButton,
          confirmText: styles.dangerButtonText,
        };
      case 'warning':
        return {
          confirmButton: styles.warningButton,
          confirmText: styles.warningButtonText,
        };
      case 'success':
        return {
          confirmButton: styles.successButton,
          confirmText: styles.successButtonText,
        };
      default:
        return {
          confirmButton: styles.defaultButton,
          confirmText: styles.defaultButtonText,
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <CustomText type="bold" style={styles.title}>
            {title}
          </CustomText>
          <CustomText style={styles.message}>
            {message}
          </CustomText>
          
          <TouchableOpacity
            style={[styles.confirmButton, typeStyles.confirmButton]}
            onPress={onConfirm}
            disabled={loading}
          >
            <CustomText style={[styles.confirmButtonText, typeStyles.confirmText]}>
              {loading ? 'جاري التحميل...' : confirmText}
            </CustomText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel || onClose} // Use onCancel if provided, otherwise use onClose
            disabled={loading}
          >
            <CustomText style={styles.cancelButtonText}>
              {cancelText}
            </CustomText>
          </TouchableOpacity>
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
  title: {
    fontSize: 18,
    marginBottom: 12,
    color: '#222',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#222',
    marginBottom: 24,
    lineHeight: 20,
  },
  confirmButton: {
    borderRadius: 12,
    width: '100%',
    paddingVertical: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  defaultButton: {
    backgroundColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultButtonText: {
    color: '#fff',
  },
  dangerButtonText: {
    color: '#fff',
  },
  warningButtonText: {
    color: '#fff',
  },
  successButtonText: {
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#222',
    fontSize: 16,
    textAlign: 'center',
  },
}); 