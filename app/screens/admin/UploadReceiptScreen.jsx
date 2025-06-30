import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';
import { api } from '../../utils/api';

export default function UploadReceiptScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params;
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const pickImage = async () => {
    try {
      // Clear any previous selection first
      setSelectedImage(null);
      
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إذن الوصول إلى المعرض لاختيار الصورة');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Disable editing to allow full image selection
        quality: 0.8,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة. يرجى المحاولة مرة أخرى.');
    }
  };

  const takePhoto = async () => {
    try {
      // Clear any previous selection first
      setSelectedImage(null);
      
      // Request camera permissions first
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إذن الوصول إلى الكاميرا لالتقاط صورة');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Disable editing to allow full image capture
        quality: 0.8,
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء التقاط الصورة. يرجى المحاولة مرة أخرى.');
    }
  };

  const showImageSourceOptions = () => {
    Alert.alert(
      'اختر مصدر الصورة',
      'من أين تريد اختيار الصورة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'الكاميرا', onPress: takePhoto },
        { text: 'المعرض', onPress: pickImage }
      ]
    );
  };

  const resetImage = () => {
    setSelectedImage(null);
  };

  const convertImageToJpeg = async (imageUri) => {
    try {
      console.log('Converting image to JPEG...');
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [], // no manipulations
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      console.log('Image converted successfully:', result);
      return result;
    } catch (error) {
      console.error('Error converting image:', error);
      throw new Error('فشل في تحويل الصورة إلى التنسيق المطلوب');
    }
  };

  const processSelectedImage = async (originalImage) => {
    try {
      setIsProcessingImage(true);
      console.log('Processing selected image:', originalImage);
      
      // Convert image to JPEG format
      const convertedImage = await convertImageToJpeg(originalImage.uri);
      
      // Create new image object with converted data
      const processedImage = {
        uri: convertedImage.uri,
        width: convertedImage.width,
        height: convertedImage.height,
        fileName: originalImage.fileName ? 
          originalImage.fileName.replace(/\.[^/.]+$/, '.jpg') : 
          `receipt_${Date.now()}.jpg`,
        type: 'image/jpeg',
        size: convertedImage.size || originalImage.size,
      };
      
      console.log('Processed image:', processedImage);
      setSelectedImage(processedImage);
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء معالجة الصورة');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleUploadReceipt = async () => {
    try {
      if (!selectedImage) {
        Alert.alert('خطأ', 'الرجاء اختيار صورة الإيصال');
        return;
      }

      if (!selectedImage.uri) {
        Alert.alert('خطأ', 'صورة غير صالحة، يرجى اختيار صورة أخرى');
        return;
      }

      setIsUpdating(true);

      // Prepare form data with better error handling
      const formData = new FormData();
      const imageFile = {
        uri: selectedImage.uri,
        name: selectedImage.fileName || `receipt_${Date.now()}.jpg`,
        type: 'image/jpeg', // Always JPEG after conversion
      };
      
      formData.append('image', imageFile);

      console.log('Uploading receipt for order:', order.id);
      console.log('Image data:', imageFile);

      const result = await api.uploadReceipt(order.id, formData);
      
      console.log('Upload result:', result);
      
      if (result.status !== 'success') {
        throw new Error(result.message || 'فشل في رفع الصورة');
      }
      
      Alert.alert(
        'تم التحديث',
        'تم رفع صورة الإيصال بنجاح',
        [
          { 
            text: 'حسناً',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error uploading receipt:', error);
      let errorMessage = 'حدث خطأ أثناء رفع صورة الإيصال. يرجى المحاولة مرة أخرى.';
      
      if (error.message.includes('Network request failed')) {
        errorMessage = 'فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('خطأ', errorMessage, [{ text: 'حسناً' }]);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatLocation = (location) => {
    if (!location) return '';
    const parts = [
      location.label,
      location.description,
      location.floor_no ? `Floor ${location.floor_no}` : null,
      location.building_no ? `Building ${location.building_no}` : null,
      location.city,
      location.region,
    ];
    return parts.filter(Boolean).join(', ');
  };

  function generateOrderNumber(uuid) {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
      hash = ((hash << 5) - hash) + uuid.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    // Make it positive and limit to 8 digits
    return Math.abs(hash).toString().padStart(8, '0').slice(0, 8);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackBtn />
        <CustomText type="bold" style={styles.headerTitle}>إضافة إيصال الدفع</CustomText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Info Card */}
        <View style={styles.orderInfoCard}>
          <CustomText type="bold" style={styles.orderInfoTitle}>معلومات الطلب</CustomText>
          <View style={styles.orderInfoRow}>
            <CustomText style={styles.orderInfoLabel}>رقم الطلب:</CustomText>
            <CustomText style={styles.orderInfoValue}>#{generateOrderNumber(order.id)}</CustomText>
          </View>
          <View style={styles.orderInfoRow}>
            <CustomText style={styles.orderInfoLabel}>العميل:</CustomText>
            <CustomText style={styles.orderInfoValue}>{order.user_id?.username || 'غير معروف'}</CustomText>
          </View>
          <View style={styles.orderInfoRow}>
            <CustomText style={styles.orderInfoLabel}>الموقع:</CustomText>
            <CustomText style={styles.orderInfoValue} numberOfLines={2}>
              {formatLocation(order.location_id)}
            </CustomText>
          </View>
          <View style={styles.orderInfoRow}>
            <CustomText style={styles.orderInfoLabel}>المبلغ:</CustomText>
            <CustomText style={styles.orderInfoValue}>
              {order.total} {order.order_type === 'coupon' ? 'كوبون' : 'دينار'}
            </CustomText>
          </View>
        </View>

        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <CustomText type="bold" style={styles.uploadTitle}>صورة الإيصال</CustomText>
          
          {selectedImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
              <View style={styles.imageActions}>
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={showImageSourceOptions}
                >
                  <Ionicons name="camera-outline" size={20} color="#2196F3" />
                  <CustomText style={styles.changeImageText}>تغيير الصورة</CustomText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.resetImageButton}
                  onPress={resetImage}
                >
                  <Ionicons name="close-outline" size={20} color="#F44336" />
                  <CustomText style={styles.resetImageText}>إلغاء</CustomText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.uploadButton, isProcessingImage && styles.uploadButtonDisabled]} 
              onPress={showImageSourceOptions}
              disabled={isProcessingImage}
            >
              {isProcessingImage ? (
                <ActivityIndicator size="large" color="#2196F3" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={60} color="#2196F3" />
                  <CustomText style={styles.uploadButtonText}>اختر صورة الإيصال</CustomText>
                  <CustomText style={styles.uploadButtonSubtext}>اضغط هنا لاختيار صورة من المعرض</CustomText>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Upload Button */}
        {selectedImage && (
          <TouchableOpacity 
            style={[styles.submitButton, isUpdating && styles.submitButtonDisabled]}
            onPress={handleUploadReceipt}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={24} color="#fff" />
                <CustomText style={styles.submitButtonText}>رفع الإيصال</CustomText>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    color: '#222',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  orderInfoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  orderInfoTitle: {
    fontSize: 18,
    color: '#222',
    marginBottom: 12,
    textAlign: 'right',
  },
  orderInfoRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderInfoLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    minWidth: 80,
  },
  orderInfoValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1,
    marginLeft: 12,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 18,
    color: '#222',
    marginBottom: 16,
    textAlign: 'right',
  },
  uploadButton: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  uploadButtonDisabled: {
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
  uploadButtonText: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  uploadButtonSubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  imageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeImageText: {
    color: '#2196F3',
    fontSize: 16,
    marginLeft: 8,
  },
  resetImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetImageText: {
    color: '#F44336',
    fontSize: 16,
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 