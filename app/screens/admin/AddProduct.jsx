import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

export default function AddProduct({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>
        <CustomText type="bold" style={styles.title}>إضافة منتج</CustomText>
        <View style={styles.imageUploadBox}>
          <TouchableOpacity style={styles.imageUploadButton}>
            <Ionicons name="camera-outline" size={36} color={colors.primary} />
            <CustomText style={styles.imageUploadText}>تحميل صورة المنتج</CustomText>
            <CustomText style={styles.imageUploadHint}>(PNG, JPG حتى 5MB)</CustomText>
          </TouchableOpacity>
        </View>
        <TextInput style={styles.input} placeholder="أدخل اسم المنتج" placeholderTextColor="#aaa" />
        <TextInput style={styles.input} placeholder="10 لتر" placeholderTextColor="#aaa" />
        <TextInput style={styles.input} placeholder="صف منتجك" placeholderTextColor="#aaa" />
        <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#aaa" keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="مثلاً" placeholderTextColor="#aaa" />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.saveButton}>
            <CustomText style={styles.saveButtonText}>حفظ المنتج</CustomText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <CustomText style={styles.cancelButtonText}>إلغاء</CustomText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    direction: 'rtl',
  },
  backButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12,
    color: '#222',
  },
  imageUploadBox: {
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginBottom: 18,
  },
  imageUploadButton: {
    alignItems: 'center',
  },
  imageUploadText: {
    marginTop: 8,
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  imageUploadHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    textAlign: 'right',
    color: '#222',
  },
  buttonRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 24,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 