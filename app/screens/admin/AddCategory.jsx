import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { colors } from '../../styling/colors';
const placeholderImg = require('../../../assets/images/category-1.png'); // Use your placeholder image path

export default function AddCategory({ navigation }) {
  const [categories, setCategories] = useState([
    { id: '1', name: 'عبوات كبيرة', image: placeholderImg },
    { id: '2', name: 'مياه معبأة', image: placeholderImg },
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [newImage, setNewImage] = useState(null);

  const handleAddCategory = () => {
    if (!newCategory.trim() || !newImage) return;
    setCategories(prev => [
      ...prev,
      { id: Date.now().toString(), name: newCategory.trim(), image: { uri: newImage } },
    ]);
    setNewCategory('');
    setNewImage(null);
  };

  const handleDeleteCategory = (id) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
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
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.categoryRow}>
            <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </TouchableOpacity>
            <View style={styles.categoryInfo}>
              <Image source={item.image} style={styles.categoryImg} />
              <CustomText style={styles.categoryName}>{item.name}</CustomText>
            </View>
          </View>
        )}
      />

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
        title="إضافة القسم"
        onPress={handleAddCategory}
        style={styles.addButton}
        disabled={!newCategory.trim() || !newImage}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
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
    alignSelf: 'flex-start',
    marginBottom: 14,
    marginTop: 2,
  },
  pickedImg: {
    width: "100%",
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderImgBox: {
    width: 200,
    height: 60,
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
}); 