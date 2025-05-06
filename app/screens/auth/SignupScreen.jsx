"use client"

import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import {
  Image,
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

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSignup = () => {
    // Implement your signup logic here
    console.log("Signup with:", name, phone, email, password)
  }

  const handleLogin = () => {
    // Navigate to login screen
    navigation.navigate("Login")
  }

  const handleBack = () => {
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    {/* <SafeAreaView style={{flex:1, backgroundColor:"white"}}> */}

      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Blue header with curve */}
        <View style={styles.header} />


        <View style={styles.curveContainer}>
          <View style={styles.curve} />
        </View>
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <View style={styles.backButtonCircle}>
              <Ionicons name="chevron-forward" size={24} color="#333" />
            </View>
          </TouchableOpacity>

          {/* Signup Title */}
          <View style={styles.titleContainer}>
            <CustomText type="bold" style={styles.title}>قم بإنشاء حساب</CustomText>
            <CustomText type="bold" style={styles.title}>جديد</CustomText>
          </View>

          {/* Subtitle */}
          <CustomText type="regular" style={styles.subtitle}>استمتع بخدمة توصيل المياه إلى باب منزلك بكل سهولة وراحة.</CustomText>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Field */}
            <CustomText type="medium" style={styles.inputLabel}>اسم المستخدم</CustomText>
            <TextInput
              style={styles.input}
              placeholder="أدخل اسمك الكامل"
              value={name}
              onChangeText={setName}
              textAlign="right"
              />

            {/* Phone Field */}
            <CustomText type="medium" style={styles.inputLabel}>رقم الهاتف</CustomText>
            <View style={styles.phoneContainer}>
              <TextInput
                style={styles.phoneInput}
                placeholder="رقم الهاتف"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                textAlign="right"
                />
              <TouchableOpacity style={styles.countryCodeButton}>
                <Text style={styles.countryCodeText}>+966</Text>
                <Image
                  source={{ uri: "https://flagcdn.com/w40/sa.png" }}
                  style={styles.flagIcon}
                  resizeMode="contain"
                  />
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Email Field */}
            <CustomText type="medium" style={styles.inputLabel}>البريد الإلكتروني</CustomText>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign="right"
              />

            {/* Password Field */}
            <CustomText type="medium" style={styles.inputLabel}>كلمة المرور</CustomText>
            <View style={styles.passwordContainer}>
              <TouchableOpacity style={styles.passwordVisibilityButton} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#999" />
              </TouchableOpacity>
              <TextInput
                style={styles.passwordInput}
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textAlign="right"
                />
            </View>

            {/* Signup Button */}
            <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
              <CustomText type="bold" style={styles.signupButtonText}>إنشاء الحساب</CustomText>
            </TouchableOpacity>

            {/* Login Prompt */}
            <View style={styles.loginContainer}>
              <TouchableOpacity onPress={handleLogin}>
                <CustomText type="bold" style={styles.loginLink}>قم بتسجيل الدخول</CustomText>
              </TouchableOpacity>
              <CustomText type="medium" style={styles.loginText}>لديك حساب؟</CustomText>
            </View>
          </View>
        </View>
      </ScrollView>
{/* </SafeAreaView> */}
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
    paddingBottom:50,
    zIndex:2,
    backgroundColor:"white"
  },
  header: {
    height: 450,
    width:"100%",
    backgroundColor: "#2196F3",
    // position: "absolute",
    // top:10,
    // left: 0,
    // right: 0,
    marginTop:-300
  },
  // curveContainer: {
  //   height: 40,
  //   marginTop: 120,
  //   overflow: "hidden",
  //   borderTopLeftRadius: 40,
  //   borderTopRightRadius: 40,
  //   zIndex:2
  // },
  // curve: {
  //   height: 40,
  //   width: "100%",
  //   backgroundColor: "white",
  //   borderTopLeftRadius: 40,
  //   borderTopRightRadius: 40,
  //   marginTop: -40,
  // },
  content: {
    // flex: 1,
    paddingHorizontal: 24,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingBottom: 40,
    paddingTop: 30,
    zIndex:2,
    backgroundColor:"white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
  },
  backButton: {
    // position: "absolute",
    // top: -80,
    // right: 20,
    // zIndex: 10,
    justifyContent:"flex-end",
    alignItems:"flex-end"
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderWidth:1,
    borderColor:"#EEEEEE",
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
    marginTop: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 30,
    textAlign: "right",
  },
  form: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textAlign: "right",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  phoneContainer: {
    flexDirection: "row",
    marginBottom: 20,

    gap:10
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 10,
    // marginRight: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333",
    marginHorizontal: 5,
  },
  flagIcon: {
    width: 24,
    height: 16,
    marginRight: 5,
  },
  passwordContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 30,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  passwordVisibilityButton: {
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  signupButton: {
    backgroundColor: "#2196F3",
    borderRadius: 30,
    padding: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  signupButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  loginLink: {
    fontSize: 14,
    textDecorationLine:"underline",
    color: "#2196F3",
    fontWeight: "bold",
  },
})
