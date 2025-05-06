// import { colors } from '@/constants/theme';
import { useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../constants/theme';

export function CustomInput({
  label,
  errorMessage,
  containerStyle,
  rightIcon,
  value,
  onChangeText,
  onFocus,
  onBlur,
  ...rest
}) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = new Animated.Value(isFocused || value ? 1 : 0);

  const handleFocus = (e) => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
    
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
    
    onBlur && onBlur(e);
  };

  const labelStyle = {
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: isFocused 
      ? colors.primary 
      : errorMessage 
      ? colors.error 
      : colors.textSecondary,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View 
        style={[
          styles.inputContainer, 
          isFocused && styles.inputContainerFocused,
          errorMessage && styles.inputContainerError,
        ]}
      >
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>
        
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={colors.textPlaceholder}
            {...rest}
          />
          {rightIcon}
        </View>
      </View>
      
      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    height: 56,
    position: 'relative',
    backgroundColor: colors.inputBackground,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  label: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'transparent',
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    padding: 0,
    fontWeight: '500',
  },
  errorMessage: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});