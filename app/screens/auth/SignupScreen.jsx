"use client"

import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"
import CustomText from "../../components/common/CustomText"
import ErrorModal from "../../components/common/ErrorModal"
import PhoneInput from "../../components/common/PhoneInput"
import SuccessModal from "../../components/common/SuccessModal"
import { useAuth } from "../../context/AuthContext"
import { colors } from "../../styling/colors"
import { globalStyles } from "../../styling/globalStyles"

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState({ title: '', message: '' })
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
    const sanitizedUsername = trimmedUsername.replace(/\s+/g, "_").toLowerCase();

    // Validate required fields
    if (!trimmedEmail || !password || !confirmPassword || !trimmedUsername || !phoneNumber) {
      setErrorMessage({
        title: 'بيانات مطلوبة',
        message: 'الرجاء ملء جميع الحقول المطلوبة'
      });
      setShowErrorModal(true);
      return;
    }

    // Username should not be the same as email
    if (trimmedUsername.toLowerCase() === trimmedEmail.toLowerCase()) {
      setErrorMessage({
        title: 'خطأ في البيانات',
        message: 'اسم المستخدم لا يمكن أن يكون نفس البريد الإلكتروني'
      });
      setShowErrorModal(true);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage({
        title: 'خطأ في البريد الإلكتروني',
        message: 'الرجاء إدخال بريد إلكتروني صحيح'
      });
      setShowErrorModal(true);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setErrorMessage({
        title: 'كلمة مرور ضعيفة',
        message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
      });
      setShowErrorModal(true);
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setErrorMessage({
        title: 'كلمات مرور غير متطابقة',
        message: 'كلمات المرور غير متطابقة'
      });
      setShowErrorModal(true);
      return;
    }

    // Validate phone number
    if (phoneNumber.length < 9) {
      setPhoneError("الرجاء إدخال رقم هاتف صحيح");
      return;
    }

    setIsLoading(true);
    try {
      const requestBody = {
        email: trimmedEmail,
        password: password,
        username: sanitizedUsername,
        confirmPassword: confirmPassword,
        phone: fullPhoneNumber,
      };
      
      console.log('Attempting signup with:', requestBody);
      console.log('Full phone number:', fullPhoneNumber);
      console.log('Phone number length:', fullPhoneNumber?.length);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch("https://water-supplier-2.onrender.com/api/k1/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      console.log('Signup responseeeeee:', { status: response.status, data });

      if (!response.ok) {
        console.error('Signup error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });

        // Handle specific error cases
        
        if (response.status === 400) {
          const message = data.message || data.error || '';
          const lowerMessage = message.toLowerCase();
          
          if (lowerMessage.includes('email') || lowerMessage.includes('البريد')) {
            throw new Error("البريد الإلكتروني مستخدم بالفعل");
          } else if (lowerMessage.includes('username') || lowerMessage.includes('اسم المستخدم') || lowerMessage.includes('user name')) {
            throw new Error("اسم المستخدم مستخدم بالفعل");
          } else if (lowerMessage.includes('phone') || lowerMessage.includes('الهاتف')) {
            throw new Error("رقم الهاتف مستخدم بالفعل");
          } else {
            throw new Error("بيانات غير صحيحة");
          }
        } else if (response.status === 409) {
          // Check if it's a username conflict specifically
          const message = data.message || data.error || '';
          const lowerMessage = message.toLowerCase();
          
          if (lowerMessage.includes('username') || lowerMessage.includes('اسم المستخدم') || lowerMessage.includes('user name')) {
            throw new Error("اسم المستخدم مستخدم بالفعل");
          } else {
            throw new Error("المستخدم موجود بالفعل");
          }
        } else if (response.status === 422) {
          throw new Error("بيانات غير صحيحة أو غير مكتملة");
        } else if (response.status >= 500) {
          throw new Error("خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً");
        } else {
          // For any other error status, check if it's a username conflict
          const message = data.message || data.error || '';
          const lowerMessage = message.toLowerCase();
          
          if (lowerMessage.includes('username') || lowerMessage.includes('اسم المستخدم') || lowerMessage.includes('user name')) {
            throw new Error("اسم المستخدم مستخدم بالفعل");
          } else {
            throw new Error("حدث خطأ أثناء إنشاء الحساب");
          }
        }
      }

      // Success case - handle different possible success responses
      if (response.status === 200 || response.status === 201 || data.status === "success" || data.message?.includes("success")) {
        // Show success modal
        setShowSuccessModal(true);
      } else if (data.message && !data.message.includes("error")) {
        // If there's a message but it's not an error, treat as success
        setShowSuccessModal(true);
      } else {
        // Log the actual response for debugging
        console.log('Unexpected response structure:', {
          status: response.status,
          data: data,
          statusText: response.statusText
        });
        throw new Error(data.message || data.error || "حدث خطأ غير متوقع");
      }

    } catch (error) {
      console.error('Signup error details:', error);
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        setErrorMessage({
          title: 'خطأ في الاتصال',
          message: 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى'
        });
        setShowErrorModal(true);
      }
      // Handle network errors
      else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setErrorMessage({
          title: 'خطأ في الاتصال',
          message: 'يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى'
        });
        setShowErrorModal(true);
      } else {
        // Use the Arabic error message we set in the try block
        const arabicMessage = error.message;
        setErrorMessage({
          title: 'خطأ في التسجيل',
          message: arabicMessage || 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.'
        });
        setShowErrorModal(true);
      }
    } finally {
      setIsLoading(false);
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

      <ErrorModal
        visible={showErrorModal}
        title={errorMessage.title}
        message={errorMessage.message}
        onClose={() => setShowErrorModal(false)}
        buttonText="حسناً"
      />

      <SuccessModal
        visible={showSuccessModal}
        title="تم إنشاء الحساب بنجاح"
        message="يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك"
        onClose={() => setShowSuccessModal(false)}
        buttonText="تسجيل الدخول"
        onButtonPress={() => {
          setShowSuccessModal(false);
          navigation.navigate("Login");
        }}
      />
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
