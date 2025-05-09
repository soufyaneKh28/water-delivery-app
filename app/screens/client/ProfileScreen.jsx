import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../../lib/supabase";
import CustomText from "../../components/common/CustomText";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../styling/colors";
import { globalStyles } from "../../styling/globalStyles";

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

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

      setProfile(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load profile data");
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color={colors.primary} />
        </View>
        <CustomText type="bold" style={styles.name}>
          {profile?.full_name || "User"}
        </CustomText>
        <CustomText style={styles.email}>{user?.email}</CustomText>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <CustomText type="bold" style={styles.sectionTitle}>
            Personal Information
          </CustomText>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={24} color={colors.gray[500]} />
            <View style={styles.infoContent}>
              <CustomText style={styles.infoLabel}>Full Name</CustomText>
              <CustomText style={styles.infoValue}>
                {profile?.full_name || "Not set"}
              </CustomText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={24} color={colors.gray[500]} />
            <View style={styles.infoContent}>
              <CustomText style={styles.infoLabel}>Phone</CustomText>
              <CustomText style={styles.infoValue}>
                {profile?.phone || "Not set"}
              </CustomText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={24} color={colors.gray[500]} />
            <View style={styles.infoContent}>
              <CustomText style={styles.infoLabel}>Email</CustomText>
              <CustomText style={styles.infoValue}>{user?.email}</CustomText>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <CustomText type="bold" style={styles.editButtonText}>
            Edit Profile
          </CustomText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    alignItems: "center",
    paddingTop: 40,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    color: colors.white,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: colors.gray[800],
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.gray[800],
  },
  editButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  editButtonText: {
    color: colors.white,
    fontSize: 16,
  },
}); 