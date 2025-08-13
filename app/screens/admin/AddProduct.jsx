import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import ErrorModal from '../../components/common/ErrorModal';
import SuccessModal from '../../components/common/SuccessModal';
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
  const [productOldPrice, setProductOldPrice] = useState('');
  const [productType, setProductType] = useState('money');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  const [errorMessage, setErrorMessage] = useState({ title: '', message: '' });

  // Helper function to format price for display (converts period to comma for Jordan locale)
  const formatPriceForDisplay = (price) => {
    if (!price) return '';
    // Convert period to comma for display in Jordan locale
    return price.toString().replace('.', ',');
  };

  // Prefill fields if editing
  useEffect(() => {
    if (editingProduct) {
      setImage(editingProduct.image_url || null);
      setProductName(editingProduct.title || '');
      setProductCategory(editingProduct.category || '');
      setProductSize(editingProduct.size || '');
      setProductDescription(editingProduct.description || '');
      // Format prices for display (convert period to comma for Jordan locale)
      setProductPrice(editingProduct.price ? formatPriceForDisplay(editingProduct.price) : '');
      setProductOldPrice(editingProduct.old_price ? formatPriceForDisplay(editingProduct.old_price) : '');
      setProductType(editingProduct.price_type || 'money');
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
        setErrorMessage({
          title: 'خطأ في التحميل',
          message: 'فشل في تحميل فئات المنتجات'
        });
        setShowErrorModal(true);
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
      setErrorMessage({
        title: 'خطأ في الصلاحيات',
        message: 'عذراً، نحتاج إلى إذن للوصول إلى معرض الصور!'
      });
      setShowErrorModal(true);
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
      setErrorMessage({
        title: 'صورة مطلوبة',
        message: 'الرجاء اختيار صورة للمنتج'
      });
      setShowErrorModal(true);
      return;
    }
    if (!productName || !productSize || !productDescription || !productPrice) {
      setErrorMessage({
        title: 'بيانات مطلوبة',
        message: 'الرجاء ملء جميع الحقول المطلوبة'
      });
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setErrorMessage({
          title: 'خطأ في المصادقة',
          message: 'لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.'
        });
        setShowErrorModal(true);
        return;
      }

      // Prepare FormData
      const formData = new FormData();
      // Only add image if it's a new file or not a URL
      if (!editingProduct || (image && !image.startsWith('http'))) {
        const fileInfo = await FileSystem.getInfoAsync(image);
        formData.append('image', {
          uri: image,
          name: fileInfo.uri.split('/').pop() || 'image.jpg',
          type: 'image/jpeg',
        });
      }
      formData.append('title', productName);
      formData.append('size', productSize);
      formData.append('description', productDescription);
      // Convert comma to period for API compatibility
      formData.append('price', productPrice.replace(',', '.'));
      formData.append('price_type', productType);
      formData.append('category', productCategory);
      if (productOldPrice) {
        formData.append('old_price', productOldPrice.replace(',', '.'));
      }

      let response;
      if (editingProduct) {
        response = await axios.patch(
          `https://water-supplier-2.onrender.com/api/k1/products/updateProduct/${editingProduct._id || editingProduct.id}`,
          formData,   
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        setSuccessMessage({
          title: 'تم التعديل بنجاح',
          message: 'تم تعديل المنتج بنجاح'
        });
      } else {
        response = await axios.post(
          'https://water-supplier-2.onrender.com/api/k1/products/createProduct',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        setSuccessMessage({
          title: 'تمت الإضافة بنجاح',
          message: 'تم إضافة المنتج بنجاح'
        });
      }

      setShowSuccessModal(true);
      // Remove auto dismiss and navigation - let user manually close
      // setTimeout(() => {
      //   setShowSuccessModal(false);
      //   navigation.goBack();
      // }, 2000);

    } catch (err) {
      console.log("err", err);
      setErrorMessage({
        title: 'خطأ في الحفظ',
        message: err.response?.data?.message || err.message || 'حدث خطأ أثناء حفظ المنتج'
      });
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Add these validation functions after the state declarations
  // Price validation functions that handle both comma (,) and period (.) as decimal separators
  // This is important for Jordan and other regions where comma is the standard decimal separator
  
  const handleSizeChange = (text) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    setProductSize(numericValue);
  };

  const handlePriceChange = (text) => {
    // Allow numbers, comma, and period
    const numericValue = text.replace(/[^0-9,.]/g, '');
    
    // Replace comma with period for internal processing
    const normalizedValue = numericValue.replace(',', '.');
    
    // Ensure only one decimal point
    const parts = normalizedValue.split('.');
    if (parts.length > 2) {
      // If multiple decimal separators, keep only the first one
      const result = parts[0] + '.' + parts.slice(1).join('');
      setProductPrice(result);
    } else {
      // For display, show comma if that's what user typed
      setProductPrice(numericValue);
    }
  };

  const handleOldPriceChange = (text) => {
    // Allow numbers, comma, and period
    const numericValue = text.replace(/[^0-9,.]/g, '');
    
    // Replace comma with period for internal processing
    const normalizedValue = numericValue.replace(',', '.');
    
    // Ensure only one decimal separator
    const parts = normalizedValue.split('.');
    if (parts.length > 2) {
      // If multiple decimal separators, keep only the first one
      const result = parts[0] + '.' + parts.slice(1).join('');
      setProductOldPrice(result);
    } else {
      // For display, show comma if that's what user typed
      setProductOldPrice(numericValue);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        {/* <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity> */}
        <View style={{ flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
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
          <CustomText style={[globalStyles.inputLabel, styles.inputLabel]}>اسم المنتج</CustomText>
          <TextInput 
            style={globalStyles.input} 
            placeholder="أدخل اسم المنتج" 
            placeholderTextColor={colors.textDisabled}
            value={productName}
            onChangeText={setProductName}
          />
        </View>
        <View style={globalStyles.inputContainer}>
          <CustomText style={[globalStyles.inputLabel, styles.inputLabel]}>فئة المنتج</CustomText>
          <TouchableOpacity 
            style={styles.dropdownContainer}
            onPress={() => {
              // This will trigger the picker to open
              if (this.pickerRef) {
                this.pickerRef.togglePicker(true);
              }
            }}
          >
            <RNPickerSelect
              ref={(ref) => {
                this.pickerRef = ref;
              }}
              onValueChange={(value) => setProductCategory(value)}
              value={productCategory}
              items={[
               
                ...categories.map((category) => ({
                  label: category.title,
                  value: category.id || category._id,
                }))
              ]}
              style={{
                inputIOS: {
                  color: colors.textPrimary,
                  fontSize: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  width: '100%',
                },
                inputAndroid: {
                  color: colors.textPrimary,
                  fontSize: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  width: '100%',
                },
                placeholder: {
                  color: colors.textDisabled,
                },
                iconContainer: {
                  top: 12,
                  left: 0,
                },
              }}
              placeholder={{ label: 'اختر فئة المنتج', value: '' }}
              useNativeAndroidPickerStyle={false}
             
              touchableWrapperProps={{
                style: {
                  flex: 1,
                },
              }}
            />
<Ionicons 
                  name="chevron-down" 
                  size={20} 
                  color={colors.textPrimary} 
                  style={styles.dropdownIcon}
                />
          </TouchableOpacity>
        </View>
        <View style={globalStyles.inputContainer}>
          <CustomText style={[globalStyles.inputLabel, styles.inputLabel]}>حجم المنتج</CustomText>
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
          <CustomText style={[globalStyles.inputLabel, styles.inputLabel]}>وصف المنتج</CustomText>
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
          <CustomText style={[globalStyles.inputLabel, styles.inputLabel]}>نوع المنتج</CustomText>
          <TouchableOpacity 
            style={styles.dropdownContainer}
            onPress={() => {
              if (this.typePickerRef) {
                this.typePickerRef.togglePicker(true);
              }
            }}
          >
            <RNPickerSelect
              ref={ref => { this.typePickerRef = ref; }}
              onValueChange={setProductType}
              value={productType}
              items={[
                { label: 'منتج نقدي', value: 'money' },
                { label: 'منتج كوبون', value: 'coupon' },
              ]}
              style={{
                inputIOS: {
                  color: colors.textPrimary,
                  fontSize: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  width: '100%',
                },
                inputAndroid: {
                  color: colors.textPrimary,
                  fontSize: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  width: '100%',
                },
                placeholder: {
                  color: colors.textDisabled,
                },
                iconContainer: {
                  top: 12,
                  left: 0,
                },
              }}
              placeholder={{ label: 'اختر نوع المنتج', value: '' }}
              useNativeAndroidPickerStyle={false}
              touchableWrapperProps={{ style: { flex: 1 } }}
            />
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={colors.textPrimary} 
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={globalStyles.inputContainer}>
          <CustomText style={[globalStyles.inputLabel, styles.inputLabel]}>سعر المنتج</CustomText>
          <TextInput 
            style={globalStyles.input} 
            placeholder="أدخل السعر (مثال: 1,30 أو 1.30)" 
            placeholderTextColor={colors.textDisabled}
            keyboardType="decimal-pad"
            value={productPrice}
            onChangeText={handlePriceChange}
          />
        </View>
        <View style={globalStyles.inputContainer}>
          <CustomText style={[globalStyles.inputLabel, styles.inputLabel]}>السعر القديم (اختياري)</CustomText>
          <TextInput 
            style={globalStyles.input} 
            placeholder="أدخل السعر القديم (مثال: 1,30 أو 1.30)" 
            placeholderTextColor={colors.textDisabled}
            keyboardType="decimal-pad"
            value={productOldPrice}
            onChangeText={handleOldPriceChange}
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

      <SuccessModal
        visible={showSuccessModal}
        title={successMessage.title}
        message={successMessage.message}
        onClose={() => setShowSuccessModal(false)}
        onButtonPress={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
        buttonText="حسناً"
      />

      <ErrorModal
        visible={showErrorModal}
        title={errorMessage.title}
        message={errorMessage.message}
        onClose={() => setShowErrorModal(false)}
        buttonText="حسناً"
      />
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
  disabledButton: {
    opacity: 0.7,
  },
  inputLabel: {
    // marginBottom: 4,
    // marginTop: 8,
    textAlign: Platform.OS === 'ios' ? 'left' : 'right',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48, // Ensure minimum touchable height
  },
  dropdownIcon: {
    // marginRight: 10,
  },
}); 