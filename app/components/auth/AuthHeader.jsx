import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';

export function AuthHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoIconContainer}>
          <Text style={styles.logoIcon}>+</Text>
        </View>
        <Text style={styles.logoText}>Logoipsum</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconContainer: {
    width: 24,
    height: 24,
    backgroundColor: colors.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});