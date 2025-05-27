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
import { supabase } from "../../../lib/supabase";
import BackBtn from '../../components/common/BackButton';
import CustomText from "../../components/common/CustomText";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../styling/colors";
import { globalStyles } from "../../styling/globalStyles";

export default function Security({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      // First, verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("كلمة المرور الحالية غير صحيحة");
      }

      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      Alert.alert("تم التحديث", "تم تغيير كلمة المرور بنجاح", [
        {
          text: "حسناً",
          onPress: () => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            navigation.goBack();
          },
        },
      ]);
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
            <TextInput
              style={globalStyles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="أدخل كلمة المرور الحالية"
              placeholderTextColor={colors.gray[400]}
              secureTextEntry
              textAlign="right"
            />
          </View>

          {/* New Password */}
          <View style={globalStyles.inputContainer}>
            <CustomText style={globalStyles.inputLabel}>كلمة المرور الجديدة</CustomText>
            <TextInput
              style={globalStyles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="أدخل كلمة المرور الجديدة"
              placeholderTextColor={colors.gray[400]}
              secureTextEntry
              textAlign="right"
            />
          </View>

          {/* Confirm New Password */}
          <View style={globalStyles.inputContainer}>
            <CustomText style={globalStyles.inputLabel}>تأكيد كلمة المرور الجديدة</CustomText>
            <TextInput
              style={globalStyles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="أعد إدخال كلمة المرور الجديدة"
              placeholderTextColor={colors.gray[400]}
              secureTextEntry
              textAlign="right"
            />
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