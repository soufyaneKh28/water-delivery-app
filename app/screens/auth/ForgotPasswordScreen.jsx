import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "../../components/common/CustomText";
import ErrorModal from "../../components/common/ErrorModal";
import SuccessModal from "../../components/common/SuccessModal";
import { useAuth } from '../../context/AuthContext';
import { colors } from "../../styling/colors";
import { globalStyles } from "../../styling/globalStyles";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: '', message: '' });
  const { requestPasswordReset } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage({
        title: 'بيانات مطلوبة',
        message: 'الرجاء إدخال البريد الإلكتروني'
      });
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage({
        title: 'خطأ في إرسال الرابط',
        message: error.message || 'حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور'
      });
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{flex:1 , backgroundColor:'white'}}>
<SafeAreaView style={{flex:1 , backgroundColor:'white'}}>
    <KeyboardAvoidingView
    style={globalStyles.container} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
    
      <ScrollView style={{flex:1 , backgroundColor:'white'}} contentContainerStyle={[globalStyles.contentContainer , {  backgroundColor:'white', paddingBottom: 100}]}>
        {/* Blue header with curve */}
        <View style={styles.header} />

        <View style={styles.curveContainer}>
          <View style={styles.curve} />
        </View>

        <View style={styles.content}>
        <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
            >
            <Ionicons name="arrow-forward" size={24} color={colors.primary} />
          </TouchableOpacity>

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

    <ErrorModal
      visible={showErrorModal}
      title={errorMessage.title}
      message={errorMessage.message}
      onClose={() => setShowErrorModal(false)}
      buttonText="حسناً"
    />

    <SuccessModal
      visible={showSuccessModal}
      title="تم إرسال رابط إعادة تعيين كلمة المرور"
      message="يرجى التحقق من بريدك الإلكتروني واتباع التعليمات لإعادة تعيين كلمة المرور. إذا لم تستلم البريد الإلكتروني، يرجى التحقق من مجلد الرسائل غير المرغوب فيها (Spam)."
      onClose={() => setShowSuccessModal(false)}
      buttonText="العودة لتسجيل الدخول"
      onButtonPress={() => {
        setShowSuccessModal(false);
        navigation.navigate("Login");
      }}
    />
              </SafeAreaView>
              </View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 20,
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
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 12,
  },
}); 