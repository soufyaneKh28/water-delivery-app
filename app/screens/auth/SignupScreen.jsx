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
import PhoneInput from "../../components/common/PhoneInput"
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
  const [username, setUsername] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [fullPhoneNumber, setFullPhoneNumber] = useState("")
  const [phoneError, setPhoneError] = useState("")

  const handlePhoneChange = (phoneNumber, fullPhoneNumber) => {
    setPhoneNumber(phoneNumber);
    setFullPhoneNumber(fullPhoneNumber);
    if (phoneError && phoneNumber.length >= 9) setPhoneError("");
  };

  const handleSignUp = async () => {
    // Trim inputs for validation
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const sanitizedUsername = trimmedUsername.replace(/\s+/g, "_");

    // Validate required fields
    if (!trimmedEmail || !password || !confirmPassword || !trimmedUsername || !phoneNumber) {
      Alert.alert("خطأ", "الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    // Username should not be the same as email
    if (trimmedUsername.toLowerCase() === trimmedEmail.toLowerCase()) {
      Alert.alert("خطأ", "اسم المستخدم لا يمكن أن يكون نفس البريد الإلكتروني");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("خطأ", "الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      Alert.alert("خطأ", "كلمات المرور غير متطابقة");
      return;
    }

    // Validate phone number
    if (phoneNumber.length < 9) {
      setPhoneError("الرجاء إدخال رقم هاتف صحيح");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting signup with:', { email: trimmedEmail, username: sanitizedUsername, phone: fullPhoneNumber });

      const response = await fetch("https://water-supplier-2.onrender.com/api/k1/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          username: sanitizedUsername,
          phone: fullPhoneNumber,
        }),
      });

      const data = await response.json()
      console.log('Signup response:', { status: response.status, data });

      if (!response.ok) {
        console.error('Signup error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.message || data.error || "حدث خطأ أثناء إنشاء الحساب")
      }

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
      console.error('Signup error details:', error);
      Alert.alert(
        "خطأ",
        error.message || "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى."
      )
    } finally {
      setIsLoading(false)
    }
  }
console.log(username, email, password, confirmPassword, phoneNumber, fullPhoneNumber);

  return (
    <KeyboardAvoidingView style={globalStyles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar style="dark" backgroundColor={colors.primary}/>
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
            <View style={styles.inputContainer}>
              <CustomText style={styles.inputLabel}>اسم المستخدم</CustomText>
              <TextInput
                style={globalStyles.input}
                placeholder="اسم المستخدم"
                value={username}
                onChangeText={setUsername}
                editable={!isLoading}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputContainer}>
              <CustomText style={styles.inputLabel}>البريد الإلكتروني</CustomText>
              <TextInput
                style={globalStyles.input}
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <PhoneInput
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              error={phoneError}
              disabled={isLoading}
            />

            <View style={styles.inputContainer}>
              <CustomText style={styles.inputLabel}>كلمة المرور</CustomText>
              <View style={styles.passwordContainer}>
                <TouchableOpacity
                  style={styles.passwordVisibilityButton}
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
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <CustomText style={styles.inputLabel}>تأكيد كلمة المرور</CustomText>
              <View style={styles.passwordContainer}>
                <TouchableOpacity
                  style={styles.passwordVisibilityButton}
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
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <CustomText type="bold" style={styles.buttonText}>
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
    marginTop: 20,
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
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: 'right',
  },
  passwordVisibilityButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  signupButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
