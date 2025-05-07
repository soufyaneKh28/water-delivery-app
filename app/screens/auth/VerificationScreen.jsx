import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import CustomText from "../../components/common/CustomText"

export default function VerificationScreen({ navigation }) {
  const handleBackToLogin = () => {
    navigation.navigate("Login")
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Blue header with curve */}
        {/* <View style={styles.header} /> */}

        <View style={styles.curveContainer}>
          <View style={styles.curve} />
        </View>

        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={40} color="white" />
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <CustomText type="bold" style={styles.title}>تم إنشاء الحساب بنجاح!</CustomText>
          </View>

          {/* Message */}
          <View style={styles.messageContainer}>
            <CustomText style={styles.message}>
              تم إرسال رابط التحقق إلى بريدك الإلكتروني. يرجى التحقق من بريدك الإلكتروني وتفعيل حسابك.
            </CustomText>
          </View>

          {/* Email Icon */}
          <View style={styles.emailIconContainer}>
            <Image
              source={require('../../../assets/images/email-verification.png')}
              style={styles.emailIcon}
              resizeMode="contain"
            />
          </View>

          {/* Back to Login Button */}
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleBackToLogin}
          >
            <CustomText type="bold" style={styles.loginButtonText}>
              العودة إلى تسجيل الدخول
            </CustomText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 50,
    zIndex: 2,
    backgroundColor: "white"
  },
  header: {
    height: 450,
    width: "100%",
    backgroundColor: "#2196F3",
    marginTop: -300
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
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 30,
    zIndex: 2,
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: "#333",
    textAlign: "center",
  },
  messageContainer: {
    marginBottom: 30,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  emailIconContainer: {
    marginBottom: 40,
  },
  emailIcon: {
    width: 200,
    height: 200,
  },
  loginButton: {
    backgroundColor: "#2196F3",
    borderRadius: 30,
    padding: 16,
    width: "100%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
  },
}) 