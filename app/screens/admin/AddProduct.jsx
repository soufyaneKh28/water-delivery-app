import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styling/colors';
import { globalStyles } from '../../styling/globalStyles';

export default function AddProduct({ navigation }) {
  const route = useRoute();
  const editingProduct = route.params?.product;
  const { user } = useAuth();

  const [image, setImage] = useState(null);
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productSize, setProductSize] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Prefill fields if editing
  useEffect(() => {
    if (editingProduct) {
      setImage(editingProduct.image_url || null);
      setProductName(editingProduct.title || '');
      setProductCategory(editingProduct.category || '');
      setProductSize(editingProduct.size || '');
      setProductDescription(editingProduct.description || '');
      setProductPrice(editingProduct.price ? String(editingProduct.price) : '');
    }
  }, [editingProduct]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      setCategories(data);
    };
    fetchCategories();
  }, []);

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
    if (!image) {
      alert('الرجاء اختيار صورة للمنتج');
      return;
    }
    if (!productName || !productSize || !productDescription || !productPrice) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    setIsLoading(true); // Start loading

    try {
      // Fetch the Bearer token from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        alert('لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        return;
      }

      // Prepare FormData
      const formData = new FormData();
      // Get file info for the image
      const fileInfo = await FileSystem.getInfoAsync(image);
      formData.append('image', {
        uri: image,
        name: fileInfo.uri.split('/').pop() || 'image.jpg',
        type: 'image/jpeg', // You may want to detect the type
      });
      formData.append('title', productName);
      formData.append('size', productSize);
      formData.append('description', productDescription);
      formData.append('price', productPrice);
      formData.append('price_type', 'money'); // Or your logic
      formData.append('category', productCategory);
      formData.append('old_price', '12'); // Or your logic

      const response = await axios.post(
        'https://water-supplier-2.onrender.com/api/k1/products/createProduct',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      console.log("response",response);
      
      alert('تمت إضافة المنتج بنجاح');
      navigation.goBack();
    } catch (err) {
      alert('حدث خطأ: ' + (err.response?.data?.message || err.message));
      console.log("err", err);
    } finally {
      setIsLoading(false); // Stop loading regardless of success or failure
    }
  };

  // Add these validation functions after the state declarations
  const handleSizeChange = (text) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    setProductSize(numericValue);
  };

  const handlePriceChange = (text) => {
    // Allow numbers and one decimal point
    const numericValue = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      setProductPrice(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setProductPrice(numericValue);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        {/* <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity> */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <BackBtn/>
          <CustomText type="bold" style={styles.title}>
            {editingProduct ? 'تعديل منتج' : 'إضافة منتج'}
          </CustomText>
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
                  label={category.title}
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
            placeholder="أدخل الحجم بالأرقام فقط" 
            placeholderTextColor={colors.textDisabled}
            value={productSize}
            onChangeText={handleSizeChange}
            keyboardType="numeric"
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
            placeholder="أدخل السعر بالأرقام فقط" 
            placeholderTextColor={colors.textDisabled}
            keyboardType="decimal-pad"
            value={productPrice}
            onChangeText={handlePriceChange}
          />
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.disabledButton]} 
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <CustomText style={styles.saveButtonText}>حفظ المنتج</CustomText>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
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
  disabledButton: {
    opacity: 0.7,
  },
}); 