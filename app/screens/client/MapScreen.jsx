import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Button, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  
      console.log("Address:", address);
      return address;
    } catch (error) {
      console.error("Error getting address:", error);
    }
  };


const MapScreen = ({ navigation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const initialRegion = {
    latitude: 31.9539,  // Amman's latitude
    longitude: 35.9106, // Amman's longitude
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  console.log(selectedLocation);

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
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
      <View style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', paddingVertical: 25, paddingHorizontal: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, alignItems: 'center' }}>
        <CustomText type='bold' style={{ fontSize: 16, color: '#000', maxWidth: 250, textAlign: 'center' }}>
          قم بتحديد موقعك على الخريطة لتسهيل عملية التوصيل.
        </CustomText>
        {selectedLocation ? (
          <CustomText style={{ marginTop: 10, color: '#666' }}>
            {`Latitude: ${selectedLocation.latitude.toFixed(4)}, Longitude: ${selectedLocation.longitude.toFixed(4)}`}
          </CustomText>
        ) : (
          <CustomText style={{ marginTop: 10, color: '#666' }}>
            انقر على الخريطة لتحديد موقعك
          </CustomText>
        )}
        <PrimaryButton 
          title='تأكيد الموقع' 
          onPress={() => {
            if (selectedLocation) {
              console.log('Selected location:', selectedLocation);
            }
          }} 
          style={styles.saveButton}
          disabled={!selectedLocation}
        />
        <Button title='Get Address' style={{ marginTop: 10 }} onPress={() => getAddressFromCoords(selectedLocation.latitude, selectedLocation.longitude)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'red',
    },
    map: {
        flex: 1,
    },
    saveButton: {
        // position: 'absolute',
        bottom: 0,
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