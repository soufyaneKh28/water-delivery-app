import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import BackButton from '../../components/common/BackButton';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { colors } from '../../styling/colors';
import { api } from '../../utils/api';

export default function CouponBooks({ navigation }) {
  const [couponBooks, setCouponBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    couponCount: '',
    price: ''
  });

  const fetchCouponBooks = async () => {
    setIsLoading(true);
    try {
      const response = await api.getCouponProducts();
      console.log('API Response for coupon books:', response);
      // Handle different response structures
      const data = Array.isArray(response) ? response : (response?.data || response?.products || []);
      console.log('Processed data for books:', data);
      // Filter coupon books only
    //   const books = data.filter(item => item.type === 'book');
      setCouponBooks(data);
    } catch (error) {
      console.error('Error fetching coupon books:', error);
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: 'حدث خطأ أثناء جلب دفاتر الكوبونات',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCouponBooks();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchCouponBooks();
  }, []);

  const resetForm = () => {
    setFormData({
      couponCount: '',
      price: ''
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    // Try to get coupon count from field if exists, otherwise parse from title
    const parsedCount = book.coupon_count != null
      ? String(book.coupon_count)
      : (book.title ? (book.title.match(/\d+/)?.[0] || '') : '');
    setFormData({
      couponCount: parsedCount,
      price: book.price?.toString() || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedBook(null);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!formData.couponCount.trim() || !formData.price.trim()) {
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: 'يرجى ملء جميع الحقول المطلوبة',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const bookData = {
        title: `دفتر ${parseInt(formData.couponCount, 10)} كوبون`,
        price: parseFloat(formData.price),
        coupon_count: parseInt(formData.couponCount, 10),
        price_type: 'coupon',
        type: 'book'
      };

      if (showEditModal) {
        try {
          await api.updateCouponProduct(selectedBook.id, bookData);
        } catch (updateError) {
          console.log('Coupon product update failed, trying regular product update:', updateError);
          // Fallback to regular product update if coupon product update fails
          await api.updateProduct(selectedBook.id, bookData);
        }
        Toast.show({
          type: 'success',
          text1: 'تم التحديث',
          text2: 'تم تحديث دفتر الكوبونات بنجاح',
          position: 'top',
          visibilityTime: 3000,
        });
      } else {
        await api.createCouponProduct(bookData);
        Toast.show({
          type: 'success',
          text1: 'تم الإضافة',
          text2: 'تم إضافة دفتر الكوبونات بنجاح',
          position: 'top',
          visibilityTime: 3000,
        });
      }

      closeModals();
      await fetchCouponBooks();
    } catch (error) {
      console.error('Error saving coupon book:', error);
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteCouponProduct(selectedBook.id);
      Toast.show({
        type: 'success',
        text1: 'تم الحذف',
        text2: 'تم حذف دفتر الكوبونات بنجاح',
        position: 'top',
        visibilityTime: 3000,
      });
      closeModals();
      await fetchCouponBooks();
    } catch (error) {
      // Handle JSON parse errors specifically
      let errorMessage = 'حدث خطأ أثناء حذف البيانات';
      if (error.message && error.message.includes('JSON Parse error')) {
        errorMessage = 'تم حذف الدفتر بنجاح (استجابة غير متوقعة من الخادم)';
        // If it's a JSON parse error, it might actually be successful
        closeModals();
        await fetchCouponBooks();
        Toast.show({
          type: 'success',
          text1: 'تم الحذف',
          text2: errorMessage,
          position: 'top',
          visibilityTime: 3000,
        });
        return;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Log only non-JSON-parse errors
      console.error('Error deleting coupon book:', error);

      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderBookCard = (book) => (
    <View key={book.id} style={styles.bookCard}>
      <View style={styles.bookImageContainer}>
        <Image
          source={book.image_url ? { uri: book.image_url } : require('../../../assets/icons/coupons_active.png')}
          style={styles.bookImage}
        />
      </View>
      <View style={styles.bookInfo}>
        <CustomText type="bold" style={styles.bookTitle}>{book.title}</CustomText>
        <CustomText style={styles.bookPrice}>{book.price} دينار</CustomText>
      </View>
      <View style={styles.bookActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(book)}
        >
          <Ionicons name="create-outline" size={18} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => openDeleteModal(book)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFormModal = () => (
    <Modal
      visible={showAddModal || showEditModal}
      transparent
      animationType="slide"
      onRequestClose={closeModals}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <CustomText type="bold" style={styles.modalTitle}>
              {showEditModal ? 'تعديل دفتر الكوبونات' : 'إضافة دفتر كوبونات جديد'}
            </CustomText>
            <TouchableOpacity onPress={closeModals} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <CustomText type="medium" style={styles.inputLabel}>عدد الكوبونات في الدفتر *</CustomText>
              <TextInput
                style={styles.textInput}
                value={formData.couponCount}
                onChangeText={(text) => setFormData(prev => ({ ...prev, couponCount: text.replace(/[^0-9]/g, '') }))}
                placeholder="مثال: 25"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <CustomText type="medium" style={styles.inputLabel}>السعر (دينار) *</CustomText>
              <TextInput
                style={styles.textInput}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                placeholder="مثال: 25"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <PrimaryButton
              title={isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={styles.saveButton}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeModals}
              disabled={isSubmitting}
            >
              <CustomText style={styles.cancelButtonText}>إلغاء</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <CustomText type="bold" style={styles.headerTitle}>إدارة دفاتر الكوبونات</CustomText>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <CustomText style={styles.loadingText}>جاري التحميل...</CustomText>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {couponBooks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Image
                source={require('../../../assets/icons/coupons_active.png')}
                style={styles.emptyImage}
              />
              <CustomText type="bold" style={styles.emptyTitle}>لا توجد دفاتر كوبونات</CustomText>
              <CustomText style={styles.emptyText}>ابدأ بإضافة دفتر كوبونات جديد</CustomText>
            </View>
          ) : (
            couponBooks.map(renderBookCard)
          )}
        </ScrollView>
      )}

      {renderFormModal()}

      <ConfirmationModal
        visible={showDeleteModal}
        onClose={closeModals}
        onConfirm={handleDelete}
        title="حذف دفتر الكوبونات"
        message={`هل أنت متأكد أنك تريد حذف "${selectedBook?.title}"؟`}
        confirmText={isDeleting ? 'جاري الحذف...' : 'حذف'}
        cancelText="إلغاء"
        type="danger"
        loading={isDeleting}
      />
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bookCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  bookImageContainer: {
    marginLeft: 12,
  },
  bookImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  bookInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  bookTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  bookPrice: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 2,
  },
  bookCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  bookDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  bookActions: {
    flexDirection: 'row',
    marginRight: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
    backgroundColor: colors.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
