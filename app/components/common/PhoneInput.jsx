import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../../styling/colors';
import CustomText from './CustomText';

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

export default function PhoneInput({ 
  value, 
  onChangeText, 
  error, 
  label = 'رقم الهاتف',
  placeholder = 'XXXXXXXXX',
  style,
  containerStyle,
}) {
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES.find(country => country.code === '+962'));

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    onChangeText(cleaned, selectedCountry.code + cleaned);
  };

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => {
        setSelectedCountry(item);
        setShowCountryModal(false);
        // Update the full phone number when country code changes
        onChangeText(value, item.code + value);
      }}
    >
      <CustomText style={styles.countryFlag}>{item.flag}</CustomText>
      <CustomText style={styles.countryName}>{item.country}</CustomText>
      <CustomText style={styles.countryCodeText}>{item.code}</CustomText>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={[styles.container, containerStyle]}>
        {label && <CustomText style={styles.label}>{label}</CustomText>}
        <View style={[styles.phoneInputWrapper, error && styles.errorInput, style]}>
          <TextInput
            style={styles.phoneInput}
            value={value}
            onChangeText={handlePhoneChange}
            placeholder={placeholder}
            keyboardType="phone-pad"
            maxLength={15}
            textAlign="left"
          />
          <TouchableOpacity 
            style={styles.countryCodeContainer}
            onPress={() => setShowCountryModal(true)}
          >
            <CustomText style={styles.countryCode}>{selectedCountry.code}</CustomText>
            <CustomText style={styles.countryFlag}>{selectedCountry.flag}</CustomText>
            <Ionicons name="chevron-down" size={16} color="#666" style={{ marginRight: 4 }} />
          </TouchableOpacity>
        </View>
        {error && <CustomText style={styles.errorText}>{error}</CustomText>}
      </View>

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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    // direction: 'ltr',
  },
  label: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'right',
  },
  phoneInputWrapper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  errorInput: {
    borderColor: colors.error,
  },
  countryCodeContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
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
    textAlign: "center",
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'right',
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