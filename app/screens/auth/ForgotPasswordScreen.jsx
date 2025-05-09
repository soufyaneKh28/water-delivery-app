import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../../lib/supabase";
import CustomText from "../../components/common/CustomText";
import { colors } from "../../styling/colors";
import { globalStyles } from "../../styling/globalStyles";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("خطأ", "الرجاء إدخال البريد الإلكتروني");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'water-delivery-app://reset-password',
      });

      if (error) throw error;

      Alert.alert(
        "تم إرسال رابط إعادة تعيين كلمة المرور",
        "يرجى التحقق من بريدك الإلكتروني واتباع التعليمات لإعادة تعيين كلمة المرور",
        [
          {
            text: "حسناً",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("خطأ", error.message || "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={globalStyles.contentContainer}>
        {/* Blue header with curve */}
        <View style={styles.header} />

        <View style={styles.curveContainer}>
          <View style={styles.curve} />
        </View>

        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <CustomText type="bold" style={globalStyles.title}>نسيت كلمة المرور؟</CustomText>
          </View>

          {/* Subtitle */}
          <CustomText style={globalStyles.subtitle}>
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
          </CustomText>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Field */}
            <View style={globalStyles.inputContainer}>
              <CustomText style={globalStyles.inputLabel}>البريد الإلكتروني</CustomText>
              <TextInput
                style={globalStyles.input}
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Reset Password Button */}
            <TouchableOpacity
              style={[
                globalStyles.button,
                { marginBottom: 40 },
                isLoading && globalStyles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <CustomText type="bold" style={globalStyles.buttonText}>
                {isLoading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
              </CustomText>
            </TouchableOpacity>

            {/* Back to Login */}
            <View style={styles.loginContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("Login")} disabled={isLoading}>
                <CustomText type="bold" style={styles.loginLink}>العودة لتسجيل الدخول</CustomText>
              </TouchableOpacity>
              <CustomText style={styles.loginText}>تذكرت كلمة المرور؟</CustomText>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 420,
    backgroundColor: colors.primary,
    position: "absolute",
    top: -200,
    left: 0,
    right: 0,
  },
  curveContainer: {
    height: 40,
    marginTop: 120,
    overflow: "hidden",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    zIndex: 2,
  },
  curve: {
    height: 80,
    width: "100%",
    backgroundColor: colors.background,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  form: {
    width: "100%",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 5,
  },
  loginLink: {
    fontSize: 14,
    textDecorationLine: "underline",
    color: colors.primary,
    fontWeight: "bold",
  },
}); 