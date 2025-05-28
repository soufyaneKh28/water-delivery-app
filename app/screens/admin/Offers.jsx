import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabase';
import BackBtn from '../../components/common/BackButton';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styling/colors';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      Alert.alert('خطأ', 'تعذر جلب العروض');
    } else {
      setOffers(data);
    }
    setLoading(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('عذراً', 'نحتاج إلى إذن للوصول إلى معرض الصور!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 1],
      quality: 0.8,
      maxWidth: 2000,
      maxHeight: 1000,
    });
    if (!result.canceled) {
      // TODO: Upload image to Supabase Storage and get public URL
      // For now, just add the local uri as a placeholder
      const imageUrl = result.assets[0].uri;
      // Save to DB
      const { error } = await supabase
        .from('offers')
        .insert([{ image_url: imageUrl }]);
      if (error) {
        Alert.alert('خطأ', 'تعذر إضافة العرض');
      } else {
        fetchOffers();
      }
    }
  };

  const deleteOffer = async (id) => {
    Alert.alert('تأكيد', 'هل أنت متأكد من حذف هذا العرض؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive', onPress: async () => {
          const { error } = await supabase
            .from('offers')
            .delete()
            .eq('id', id);
          if (error) {
            Alert.alert('خطأ', 'تعذر حذف العرض');
          } else {
            fetchOffers();
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <BackBtn />
        <CustomText type="bold" style={styles.headerTitle}>إدارة عروض السلايدر</CustomText>
        <View style={{ width: 28 }} />
      </View>
      <TouchableOpacity style={styles.addButton} onPress={pickImage}>
        <Ionicons name="add" size={24} color="#fff" />
        <CustomText style={styles.addButtonText}>إضافة عرض جديد</CustomText>
      </TouchableOpacity>
      <FlatList
        data={offers}
        keyExtractor={item => item.id}
        refreshing={loading}
        onRefresh={fetchOffers}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.offerRow}>
            <Image source={{ uri: item.image_url }} style={styles.offerImage} />
            <TouchableOpacity onPress={() => deleteOffer(item.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<CustomText style={{ textAlign: 'center', marginTop: 40 }}>لا توجد عروض حالياً</CustomText>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    direction: 'rtl',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    color: '#222',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 18,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  offerImage: {
    width: 180,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  deleteBtn: {
    marginLeft: 12,
    padding: 6,
  },
}); 