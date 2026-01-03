import React from 'react';
import { TextInput } from 'react-native';

/**
 * CustomTextInput - A wrapper around TextInput that disables font scaling by default
 * to prevent layout issues when users have large system font sizes.
 * 
 * Usage:
 * <CustomTextInput
 *   style={styles.input}
 *   value={value}
 *   onChangeText={setValue}
 *   allowFontScaling={false} // Optional, defaults to false
 * />
 */
export default function CustomTextInput({ 
  allowFontScaling = false,
  ...props 
}) {
  return (
    <TextInput 
      allowFontScaling={allowFontScaling}
      {...props}
    />
  );
}

