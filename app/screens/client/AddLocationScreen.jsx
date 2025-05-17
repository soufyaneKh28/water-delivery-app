import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { colors } from '../../styling/colors';

export default function AddLocationScreen({ navigation }) {
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  const handleSave = () => {
    // Save logic here
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <CustomText type="bold" style={styles.headerTitle}>إضافة عنوان جديد</CustomText>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.form}>
        <CustomText type="bold" style={styles.label}>اسم العنوان</CustomText>
        <TextInput
          style={styles.input}
          placeholder="مثال: المنزل، العمل"
          value={label}
          onChangeText={setLabel}
          textAlign="right"
        />
        <CustomText type="bold" style={styles.label}>العنوان</CustomText>
        <TextInput
          style={styles.input}
          placeholder="اكتب العنوان هنا"
          value={address}
          onChangeText={setAddress}
          textAlign="right"
        />
        <CustomText type="bold" style={styles.label}>المدينة</CustomText>
        <TextInput
          style={styles.input}
          placeholder="اكتب اسم المدينة"
          value={city}
          onChangeText={setCity}
          textAlign="right"
        />
        <PrimaryButton title="حفظ العنوان" style={styles.saveButton} onPress={handleSave} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    direction: 'rtl',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  form: {
    padding: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border || '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: '#F8FAFC',
    textAlign: 'right',
  },
  saveButton: {
    marginTop: 20,
  },
}); 