import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../styling/colors';
import CustomText from './CustomText';

export default function PrimaryButton({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        (disabled || isLoading) && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <CustomText type="semiBold" numberOfLines={1} ellipsizeMode="tail" style={styles.buttonText}>{title}</CustomText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: colors.primary + '80',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});