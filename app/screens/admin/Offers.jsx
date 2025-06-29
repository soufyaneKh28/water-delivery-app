import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingOfferId, setDeletingOfferId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        Alert.alert('خطأ', 'لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        return;
      }

      const response = await axios.get(
        'https://water-supplier-2.onrender.com/api/k1/offers/getAllOffers',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      // console.log("response-offers", response.data);
      setOffers(response.data.data);
    } catch (error) {
      Alert.alert('خطأ', 'تعذر جلب العروض: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('عذراً', 'نحتاج إلى إذن للوصول إلى معرض الصور!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 1],
        quality: 0.8,
        maxWidth: 2000,
        maxHeight: 1000,
      });

      if (!result.canceled) {
        setIsUploading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (!token) {
          Alert.alert('خطأ', 'لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
          return;
        }

        // Create form data for the image
        const formData = new FormData();
        // const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name:'image.jpg',
        });

        const response = await axios.post(
          'https://water-supplier-2.onrender.com/api/k1/offers/createOffer',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data) {
          Alert.alert('نجاح', 'تم إضافة العرض بنجاح');
          fetchOffers();

        }
      }
    } catch (error) {
      Alert.alert('خطأ', 'تعذر إضافة العرض: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const deleteOffer = async (id) => {
    Alert.alert('تأكيد', 'هل أنت متأكد من حذف هذا العرض؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', 
        style: 'destructive', 
        onPress: async () => {
          try {
            setIsDeleting(true);
            setDeletingOfferId(id);
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            if (!token) {
              Alert.alert('خطأ', 'لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
              setDeletingOfferId(null);
              setIsDeleting(false);
              return;
            }

            await axios.delete(
              `https://water-supplier-2.onrender.com/api/k1/offers/deleteOffer/${id}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              }
            );
            
            Alert.alert('نجاح', 'تم حذف العرض بنجاح');
            fetchOffers();
          } catch (error) {
            Alert.alert('خطأ', 'تعذر حذف العرض: ' + (error.response?.data?.message || error.message));
          } finally {
            setDeletingOfferId(null);
            setIsDeleting(false);
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <BackBtn />
        <CustomText type="bold" style={styles.headerTitle}>إدارة عروض السلايدر</CustomText>
        <View style={{ width: 28 }} />
      </View>
      <TouchableOpacity 
        style={[styles.addButton, isUploading && styles.disabledButton]} 
        onPress={pickImage}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="add" size={24} color="#fff" />
            <CustomText type="bold" style={styles.addButtonText}>إضافة عرض جديد</CustomText>
          </>
        )}
      </TouchableOpacity>
      <FlatList
        data={offers}
        keyExtractor={item => item._id || item.id}
        refreshing={loading}
        onRefresh={fetchOffers}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.offerRow}>
            <Image source={{ uri: item.image_url }} style={styles.offerImage} />
            <TouchableOpacity 
              onPress={() => deleteOffer(item.id)} 
              style={styles.deleteBtn}
              disabled={deletingOfferId === item._id}
            >
              {deletingOfferId === item._id ? (
                <ActivityIndicator color={colors.error} size="small" />
              ) : (
                <Ionicons name="trash-outline" size={22} color={colors.error} />
              )}
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <CustomText style={{ textAlign: 'center', marginTop: 40 }}>
            {loading ? 'جاري التحميل...' : 'لا توجد عروض حالياً'}
          </CustomText>
        }
      />
      {isDeleting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    direction: 'rtl',
  },
  headerRow: {
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    color: '#222',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 18,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    // fontWeight: 'bold',
    marginLeft: 8,
  },
  offerRow: {
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  offerImage: {
    width: 180,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  deleteBtn: {
    marginLeft: 12,
    padding: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
}); 