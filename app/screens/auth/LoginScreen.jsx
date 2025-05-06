import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import CustomText from "../../components/common/CustomText"
import { useAuth } from "../../context/AuthContext"
import { colors } from "../../styling/colors"
import { globalStyles } from "../../styling/globalStyles"

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("خطأ", "الرجاء إدخال البريد الإلكتروني وكلمة المرور")
      return
    }

    setIsLoading(true)
    try {
      // TODO: Replace this with your actual API call
      const response = await fetch('YOUR_API_ENDPOINT/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل تسجيل الدخول');
      }

      // Login successful
      await login(data.user, data.token);
      navigation.navigate("Admin", { screen: "Dashboard" });
    } catch (error) {
      Alert.alert("خطأ", error.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateAccount = () => {
    navigation.navigate("SignUp")
  }

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword")
  }

  return (
    <KeyboardAvoidingView style={globalStyles.container} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}>
      <StatusBar style="dark" />
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
              <Text style={styles.forgotPasswordText}>نسيت كلمة المرور؟</Text>
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
              <CustomText style={styles.signupText}>ليس لديك حساب؟</CustomText>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 5,
  },
  signupLink: {
    fontSize: 14,
    textDecorationLine:"underline",
    color: colors.primary,
    fontWeight: "bold",
  },
})
