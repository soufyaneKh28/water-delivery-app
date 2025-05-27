import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';
import { globalStyles } from '../../styling/globalStyles';

export default function AddProduct({ navigation }) {
  const [image, setImage] = useState(null);
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productSize, setProductSize] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productExample, setProductExample] = useState('');

  // Product categories
  const categories = [
    { id: '1', name: 'مياه معدنية' },
    { id: '2', name: 'مياه غازية' },
    { id: '3', name: 'عصائر' },
    { id: '4', name: 'مشروبات طاقة' },
    { id: '5', name: 'مشروبات ساخنة' },
  ];

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('عذراً، نحتاج إلى إذن للوصول إلى معرض الصور!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    // TODO: Implement save functionality with image upload
    if (!image) {
      alert('الرجاء اختيار صورة للمنتج');
      return;
    }
    if (!productName || !productSize || !productDescription || !productPrice) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    // Here you would typically:
    // 1. Upload the image to your storage
    // 2. Get the image URL
    // 3. Save the product details with the image URL
    console.log('Saving product with image:', image);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1   , paddingBottom: 50}} showsVerticalScrollIndicator={false}>
        {/* <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity> */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <BackBtn/>
          <CustomText type="bold" style={styles.title}>إضافة منتج</CustomText> 
          <View style={{ width: 28 }} />
        </View>
        {/* <CustomText type="bold" style={styles.title}>إضافة منتج</CustomText> */}
        <View style={styles.imageUploadBox}>
          <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={36} color={colors.primary} />
                <CustomText style={styles.imageUploadText}>تحميل صورة المنتج</CustomText>
                <CustomText style={styles.imageUploadHint}>(PNG, JPG حتى 5MB)</CustomText>
              </>
            )}
          </TouchableOpacity>
        </View>
        <View style={globalStyles.inputContainer}>
          <CustomText style={globalStyles.inputLabel}>اسم المنتج</CustomText>
          <TextInput 
            style={globalStyles.input} 
            placeholder="أدخل اسم المنتج" 
            placeholderTextColor={colors.textDisabled}
            value={productName}
            onChangeText={setProductName}
          />
        </View>
        <View style={globalStyles.inputContainer}>
          <CustomText style={globalStyles.inputLabel}>فئة المنتج</CustomText>
          <View style={[globalStyles.input, styles.pickerContainer]}>
            <Picker
              selectedValue={productCategory}
              onValueChange={(itemValue) => setProductCategory(itemValue)}
              style={styles.picker}
              dropdownIconColor={colors.primary}
            >
              <Picker.Item label="اختر فئة المنتج" value="" color={colors.textDisabled} />
              {categories.map((category) => (
                <Picker.Item 
                  key={category.id} 
                  label={category.name} 
                  value={category.id}
                  color={colors.textPrimary}
                />
              ))}
            </Picker>
          </View>
        </View>
        <View style={globalStyles.inputContainer}>
          <CustomText style={globalStyles.inputLabel}>حجم المنتج</CustomText>
          <TextInput 
            style={globalStyles.input} 
            placeholder="10 لتر" 
            placeholderTextColor={colors.textDisabled}
            value={productSize}
            onChangeText={setProductSize}
          />
        </View>
        <View style={globalStyles.inputContainer}>
          <CustomText style={globalStyles.inputLabel}>وصف المنتج</CustomText>
          <TextInput 
            style={[globalStyles.input, { height: 100, textAlignVertical: 'top' }]} 
            placeholder="صف منتجك" 
            placeholderTextColor={colors.textDisabled}
            value={productDescription}
            onChangeText={setProductDescription}
            multiline
          />
        </View>
        <View style={globalStyles.inputContainer}>
          <CustomText style={globalStyles.inputLabel}>سعر المنتج</CustomText>
          <TextInput 
            style={globalStyles.input} 
            placeholder="0.00" 
            placeholderTextColor={colors.textDisabled}
            keyboardType="numeric"
            value={productPrice}
            onChangeText={setProductPrice}
          />
        </View>
        <View style={globalStyles.inputContainer}>
          <CustomText style={globalStyles.inputLabel}>مثال للمنتج</CustomText>
          <TextInput 
            style={globalStyles.input} 
            placeholder="مثلاً" 
            placeholderTextColor={colors.textDisabled}
            value={productExample}
            onChangeText={setProductExample}
          />
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
    color: colors.textPrimary,
  },
  imageUploadBox: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageUploadButton: {
    alignItems: 'center',
  },
  imageUploadText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  imageUploadHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  buttonRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 10,
    marginBottom: 24,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    // marginLeft: 8,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    // marginRight: 8,
  },
  cancelButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    padding: 0,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        paddingHorizontal: 10,
      },
      android: {
        paddingHorizontal: 5,
      },
    }),
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 50,
    width: '100%',
    color: colors.textPrimary,
  },
}); 