import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import BackBtn from '../../components/common/BackButton';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import CustomText from '../../components/common/CustomText';
import ErrorModal from '../../components/common/ErrorModal';
import SuccessModal from '../../components/common/SuccessModal';
import { colors } from '../../styling/colors';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingOfferId, setDeletingOfferId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState({ title: '', message: '' });
  const [showAddSuccessModal, setShowAddSuccessModal] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
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
      setErrorMessage({
        title: 'خطأ في التحميل',
        message: 'تعذر جلب العروض: ' + (error.response?.data?.message || error.message)
      });
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage({
          title: 'خطأ في الصلاحيات',
          message: 'عذراً، نحتاج إلى إذن للوصول إلى معرض الصور!'
        });
        setShowErrorModal(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
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
          setErrorMessage({
            title: 'خطأ في المصادقة',
            message: 'لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.'
          });
          setShowErrorModal(true);
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
          setShowAddSuccessModal(true);
          fetchOffers();
        }
      }
    } catch (error) {
      setErrorMessage({
        title: 'خطأ في الإضافة',
        message: 'تعذر إضافة العرض: ' + (error.response?.data?.message || error.message)
      });
      setShowErrorModal(true);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteOffer = async (id) => {
    setSelectedOfferId(id);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteOffer = async () => {
    try {
      setIsDeleting(true);
      setDeletingOfferId(selectedOfferId);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        setErrorMessage({
          title: 'خطأ في المصادقة',
          message: 'لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.'
        });
        setShowErrorModal(true);
        setDeletingOfferId(null);
        setIsDeleting(false);
        return;
      }

      await axios.delete(
        `https://water-supplier-2.onrender.com/api/k1/offers/deleteOffer/${selectedOfferId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      setSuccessMessage('تم حذف العرض بنجاح');
      setShowSuccessModal(true);
      fetchOffers();
    } catch (error) {
      setErrorMessage({
        title: 'خطأ في الحذف',
        message: 'تعذر حذف العرض: ' + (error.response?.data?.message || error.message)
      });
      setShowErrorModal(true);
    } finally {
      setDeletingOfferId(null);
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      setSelectedOfferId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ConfirmationModal
        visible={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setSelectedOfferId(null);
        }}
        onConfirm={confirmDeleteOffer}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا العرض؟"
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
        loading={isDeleting}
      />
      
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="تم الحذف"
        message={successMessage}
        buttonText="حسناً"
      />
      
      <SuccessModal
        visible={showAddSuccessModal}
        onClose={() => setShowAddSuccessModal(false)}
        title="تم الإضافة"
        message="تم إضافة العرض بنجاح"
        buttonText="حسناً"
        onButtonPress={() => {
          setShowAddSuccessModal(false);
          fetchOffers();
        }}
      />

      <ErrorModal
        visible={showErrorModal}
        title={errorMessage.title}
        message={errorMessage.message}
        onClose={() => setShowErrorModal(false)}
        buttonText="حسناً"
      />
      
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
  headerRow: {
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row',
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
    marginTop: 12,
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