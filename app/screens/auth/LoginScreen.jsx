import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import CustomText from "../../components/common/CustomText"
import ErrorModal from "../../components/common/ErrorModal"
import SuccessModal from "../../components/common/SuccessModal"
import { useAuth } from "../../context/AuthContext"
import { colors } from "../../styling/colors"
import { globalStyles } from "../../styling/globalStyles"

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState({ title: '', message: '' })
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage({
        title: 'بيانات مطلوبة',
        message: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور'
      });
      setShowErrorModal(true);
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
      // Show success modal on successful login
      setShowSuccessModal(true)
    } catch (error) {
      console.log("error",error);
      if (error.message.includes('Email not confirmed')) {
        setErrorMessage({
          title: 'البريد الإلكتروني غير مفعل',
          message: 'يرجى تفعيل بريدك الإلكتروني قبل تسجيل الدخول. تحقق من بريدك الإلكتروني واضغط على رابط التفعيل.'
        });
        setShowErrorModal(true);
      } else if (
        error.message?.toLowerCase().includes('invalid login credentials') ||
        error.message?.toLowerCase().includes('invalid credentials') ||
        error.status === 400
      ) {
        setErrorMessage({
          title: 'خطأ في البيانات',
          message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        });
        setShowErrorModal(true);
      } else {
        setErrorMessage({
          title: 'خطأ في تسجيل الدخول',
          message: error.message || 'حدث خطأ أثناء تسجيل الدخول'
        });
        setShowErrorModal(true);
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAccount = () => {
    navigation.navigate("SignUp")
  }

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword")
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>

        <StatusBar style="dark" translucent={true} backgroundColor={colors.primary} />
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
     

    <KeyboardAvoidingView style={globalStyles.container} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
      <ScrollView contentContainerStyle={globalStyles.contentContainer}>
        {/* Blue header with curve */}
        <View style={styles.header} />

        <View style={styles.curveContainer}>
          <View style={styles.curve} />
        </View>

        <View style={styles.content}>
          {/* Login Title */}
          <View style={styles.titleContainer}>
            <CustomText type="bold" style={globalStyles.title}>تسجيل الدخول إلى</CustomText>
            <CustomText type="bold" style={globalStyles.title}>حسابك</CustomText>
          </View>

          {/* Subtitle */}
          <CustomText style={globalStyles.subtitle}>سجل دخولك للوصول إلى حسابك وبدء طلب المياه بسهولة.</CustomText>

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

            {/* Password Field */}
            <View style={globalStyles.inputContainer}>
              <Text style={globalStyles.inputLabel}>كلمة المرور</Text>
              <View style={globalStyles.passwordContainer}>
                <TouchableOpacity 
                  style={globalStyles.passwordVisibilityButton} 
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  >
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.gray[500]} />
                </TouchableOpacity>
                <TextInput
                  style={globalStyles.passwordInput}
                  placeholder="********"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  />
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer} 
              onPress={handleForgotPassword}
              disabled={isLoading}
              >
              <CustomText  type="regular" style={styles.forgotPasswordText}>نسيت كلمة المرور؟</CustomText>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              style={[
                globalStyles.button, 
                { marginBottom: 40 },
                isLoading && globalStyles.buttonDisabled
              ]} 
              onPress={handleLogin}
              disabled={isLoading}
              >
              <CustomText type="bold" style={globalStyles.buttonText}>
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </CustomText>
            </TouchableOpacity>

            {/* Sign Up Prompt */}
            <View style={styles.signupContainer}>
              <TouchableOpacity 
                onPress={handleCreateAccount}
                disabled={isLoading}
                >
                <CustomText type="bold" style={styles.signupLink}>قم بإنشاء حساب جديد الآن</CustomText>
              </TouchableOpacity>
              <CustomText type="bold" style={styles.signupText}>ليس لديك حساب؟</CustomText>

              {/* <TouchableOpacity onPress={() => navigation.navigate("ResetPassword")}>
                <CustomText type="bold" style={styles.signupLink}>نسيت كلمة المرور؟</CustomText>
              </TouchableOpacity> */}
            </View>

            {/* View as Guest Button */}
            <View style={styles.guestContainer}>
              <CustomText style={styles.guestText}>أو</CustomText>
              <TouchableOpacity 
                style={styles.guestButton}
                onPress={() => navigation.push('Guest')}
                disabled={isLoading}
              >
                <CustomText type="bold" style={styles.guestButtonText}>
                  تصفح كزائر
                </CustomText>
              </TouchableOpacity>
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
      title="تم تسجيل الدخول بنجاح"
      message="مرحباً بك في تطبيق توصيل المياه"
      onClose={() => setShowSuccessModal(false)}
      buttonText="حسناً"
      onButtonPress={() => setShowSuccessModal(false)}
    />
    </SafeAreaView>
                  </View>
  )
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
    zIndex:2
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
    marginTop: 20,
  },
  forgotPasswordContainer: {
    alignItems: "flex-start",
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 5,
  },
  signupLink: {
    fontSize: 12,
    textDecorationLine:"underline",
    color: colors.primary,
    // fontWeight: "bold",
  },
  guestContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  guestText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  guestButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "bold",
  },
})
