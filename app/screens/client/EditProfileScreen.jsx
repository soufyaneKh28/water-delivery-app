import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
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
import PhoneInput from '../../components/common/PhoneInput';
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../styling/colors";
import { globalStyles } from "../../styling/globalStyles";

const COUNTRY_CODES = [
  { code: '+966', country: 'السعودية', flag: '🇸🇦' },
  { code: '+971', country: 'الإمارات', flag: '🇦🇪' },
  { code: '+973', country: 'البحرين', flag: '🇧🇭' },
  { code: '+974', country: 'قطر', flag: '🇶🇦' },
  { code: '+965', country: 'الكويت', flag: '🇰🇼' },
  { code: '+968', country: 'عمان', flag: '🇴🇲' },
  { code: '+962', country: 'الأردن', flag: '🇯🇴' },
  { code: '+961', country: 'لبنان', flag: '🇱🇧' },
  { code: '+20', country: 'مصر', flag: '🇪🇬' },
];

export default function EditProfileScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [phoneError, setPhoneError] = useState("");
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);

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
        username: data.username || "",
        email: user.email || "",
        phone: data.phone ? data.phone.replace(/^\+\d+/, '') : "",
      });

      if (data.phone) {
        const storedPhone = data.phone;
        const countryCode = COUNTRY_CODES.find(c => storedPhone.startsWith(c.code)) || COUNTRY_CODES[0];
        setSelectedCountry(countryCode);
        setFormData(prev => ({ ...prev, phone: storedPhone.replace(countryCode.code, '') }));
      }
    } catch (error) {
      Alert.alert("خطأ", "تعذر تحميل بيانات الحساب");
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.phone && formData.phone.length < 9) {
      newErrors.phone = "يرجى إدخال رقم هاتف صحيح";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const fullPhoneNumber = selectedCountry.code + formData.phone;
      const { error } = await supabase
        .from("profiles")
        .update({
          phone: fullPhoneNumber,
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

  const handlePhoneChange = (phoneNumber, fullPhoneNumber) => {
    setFormData(prev => ({ ...prev, phone: phoneNumber }));
    if (phoneError && phoneNumber.length >= 9) setPhoneError("");
  };

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => {
        setSelectedCountry(item);
        setShowCountryModal(false);
      }}
    >
      <CustomText style={styles.countryFlag}>{item.flag}</CustomText>
      <CustomText style={styles.countryName}>{item.country}</CustomText>
      <CustomText style={styles.countryCodeText}>{item.code}</CustomText>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {loading ? (
        <View style={[styles.loadingContainer, { flex: 1 }]}> 
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
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
                style={[globalStyles.input, errors.username && globalStyles.errorInput]}
                value={formData.username}
                editable={false}
                placeholder="اسم المستخدم"
                textAlign="right"
              />
              {errors.username && (
                <CustomText style={globalStyles.errorText}>{errors.username}</CustomText>
              )}
            </View>
            {/* Email */}
            <View style={globalStyles.inputContainer}>
              <CustomText style={globalStyles.inputLabel}>البريد الإلكتروني</CustomText>
              <TextInput
                style={[globalStyles.input, errors.email && globalStyles.errorInput]}
                value={formData.email}
                editable={false}
                placeholder="البريد الإلكتروني"
                textAlign="right"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <CustomText style={globalStyles.errorText}>{errors.email}</CustomText>
              )}
            </View>
            {/* Phone with static country picker */}
            <PhoneInput
              value={formData.phone}
              onChangeText={handlePhoneChange}
              error={errors.phone}
            />
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
      )}

      {/* Country Code Modal */}
      <Modal
        visible={showCountryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CustomText type="bold" style={styles.modalTitle}>اختر رمز الدولة</CustomText>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRY_CODES}
              renderItem={renderCountryItem}
              keyExtractor={item => item.code}
              style={styles.countryList}
            />
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    // paddingVertical: 10,
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlign: 'right',
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
    backgroundColor: '#F8F9FA',
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    color: '#94A3B8',
    opacity: 0.8,
  },
  disabledLabel: {
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  countryList: {
    paddingHorizontal: 20,
  },
  countryItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
}); 