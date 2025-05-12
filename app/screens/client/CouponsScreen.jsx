import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from '../../components/common/CustomText';

export default function CouponsScreen() {
  return (
    <View style={styles.container}>
      <CustomText style={styles.emptyText}>لا توجد كوبونات متاحة حالياً</CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    direction: 'rtl',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 