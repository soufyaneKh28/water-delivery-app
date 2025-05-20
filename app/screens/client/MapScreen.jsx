import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';

const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

const getAddressFromCoords = async (latitude, longitude) => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return;

  try {
    const [address] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    return address;
  } catch (error) {
    console.error("Error getting address:", error);
    return null;
  }
};

const MapScreen = ({ navigation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const initialRegion = {
    latitude: 31.9539,  // Amman's latitude
    longitude: 35.9106, // Amman's longitude
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    setAddress(null); // Reset address when new location is selected
  };

  const handleConfirmLocation = async () => {
    if (!selectedLocation) return;

    setIsLoading(true);
    try {
      const addressData = await getAddressFromCoords(
        selectedLocation.latitude,
        selectedLocation.longitude
      );

      if (addressData) {
        setAddress(addressData);
        // Navigate to AddLocationScreen with the location data
        navigation.navigate('AddLocation', {
          location: {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            address: addressData,
          },
        });
      }
    } catch (error) {
      console.error('Error getting address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={24} color="#000" />
      </TouchableOpacity>
      <MapView
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        onPress={handleMapPress}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
          />
        )}
      </MapView>
      <View style={styles.bottomSheet}>
        <CustomText type='bold' style={styles.bottomSheetTitle}>
          قم بتحديد موقعك على الخريطة لتسهيل عملية التوصيل.
        </CustomText>
        {selectedLocation ? (
          <View style={styles.locationInfo}>
            <CustomText style={styles.locationText}>
              {address ? 
                `${address.street}, ${address.city}, ${address.region}` :
                'جاري تحميل العنوان...'
              }
            </CustomText>
            <CustomText style={styles.coordinatesText}>
              {`Latitude: ${selectedLocation.latitude.toFixed(4)}, Longitude: ${selectedLocation.longitude.toFixed(4)}`}
            </CustomText>
          </View>
        ) : (
          <CustomText style={styles.locationText}>
            انقر على الخريطة لتحديد موقعك
          </CustomText>
        )}
        <PrimaryButton 
          title='تأكيد الموقع' 
          onPress={handleConfirmLocation}
          style={styles.saveButton}
          disabled={!selectedLocation || isLoading}
          loading={isLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  bottomSheetTitle: {
    fontSize: 16,
    color: '#000',
    maxWidth: 250,
    textAlign: 'center',
  },
  locationInfo: {
    marginTop: 10,
    alignItems: 'center',
  },
  locationText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  coordinatesText: {
    color: '#888',
    fontSize: 12,
  },
  saveButton: {
    marginTop: 20,
    width: '100%',
  },
  cancelButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default MapScreen