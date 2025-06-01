import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { colors } from '../../styling/colors';
const placeholderImg = require('../../../assets/images/category-1.png'); // Use your placeholder image path

export default function AddCategory({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  // Fetch categories from API on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setFetchingCategories(true);
    try {
      // Get Bearer token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        alert('لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        return;
      }
      const response = await axios.get(
        'https://water-supplier-2.onrender.com/api/k1/product_categories/getAllCategory',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      setCategories(response.data.data || []);
    } catch (err) {
      alert('فشل تحميل الأقسام: ' + (err.response?.data?.message || err.message));
    } finally {
      setFetchingCategories(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !newImage) return;
    setLoading(true);
    try {
      // Get Bearer token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        alert('لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        setLoading(false);
        return;
      }
      // Prepare FormData
      const formData = new FormData();
      formData.append('title', newCategory.trim());
      formData.append('image', {
        uri: newImage,
        name: newImage.split('/').pop() || 'category.jpg',
        type: 'image/jpeg',
      });
      await axios.post(
        'https://water-supplier-2.onrender.com/api/k1/product_categories/createProductCategory',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      setNewCategory('');
      setNewImage(null);
      fetchCategories();
      alert('تمت إضافة القسم بنجاح');
    } catch (err) {
      alert('حدث خطأ أثناء إضافة القسم: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      // Get Bearer token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        alert('لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        return;
      }

      await axios.delete(
        `https://water-supplier-2.onrender.com/api/k1/product_categories/deleteProductCategory/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      // Update local state after successful deletion
      setCategories(prev => prev.filter(cat => cat.id !== id));
      alert('تم حذف القسم بنجاح');
    } catch (err) {
      alert('حدث خطأ أثناء حذف القسم: ' + (err.response?.data?.message || err.message));
    }
  };

  const pickImage = async () => {
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
    <View style={styles.container}>
      {/* <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="#222" />
        
      </TouchableOpacity> */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' , marginTop: 22 }}>

      <BackBtn/>
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
        <FlatList
          data={categories}
          keyExtractor={item => item.id || item._id}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={styles.categoryRow}>
              <TouchableOpacity 
                onPress={() => handleDeleteCategory(item.id || item._id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={24} color={colors.error} />
              </TouchableOpacity>
              <View style={styles.categoryInfo}>
                <CustomText style={styles.categoryName}>{item.title || item.name}</CustomText>
                <Image source={item.image_url ? { uri: item.image_url } : placeholderImg} style={styles.categoryImg} />
              </View>
            </View>
          )}
        />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
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
  sectionTitle: {
    fontSize: 18,
    color: colors.secondary,
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'left',
  },
  list: {
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  categoryInfo: {
    flexDirection: 'row-reverse',
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
    textAlign: 'left',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
}); 