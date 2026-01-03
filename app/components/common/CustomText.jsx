import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { FONTS } from '../../constants/fonts';

export default function CustomText({ 
  children, 
  style, 
  type = 'regular',
  allowFontScaling = false,
  ...props 
}) {
  return (
    <Text 
      style={[
        styles.text,
        { fontFamily: FONTS[type] },
        style
      ]} 
      allowFontScaling={allowFontScaling}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    textAlign: 'center',
    writingDirection: 'rtl',
    textBreakStrategy: 'simple',
  },
}); 