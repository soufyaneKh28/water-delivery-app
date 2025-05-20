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
import { supabase } from "../../../lib/supabase";
import BackBtn from '../../components/common/BackButton';
import CustomText from "../../components/common/CustomText";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../styling/colors";
import { globalStyles } from "../../styling/globalStyles";

export default function EditProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
  });

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

      if (error) {
        throw error;
      }

      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
        email: data.email || "",
      });
    } catch (error) {
      Alert.alert("خطأ", "تعذر تحميل بيانات الحساب");
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      Alert.alert("خطأ", "اسم المستخدم مطلوب");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          updated_at: new Date(),
        })
        .eq("id", user.id);
      if (error) {
        throw error;
      }
      Alert.alert("تم التحديث", "تم تحديث المعلومات بنجاح", [
        { text: "حسناً", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("خطأ", "تعذر تحديث المعلومات");
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  // if (loading) {
  //   return (
  //     <View style={[globalStyles.container, styles.loadingContainer]}>
  //       <ActivityIndicator size="large" color={colors.primary} />
  //     </View>
  //   );
  // }

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
              style={globalStyles.input}
              value={formData.full_name}
              onChangeText={text => setFormData(prev => ({ ...prev, full_name: text }))}
              placeholder="اسم المستخدم"
              placeholderTextColor={colors.gray[400]}
              textAlign="right"
            />
          </View>
          {/* Phone with static country picker */}
          <View style={globalStyles.inputContainer}>
            <CustomText style={globalStyles.inputLabel}>رقم الهاتف</CustomText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* <TouchableOpacity style={[styles.flagPicker, { marginBottom: 0 }]} activeOpacity={0.7}>
                <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Flag_of_Lebanon.svg'}} style={styles.flag} />
                <Ionicons name="chevron-down" size={18} color={colors.gray[500]} style={{marginHorizontal: 2}} />
                <CustomText style={styles.countryCode}>+90</CustomText>
              </TouchableOpacity> */}
              <TextInput
                style={[globalStyles.input, { flex: 1}]}
                value={formData.phone}
                onChangeText={text => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="5356577288"
                placeholderTextColor={colors.gray[400]}
                keyboardType="phone-pad"
                textAlign="right"
              />
            </View>
          </View>
          {/* Email */}
          <View style={globalStyles.inputContainer}>
            <CustomText style={globalStyles.inputLabel}>البريد الإلكتروني</CustomText>
            <TextInput
              style={globalStyles.input}
              value={formData.email}
              onChangeText={text => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="البريد الإلكتروني"
              placeholderTextColor={colors.gray[400]}
              textAlign="right"
              keyboardType="email-address"
              autoCapitalize="none"
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  headerBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    // fontWeight: 'bold',
  },
  form: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
    textAlign: 'right',
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'right',
  },
  phoneRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  flagPicker: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: -1,
    zIndex: 2,
  },
  flag: {
    width: 24,
    height: 18,
    borderRadius: 4,
    marginLeft: 4,
    resizeMode: 'cover',
  },
  countryCode: {
    fontSize: 15,
    color: colors.textPrimary,
    marginHorizontal: 4,
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
}); 