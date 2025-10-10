"use client"

import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import { Image, StyleSheet, View } from "react-native"

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    // Navigate to onboarding screen after 2 seconds
    const timer = setTimeout(() => {
      navigation.replace("Onboarding")
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigation])

  return (
    <View style={styles.container}>
  <StatusBar backgroundColor='#fff' style="light" translucent={true} />
      <Image source={require("../../../assets/icon.png")} style={styles.logo} resizeMode="contain" />
      {/* <Text style={styles.title}>AL-JUNAIDI WATER</Text>
      <Text style={styles.arabicTitle}>مياه الجنيدي</Text> */}
      {/* <View style={styles.indicator} /> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
      backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  arabicTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  indicator: {
    width: 100,
    height: 4,
    backgroundColor: "white",
    borderRadius: 2,
    position: "absolute",
    bottom: 50,
  },
})
