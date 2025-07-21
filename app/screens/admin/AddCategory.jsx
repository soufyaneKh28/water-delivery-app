import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import BackButton from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { colors } from '../../styling/colors';
import { api } from '../../utils/api';
const placeholderImg = require('../../../assets/images/category-1.png'); // Use your placeholder image path

export default function AddCategory({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  // Fetch categories from API on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setFetchingCategories(true);
    try {
      const response = await api.getCategories();
      setCategories(response.data || []);
    } catch (err) {
      Alert.alert('خطأ', 'فشل تحميل الأقسام: ' + (err.message || 'حدث خطأ غير متوقع'));
    } finally {
      setFetchingCategories(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !newImage) return;
    setLoading(true);
    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append('title', newCategory.trim());
      formData.append('image', {
        uri: newImage,
        name: newImage.split('/').pop() || 'category.jpg',
        type: 'image/jpeg',
      });
      
      await api.addCategory(formData);
      setNewCategory('');
      setNewImage(null);
      fetchCategories();
      Alert.alert('نجح', 'تمت إضافة القسم بنجاح');
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة القسم: ' + (err.message || 'حدث خطأ غير متوقع'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    setDeletingCategoryId(id);
    try {
      console.log('Attempting to delete category with ID:', id);
      
      // Get Bearer token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        Alert.alert('خطأ', 'لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        setDeletingCategoryId(null);
        return;
      }
      
      // Use direct axios call like in Products screen
      await axios.delete(
        `https://water-supplier-2.onrender.com/api/k1/product_categories/deleteProductCategory/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      // Update local state after successful deletion
      setCategories(prev => prev.filter(cat => (cat.id || cat._id) !== id));
      Alert.alert('نجح', 'تم حذف القسم بنجاح');
    } catch (err) {
      console.error('Delete category error:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      // Check if it's a 404 error (category not found)
      if (err.response?.status === 404) {
        // Category might already be deleted, remove from local state anyway
        setCategories(prev => prev.filter(cat => (cat.id || cat._id) !== id));
        Alert.alert('تم الحذف', 'تم حذف القسم بنجاح (كان محذوفاً مسبقاً)');
      } else {
        Alert.alert('خطأ', 'حدث خطأ أثناء حذف القسم: ' + (err.response?.data?.message || err.message || 'حدث خطأ غير متوقع'));
      }
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const pickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('صلاحيات مفقودة', 'يجب السماح للتطبيق بالوصول إلى الصور لاختيار صورة من المعرض.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={{ flex: 1 , backgroundColor: 'white' }} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
        <BackButton/>
        <CustomText type="bold" style={styles.title}>إضافة قسم</CustomText>
        <View style={{ width: 30 }} />
      </View>

      <CustomText type="bold" style={styles.sectionTitle}>الأقسام الحالية</CustomText>
      {fetchingCategories ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : categories.length === 0 ? (
        <CustomText style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 12 }}>
          لا توجد أقسام
        </CustomText>
      ) : (
        <View style={styles.list}>
          {categories.map((item) => (
            <View key={item.id || item._id} style={styles.categoryRow}>
              <TouchableOpacity 
                onPress={() => handleDeleteCategory(item.id || item._id)}
                style={styles.deleteButton}
                disabled={deletingCategoryId === (item.id || item._id)}
              >
                {deletingCategoryId === (item.id || item._id) ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <Ionicons name="trash-outline" size={24} color={colors.error} />
                )}
              </TouchableOpacity>
              <View style={styles.categoryInfo}>
                <CustomText style={styles.categoryName}>{item.title || item.name}</CustomText>
                <Image source={item.image_url ? { uri: item.image_url } : placeholderImg} style={styles.categoryImg} />
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.divider} />
      <CustomText type="bold" style={styles.sectionTitle}>إضافة قسم جديد</CustomText>
      <CustomText style={styles.inputLabel}>اسم القسم</CustomText>
      <TextInput
        style={styles.input}
        placeholder="أدخل اسم القسم"
        placeholderTextColor={colors.textDisabled}
        value={newCategory}
        onChangeText={setNewCategory}
      />
      <CustomText style={styles.inputLabel}>صورة القسم</CustomText>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {newImage ? (
          <Image source={{ uri: newImage }} style={styles.pickedImg} />
        ) : (
          <View style={styles.placeholderImgBox}>
            <Ionicons name="image-outline" size={32} color={colors.textDisabled} />
            <CustomText style={{ color: colors.textDisabled, marginTop: 4 }}>اختر صورة</CustomText>
          </View>
        )}
      </TouchableOpacity>
      <PrimaryButton
        title={loading ? 'جاري الإضافة...' : 'إضافة القسم'}
        onPress={handleAddCategory}
        style={styles.addButton}
        disabled={!newCategory.trim() || !newImage || loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: colors.white,
    paddingHorizontal: 20,
    direction: Platform.OS === 'ios' ? 'rtl' : 'ltr',
  },
  backButton: {
    alignSelf: Platform.OS === 'ios' ? 'flex-end' : 'flex-start',
    marginTop: 12,
    // marginBottom: 8,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
    color: '#222',
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.secondary,
    marginBottom: 8,
    marginTop: 16,
    textAlign: Platform.OS === 'ios' ? 'left' : 'right',
  },
  list: {
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: Platform.OS === 'ios' ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  categoryInfo: {
    flexDirection: Platform.OS === 'ios' ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: colors.backgroundDark,
  },
  categoryName: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 18,
  },
  inputLabel: {
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 8,
    textAlign: Platform.OS === 'ios' ? 'left' : 'right',
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    textAlign: 'right',
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagePicker: {
    width: '100%',
    marginBottom: 14,
    marginTop: 2,
  },
  pickedImg: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderImgBox: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  deleteButton: {
    padding: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    marginBottom: 12,
  },
}); 