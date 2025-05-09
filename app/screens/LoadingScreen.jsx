import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import CustomText from '../components/common/CustomText';
import { colors } from '../styling/colors';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <CustomText style={styles.text}>جاري التحميل...</CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: colors.textSecondary,
  },
}); 