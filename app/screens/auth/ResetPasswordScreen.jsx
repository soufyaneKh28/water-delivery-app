import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import CustomText from '../../components/common/CustomText';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styling/colors';
import { globalStyles } from '../../styling/globalStyles';

export default function ResetPasswordScreen({ navigation, route }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const token = route?.params?.access_token || route?.params?.token;

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
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
    try {
      await resetPassword(newPassword);
      Alert.alert(
        'تم التحديث',
        'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
        [
          {
            text: 'حسناً',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.white }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Title & Description */}
        <CustomText type="bold" style={styles.title}>إعادة تعيين كلمة المرور</CustomText>
        <CustomText style={styles.description}>
          أدخل كلمة المرور الجديدة لتغيير كلمة المرور الخاصة بك.
        </CustomText>
        {/* Form */}
        <View style={styles.form}>
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
        <TouchableOpacity
          style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          <CustomText type="bold" style={globalStyles.buttonText}>
            {loading ? 'جاري التحديث...' : 'تغيير كلمة المرور'}
          </CustomText>
        </TouchableOpacity>
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
  },
  title: {
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: 8,
    marginTop: 40,
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
}); 