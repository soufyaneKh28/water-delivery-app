"use client"

import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"
import CustomText from "../../components/common/CustomText"
import { useAuth } from "../../context/AuthContext"
import { colors } from "../../styling/colors"
import { globalStyles } from "../../styling/globalStyles"

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("خطأ", "الرجاء ملء جميع الحقول المطلوبة")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("خطأ", "كلمات المرور غير متطابقة")
      return
    }

    setIsLoading(true)
    try {
      await signup(email, password, {
        role: 'client', // Set default role as client
        username: email,  
      })

      Alert.alert(
        "تم التسجيل بنجاح",
        "يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك",
        [
          {
            text: "حسناً",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      )
    } catch (error) {
      Alert.alert("خطأ", error.message || "حدث خطأ أثناء إنشاء الحساب")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={globalStyles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
   <StatusBar style="light" backgroundColor={colors.primary}/>
      <ScrollView contentContainerStyle={globalStyles.contentContainer}>
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

          <View style={styles.titleContainer}>
            <CustomText type="bold" style={globalStyles.title}>إنشاء حساب جديد</CustomText>
          </View>

          <CustomText style={globalStyles.subtitle}>قم بإنشاء حساب للوصول إلى خدماتنا</CustomText>

          <View style={styles.form}>
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

            <View style={globalStyles.inputContainer}>
              <CustomText style={globalStyles.inputLabel}>كلمة المرور</CustomText>
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

            <View style={globalStyles.inputContainer}>
              <CustomText style={globalStyles.inputLabel}>تأكيد كلمة المرور</CustomText>
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
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[globalStyles.button, isLoading && globalStyles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <CustomText type="bold" style={globalStyles.buttonText}>
                {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
              </CustomText>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("Login")} disabled={isLoading}>
                <CustomText type="bold" style={styles.loginLink}>تسجيل الدخول</CustomText>
              </TouchableOpacity>
              <CustomText style={styles.loginText}>لديك حساب بالفعل؟</CustomText>
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
    zIndex: 2
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
    marginTop: 20,
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
})
