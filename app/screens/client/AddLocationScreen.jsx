import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import { colors } from '../../styling/colors';
import { globalStyles } from '../../styling/globalStyles';

export default function AddLocationScreen({ route, navigation }) {
  const locationData = route.params?.location;
  
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [additionalDirections, setAdditionalDirections] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (locationData?.address) {
      const { street, city: addressCity, region } = locationData.address;
      setAddress(street || '');
      setCity(addressCity || region || '');
    }
  }, [locationData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!label.trim()) {
      newErrors.label = 'اسم العنوان مطلوب';
    }
    if (!address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }
    if (!city.trim()) {
      newErrors.city = 'المدينة مطلوبة';
    }
    if (!buildingNumber.trim()) {
      newErrors.buildingNumber = 'رقم المبنى مطلوب';
    }
    if (!floor.trim()) {
      newErrors.floor = 'الطابق مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // Create the location object with all the data
    const locationDetails = {
      label,
      address,
      city,
      buildingNumber,
      floor,
      additionalDirections,
      coordinates: locationData ? {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      } : null,
    };

    // Here you would typically save the location to your backend
    console.log('Saving location:', locationDetails);
    
    // Navigate to home page
    navigation.navigate('ClientTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackBtn />
          <CustomText type="bold" style={styles.headerTitle}>إضافة عنوان جديد</CustomText>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.form}>
          <View>
            <CustomText type="bold" style={styles.label}>اسم العنوان *</CustomText>
            <TextInput
              style={[globalStyles.input, errors.label && styles.inputError]}
              placeholder="مثال: المنزل، العمل"
              value={label}
              onChangeText={(text) => {
                setLabel(text);
                if (errors.label) {
                  setErrors(prev => ({ ...prev, label: null }));
                }
              }}
              textAlign="right"
            />
            {errors.label && <CustomText style={styles.errorText}>{errors.label}</CustomText>}
          </View>

          <View>
            <CustomText type="bold" style={styles.label}>العنوان *</CustomText>
            <TextInput
              style={[globalStyles.input, errors.address && styles.inputError]}
              placeholder="اكتب العنوان هنا"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (errors.address) {
                  setErrors(prev => ({ ...prev, address: null }));
                }
              }}
              textAlign="right"
            />
            {errors.address && <CustomText style={styles.errorText}>{errors.address}</CustomText>}
          </View>

          <View>
            <CustomText type="bold" style={styles.label}>المدينة *</CustomText>
            <TextInput
              style={[globalStyles.input, errors.city && styles.inputError]}
              placeholder="اكتب اسم المدينة"
              value={city}
              onChangeText={(text) => {
                setCity(text);
                if (errors.city) {
                  setErrors(prev => ({ ...prev, city: null }));
                }
              }}
              textAlign="right"
            />
            {errors.city && <CustomText style={styles.errorText}>{errors.city}</CustomText>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <CustomText type="bold" style={styles.label}>رقم المبنى *</CustomText>
              <TextInput
                style={[globalStyles.input, errors.buildingNumber && styles.inputError]}
                placeholder="مثال: 123"
                value={buildingNumber}
                onChangeText={(text) => {
                  setBuildingNumber(text);
                  if (errors.buildingNumber) {
                    setErrors(prev => ({ ...prev, buildingNumber: null }));
                  }
                }}
                keyboardType="number-pad"
                textAlign="right"
              />
              {errors.buildingNumber && <CustomText style={styles.errorText}>{errors.buildingNumber}</CustomText>}
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <CustomText type="bold" style={styles.label}>الطابق *</CustomText>
              <TextInput
                style={[globalStyles.input, errors.floor && styles.inputError]}
                placeholder="مثال: 2"
                value={floor}
                onChangeText={(text) => {
                  setFloor(text);
                  if (errors.floor) {
                    setErrors(prev => ({ ...prev, floor: null }));
                  }
                }}
                keyboardType="number-pad"
                textAlign="right"
              />
              {errors.floor && <CustomText style={styles.errorText}>{errors.floor}</CustomText>}
            </View>
          </View>

          <View>
            <CustomText type="bold" style={styles.label}>إرشادات إضافية</CustomText>
            <TextInput
              style={[globalStyles.input, styles.textArea]}
              placeholder="مثال: بجانب البنك، قرب المسجد"
              value={additionalDirections}
              onChangeText={setAdditionalDirections}
              textAlign="right"
              multiline
              numberOfLines={3}
            />
          </View>

          <PrimaryButton 
            title="حفظ العنوان" 
            style={styles.saveButton} 
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    direction: 'rtl',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  form: {
    padding: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'left',
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: -5,
    marginBottom: 14,
    marginRight: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingHorizontal:20
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    flex: 1,
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 30,
  },
}); 