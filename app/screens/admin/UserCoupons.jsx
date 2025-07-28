import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import SuccessModal from '../../components/common/SuccessModal';
import { colors } from '../../styling/colors';

export default function UserCoupons() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddingCoupons, setIsAddingCoupons] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [couponAmount, setCouponAmount] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = users.filter(user => 
        (user.username?.toLowerCase().includes(query) || 
         user.email?.toLowerCase().includes(query))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        Alert.alert('خطأ', 'لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        return;
      }

      // Fetch users from profiles table, excluding admin users
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role_name', 'admin')  // Exclude admin users
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch coupons data for each user
      const { data: coupons, error: couponsError } = await supabase
        .from('coupons')
        .select('*');

      if (couponsError) throw couponsError;

      // Combine user data with their coupon balance
      const usersWithCoupons = profiles.map(user => ({
        ...user,
        coupons: coupons.find(c => c.user_id === user.id)?.balance || 0
      }));

      setUsers(usersWithCoupons);
      setFilteredUsers(usersWithCoupons);
    } catch (error) {
      Alert.alert('خطأ', 'تعذر جلب بيانات المستخدمين: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupons = async () => {
    if (!selectedUser || !couponAmount || isNaN(couponAmount) || Number(couponAmount) <= 0) {
      Alert.alert('خطأ', 'الرجاء إدخال قيمة صحيحة للكوبونات');
      return;
    }

    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        Alert.alert('خطأ', 'لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        return;
      }

      // First check if the user has a coupon record
      const { data: existingCoupon, error: checkError } = await supabase
        .from('coupons')
        .select('*')
        .eq('user_id', selectedUser.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // Handle subtracting coupons
      if (!isAdding) {
        if (!existingCoupon) {
          Alert.alert('خطأ', 'لا يمكن خصم كوبونات من مستخدم ليس لديه رصيد');
          setIsUpdating(false);
          return;
        }

        if (Number(couponAmount) > existingCoupon.balance) {
          Alert.alert('خطأ', 'لا يمكن خصم كوبونات أكثر من الرصيد الموجود');
          setIsUpdating(false);
          return;
        }

        // Subtract coupons
        const { error: updateError } = await supabase
          .from('coupons')
          .update({
            balance: existingCoupon.balance - Number(couponAmount),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', selectedUser.id);

        if (updateError) throw updateError;
      } 
      // Handle adding coupons
      else {
        if (existingCoupon) {
          // Add to existing balance
          const { error: updateError } = await supabase
            .from('coupons')
            .update({
              balance: existingCoupon.balance + Number(couponAmount),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', selectedUser.id);

          if (updateError) throw updateError;
        } else {
          // Create new record
          const { error: insertError } = await supabase
            .from('coupons')
            .insert({
              user_id: selectedUser.id,
              balance: Number(couponAmount),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) throw insertError;
        }
      }

      setSuccessMessage(`تم ${isAdding ? 'إضافة' : 'خصم'} ${couponAmount} كوبون بنجاح`);
      setShowSuccessModal(true);
      setModalVisible(false);
      setCouponAmount('');
      setSelectedUser(null);
      setIsAdding(true); // Reset to adding mode
      fetchUsers();
    } catch (error) {
      Alert.alert('خطأ', `تعذر ${isAdding ? 'إضافة' : 'خصم'} الكوبونات: ` + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
    setCouponAmount('');
    setIsUpdating(false);
    setIsAdding(true);
  };

  const renderUserRow = ({ item, index }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <View style={styles.userNameContainer}>
          <CustomText style={styles.userNumber}>#{index + 1}</CustomText>
          <CustomText style={styles.username}>{item.username || item.email}</CustomText>
        </View>
        <CustomText style={styles.couponBalance}>{item.coupons} كوبون</CustomText>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.minusButton]}
          onPress={() => {
            setSelectedUser(item);
            setIsAdding(false);
            setModalVisible(true);
          }}
        >
          <Ionicons name="remove-circle-outline" size={24} color={colors.error} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.addButton]}
          onPress={() => {
            setSelectedUser(item);
            setIsAdding(true);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="تم بنجاح"
        message={successMessage}
        buttonText="حسناً"
      />
      
      <View style={styles.headerRow}>
        <BackBtn />
        <CustomText type="bold" style={styles.headerTitle}>إدارة كوبونات المستخدمين</CustomText>
        <View style={{ width: 28 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن مستخدم..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textDisabled}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <CustomText style={styles.headerText}>اسم المستخدم</CustomText>
        <CustomText style={styles.headerText}>رصيد الكوبونات</CustomText>
        <View style={{ width: 80 }} />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        refreshing={loading}
        onRefresh={fetchUsers}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={renderUserRow}
        ListEmptyComponent={
          <CustomText style={styles.emptyText}>
            {loading ? 'جاري التحميل...' : searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد مستخدمين'}
          </CustomText>
        }
      />

      {/* Add/Subtract Coupons Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeIconButton} 
              onPress={handleCloseModal}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>

            <CustomText type="bold" style={styles.modalTitle}>
              {isAdding ? 'إضافة كوبونات للمستخدم' : 'خصم كوبونات من المستخدم'}
            </CustomText>

            <CustomText style={styles.modalSubtitle}>
              {selectedUser?.username || selectedUser?.email}
            </CustomText>

            <View style={styles.inputContainer}>
              <CustomText style={styles.inputLabel}>عدد الكوبونات</CustomText>
              <TextInput
                style={styles.input}
                placeholder="أدخل عدد الكوبونات"
                value={couponAmount}
                onChangeText={setCouponAmount}
                keyboardType="numeric"
                placeholderTextColor={colors.textDisabled}
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#F2F4F7' }]}
                onPress={handleCloseModal}
                disabled={isUpdating}
              >
                <CustomText style={[styles.modalButtonText, { color: '#666' }]}>إلغاء</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isAdding ? colors.primary : colors.error }]}
                onPress={handleAddCoupons}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <CustomText type="bold" style={[styles.modalButtonText, { color: colors.white }]}>
                    {isAdding ? 'إضافة الكوبونات' : 'خصم الكوبونات'}
                  </CustomText>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.closeBar} />
          </View>
        </View>
      </Modal>
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    color: colors.textPrimary,
  },
  tableHeader: {
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  userRow: {
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    flex: 1,
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userNameContainer: {
    flex: 1,
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
    alignItems: 'center',
    // justifyContent: 'flex-start',
  },
  userNumber: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: Platform.OS === 'ios' ? 'left' : 'right',
    marginLeft: Platform.OS === 'ios' ? 16 : 'auto',
    marginRight: Platform.OS === 'ios' ? 'auto' : 16,
    flex: 1,
  },
  couponBalance: {
    fontSize: 16,
    color: colors.primary,
    marginHorizontal: 16,
  },
  actionButtons: {
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  minusButton: {
    // Additional styles if needed
  },
  addButton: {
    // Additional styles if needed
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeIconButton: {
    position: 'absolute',
    top: 16,
    right: Platform.OS === 'ios' ? 16 : 'auto',
    left: Platform.OS === 'ios' ? 'auto' : 16,
    padding: 4,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 8,
    color: colors.textPrimary,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    marginBottom: 24,
    fontSize: 16,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: Platform.OS === 'ios' ? 'left' : 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    backgroundColor: colors.white,
  },
  modalButtonsRow: {
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 8, 
    borderRadius: 12,
  },
  modalButtonText: {
    fontSize: 16,
    // fontWeight: 'bold',
  },
  closeBar: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
  },
  searchContainer: {
    flexDirection: Platform.OS === 'ios' ? 'row' : 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
}); 