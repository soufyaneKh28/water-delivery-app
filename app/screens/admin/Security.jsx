import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import BackBtn from '../../components/common/BackButton';
import CustomText from "../../components/common/CustomText";
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

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("خطأ", "جميع الحقول مطلوبة");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("خطأ", "كلمة المرور الجديدة غير متطابقة");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("خطأ", "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(newPassword, currentPassword);
      Alert.alert(
        "تم التحديث",
        "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.",
        [
          {
            text: "حسناً",
            onPress: () => {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              // The user will be automatically logged out by the resetPassword function
              // and redirected to the login screen
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("خطأ", error.message || "تعذر تغيير كلمة المرور");
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