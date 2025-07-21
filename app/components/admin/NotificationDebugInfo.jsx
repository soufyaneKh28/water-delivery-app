import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNotification } from '../../context/NotificationContext';
import { colors } from '../../styling/colors';
import CustomText from '../common/CustomText';

export default function NotificationDebugInfo() {
  const { 
    expoPushToken, 
    notification, 
    permissionStatus, 
    isLoading,
    hasRequestedPermission,
    isInitialized 
  } = useNotification();

  return (
    <View style={styles.container}>
      <CustomText type="bold" style={styles.title}>Notification Debug Info</CustomText>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Initialized:</Text>
        <Text style={styles.value}>{isInitialized ? 'Yes' : 'No'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Loading:</Text>
        <Text style={styles.value}>{isLoading ? 'Yes' : 'No'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Permission Status:</Text>
        <Text style={styles.value}>{permissionStatus}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Has Requested:</Text>
        <Text style={styles.value}>{hasRequestedPermission ? 'Yes' : 'No'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Token Available:</Text>
        <Text style={styles.value}>{expoPushToken ? 'Yes' : 'No'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Token Length:</Text>
        <Text style={styles.value}>{expoPushToken ? expoPushToken.length : 0}</Text>
      </View>
      {expoPushToken && (
        <View style={styles.tokenContainer}>
          <Text style={styles.label}>Token (first 20 chars):</Text>
          <Text style={styles.tokenText}>{expoPushToken.substring(0, 20)}...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  tokenContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginTop: 4,
  },
}); 