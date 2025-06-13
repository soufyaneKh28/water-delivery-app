import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styling/colors';
import { globalStyles } from '../../styling/globalStyles';

export default function ResetPasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { logout, user } = useAuth();
  const updateTimeoutRef = useRef(null);
  const [tempUser, setTempUser] = useState(user);

  // Monitor user changes
  useEffect(() => {
    if (tempUser !== user) {
      setLoading(false);
      Alert.alert(
        "تم التحديث", 
        "تم تغيير كلمة المرور بنجاح",
        [
          {
            text: 'حسناً',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    }
  }, [user, tempUser, navigation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const verifyPasswordUpdate = async () => {
    try {
      console.log('Verifying password update...');
      // Try to sign in with the new password
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: newPassword,
      });

      if (signInError) {
        console.log('Password verification failed:', signInError);
        throw new Error('فشل في التحقق من تحديث كلمة المرور');
      }

      console.log('Password verified successfully');
      setTempUser(user); // This will trigger the user change effect
      setLoading(false);
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء التحقق من تحديث كلمة المرور');
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('خطأ', 'جميع الحقول مطلوبة');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('خطأ', 'كلمة المرور الجديدة غير متطابقة');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
  
    setLoading(true);
    let userEmail = null;

    try {
      console.log('Starting password update process...');
      
      // Get user email
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.email) throw new Error('لا يمكن جلب المستخدم');
      userEmail = user.email;
      console.log('Got user email:', userEmail);
  
      console.log('Verifying current password...');
      // Re-authenticate (simulate password check)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        console.log('Current password verification failed:', signInError);
        Alert.alert('خطأ', 'كلمة المرور الحالية غير صحيحة');
        setLoading(false);
        return;
      }

      console.log('Current password verified, updating to new password...');
      
      // Update password with separate try-catch and longer timeout
      let updateSuccess = false;
      try {
        console.log('Sending password update request...');
        const updatePromise = supabase.auth.updateUser({ password: newPassword });
        
        // Log the promise state
        console.log('Update promise created, waiting for response...');
        
        const { data, error } = await Promise.race([
          updatePromise,
          new Promise((_, reject) => 
            setTimeout(() => {
              console.log('Password update timeout reached after 30 seconds');
              reject(new Error('Password update timed out'));
            }, 30000) // Increased timeout to 30 seconds
          )
        ]);

        if (error) {
          console.log('Password update failed with error:', error);
          throw error;
        }

        console.log('Password update response received:', data);
        updateSuccess = true;
      } catch (updateError) {
        console.error('Error during password update:', updateError);
        if (updateError.message === 'Password update timed out') {
          // Try to verify if the update actually succeeded despite the timeout
          try {
            console.log('Checking if password was updated despite timeout...');
            const { error: verifyError } = await supabase.auth.signInWithPassword({
              email: userEmail,
              password: newPassword,
            });
            
            if (!verifyError) {
              console.log('Password was actually updated successfully');
              updateSuccess = true;
            } else {
              throw updateError;
            }
          } catch (verifyError) {
            console.error('Verification after timeout failed:', verifyError);
            throw updateError;
          }
        } else {
          throw new Error(updateError.message || 'فشل في تحديث كلمة المرور');
        }
      }

      if (!updateSuccess) {
        throw new Error('فشل في تحديث كلمة المرور');
      }

      console.log('Password update successful, updating temp user...');
      setTempUser(user); // This will trigger the user change effect

    } catch (error) {
      console.error('Password update process failed:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء تغيير كلمة المرور');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.white }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
         {/* Header */}
      <View style={styles.header}>
       <BackBtn />
        <CustomText type="bold" style={styles.headerTitle}>الأمان</CustomText>
        <View style={{  width: 40 , height: 40}} />
      </View>
        {/* Title & Description */}
        <CustomText type="bold" style={styles.title}>إعادة تعيين كلمة المرور</CustomText>
        <CustomText style={styles.description}>
          أدخل كلمة المرور الحالية وكلمة المرور الجديدة لتغيير كلمة المرور الخاصة بك.
        </CustomText>
        {/* Form */}
        <View style={styles.form}>
          {/* Current Password */}
          <View style={globalStyles.inputContainer}>
            <CustomText style={globalStyles.inputLabel}>كلمة السر الحالية</CustomText>
            <View style={globalStyles.passwordContainer}>
              <TouchableOpacity
                style={globalStyles.passwordVisibilityButton}
                onPress={() => setShowCurrent((v) => !v)}
              >
                <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.gray[500]} />
              </TouchableOpacity>
              <TextInput
                style={globalStyles.passwordInput}
                placeholder="********"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                textAlign="right"
              />
            </View>
          </View>
          {/* New Password */}
          <View style={globalStyles.inputContainer}>
            <CustomText style={globalStyles.inputLabel}>كلمة السر الجديدة</CustomText>
            <View style={globalStyles.passwordContainer}>
              <TouchableOpacity
                style={globalStyles.passwordVisibilityButton}
                onPress={() => setShowNew((v) => !v)}
              >
                <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.gray[500]} />
              </TouchableOpacity>
              <TextInput
                style={globalStyles.passwordInput}
                placeholder="********"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                textAlign="right"
              />
            </View>
          </View>
          {/* Confirm Password */}
          <View style={globalStyles.inputContainer}>
            <CustomText style={globalStyles.inputLabel}>تأكيد كلمة السر الجديدة</CustomText>
            <View style={globalStyles.passwordContainer}>
              <TouchableOpacity
                style={globalStyles.passwordVisibilityButton}
                onPress={() => setShowConfirm((v) => !v)}
              >
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.gray[500]} />
              </TouchableOpacity>
              <TextInput
                style={globalStyles.passwordInput}
                placeholder="********"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                textAlign="right"
              />
            </View>
          </View>
        </View>
        {/* Submit Button */}
        <PrimaryButton
          title={loading ? 'جاري التحديث...' : 'تغيير كلمة المرور'}
          onPress={handleUpdatePassword}
          style={styles.button}
          disabled={loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    // justifyContent: '',
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 24,
  },
  backButton: {
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    // marginRight: 24,
  },
  title: {
    fontSize: 24,
    color: colors.textPrimary,
    // fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 8,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 24,
  },
  form: {
    marginBottom: 32,
  },
  button: {
    marginTop: 12,
    borderRadius: 24,
    height: 56,
  },
}); 