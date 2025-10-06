import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";
import BackBtn from '../../components/common/BackButton';
import CustomText from "../../components/common/CustomText";
import SuccessModal from '../../components/common/SuccessModal';
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../styling/colors";
import { globalStyles } from "../../styling/globalStyles";

export default function EditProfile({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      console.log("data-profile", data);
      if (error) {
        throw error;
      }

      setFormData({
        username: data.username || "",
        phone: data.phone || "",
        email: user.email || "",
      });
    } catch (error) {
      Alert.alert("خطأ", "تعذر تحميل بيانات الحساب");
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      Alert.alert("خطأ", "اسم المستخدم مطلوب");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
  
          phone: formData.phone.trim(),
          
          updated_at: new Date(),
        })
        .eq("id", user.id);
      if (error) {
        throw error;
      }
      setSuccessMessage("تم تحديث المعلومات بنجاح");
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert("خطأ", "تعذر تحديث المعلومات");
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={globalStyles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <BackBtn />
          <CustomText type="bold" style={styles.headerTitle}>حسابي</CustomText>
          <View style={{ width: 40 }} />
        </View>
        <CustomText type="bold" style={styles.title}>المعلومات الشخصية</CustomText>

        <View style={styles.form}>
          {/* Username */}
          <View style={globalStyles.inputContainer}>
            <CustomText style={globalStyles.inputLabel}>اسم المستخدم</CustomText>
            <TextInput
              style={[globalStyles.input, styles.disabledInput]}
              value={formData.username}
              onChangeText={text => setFormData(prev => ({ ...prev, username: text }))}
              placeholder="اسم المستخدم"
              placeholderTextColor={colors.gray[400]}
              textAlign="right"
              editable={false}
            />
          </View>
          {/* Phone */}
          <View style={globalStyles.inputContainer}>
            <CustomText style={globalStyles.inputLabel}>رقم الهاتف</CustomText>
            <TextInput
              style={globalStyles.input}
              value={formData.phone}
              onChangeText={text => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="5356577288"
              placeholderTextColor={colors.gray[400]}
              keyboardType="phone-pad"
              textAlign="right"
            />
          </View>
          {/* Email */}
          <View style={globalStyles.inputContainer}>
            <CustomText style={globalStyles.inputLabel}>البريد الإلكتروني</CustomText>
            <TextInput
              style={[globalStyles.input, styles.disabledInput]}
              value={formData.email}
              onChangeText={text => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="البريد الإلكتروني"
              placeholderTextColor={colors.gray[400]}
              textAlign="right"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <CustomText type="bold" style={styles.saveButtonText}>تعديل المعلومات</CustomText>
          )}
        </TouchableOpacity>
      </ScrollView>
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
        title="تم التحديث"
        message={successMessage}
        buttonText="حسناً"
      />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollView: {

    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    // direction:"rtl",
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
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
  },
  disabledInput: {
    backgroundColor: '#F2F2F2',
    color: '#A0A0A0',
    borderColor: '#E0E0E0',
  },
}); 