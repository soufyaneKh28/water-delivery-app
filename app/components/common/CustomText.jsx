import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { FONTS } from '../../constants/fonts';

export default function CustomText({ 
  children, 
  style, 
  type = 'regular',
  ...props 
}) {
  return (
    <Text 
      style={[
        styles.text,
        { fontFamily: FONTS[type] },
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
  },
}); 