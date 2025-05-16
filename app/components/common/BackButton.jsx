import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, TouchableOpacity } from 'react-native';

const BackButton = ({ color = '#222', size = 28, style = {} }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={[{ padding: 6 , borderWidth: 1 , borderColor: '#D2D2D2' }, style]}
      accessibilityLabel="Back"
    //   style={{backgroundColor: 'red'}}
    >
      <Image source={require('../../../assets/icons/arrow-left.png')} style={{width: 24, height: 24 , objectFit: 'cover'}} />
    </TouchableOpacity>
  );
};

export default BackButton; 