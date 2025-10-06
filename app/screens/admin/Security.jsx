import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackBtn from '../../components/common/BackButton';
import CustomText from "../../components/common/CustomText";
import ErrorModal from '../../components/common/ErrorModal';
import SuccessModal from '../../components/common/SuccessModal';
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../styling/colors";
import { globalStyles } from "../../styling/globalStyles";

export default function Security({ navigation }) {
  const { user, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState({ title: '', message: '' });

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage({
        title: 'بيانات مطلوبة',
        message: 'جميع الحقول مطلوبة'
      });
      setShowErrorModal(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage({
        title: 'كلمات مرور غير متطابقة',
        message: 'كلمة المرور الجديدة غير متطابقة'
      });
      setShowErrorModal(true);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage({
        title: 'كلمة مرور ضعيفة',
        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
      });
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(newPassword, currentPassword);
      setSuccessMessage("تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.");
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage({
        title: 'خطأ في تغيير كلمة المرور',
        message: error.message || 'تعذر تغيير كلمة المرور'
      });
      setShowErrorModal(true);
      console.error("Error changing password:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={globalStyles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <BackBtn />
          <CustomText type="bold" style={styles.headerTitle}>الأمان</CustomText>
          <View style={{ width: 40 }} />
        </View>

        <CustomText type="bold" style={styles.title}>تغيير كلمة المرور</CustomText>

        <View style={styles.form}>
          {/* Current Password */}
          <View style={globalStyles.inputContainer}>
            <CustomText style={globalStyles.inputLabel}>كلمة المرور الحالية</CustomText>
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
            <CustomText style={globalStyles.inputLabel}>كلمة المرور الجديدة</CustomText>
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

          {/* Confirm New Password */}
          <View style={globalStyles.inputContainer}>
            <CustomText style={globalStyles.inputLabel}>تأكيد كلمة المرور الجديدة</CustomText>
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

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleChangePassword}
          disabled={loading}
          activeOpacity={0.8}
        >
          <CustomText type="bold" style={styles.saveButtonText}>
            {loading ? "جاري التحديث..." : "تغيير كلمة المرور"}
          </CustomText>
        </TouchableOpacity>
      </ScrollView>

      <ErrorModal
        visible={showErrorModal}
        title={errorMessage.title}
        message={errorMessage.message}
        onClose={() => setShowErrorModal(false)}
        buttonText="حسناً"
      />

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }}
        title="تم التحديث"
        message={successMessage}
        buttonText="حسناً"
      />
      </SafeAreaView>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 18,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: 24,
    marginTop: 20,
  },
  form: {
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
  },
}); 