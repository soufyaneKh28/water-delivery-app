"use client"

import Constants from "expo-constants"
import { useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native"
import CustomText from "../../components/common/CustomText"

const { width, height } = Dimensions.get("window")
const statusBarHeight = Constants.statusBarHeight
const SWIPE_THRESHOLD = 120 // Minimum distance to trigger swipe action

const onboardingData = [
  {
    id: "1",
    image: require("../../../assets/images/onBoarding1.png"),
    title: "راحة في متناول يدك",
    description: "اطلب مياهك المفضلة بجودة عالية وسرعة توصيل سريعة إلى باب منزلك في أي وقت",
    buttonText: "التالي",
    skipText: "تخطي",
  },
  {
    id: "2",
    image: require("../../../assets/images/onBoarding2.png"),
    title: "وفّر أكثر مع العروض والخصومات",
    description: "استمتع بكوبونات وخصومات حصرية داخل التطبيق، وادفع بالطريقة التي تناسبك",
    buttonText: "ابدأ الآن",
    skipText: "",
  },
]

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current
  const translateXAnim = useRef(new Animated.Value(0)).current
  const contentFadeAnim = useRef(new Animated.Value(1)).current
  const contentTranslateYAnim = useRef(new Animated.Value(0)).current
  const swipeTranslateX = useRef(new Animated.Value(0)).current

  const currentItem = onboardingData[currentIndex]

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal movements
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 3)
      },
      onPanResponderGrant: () => {
        // When touch starts
        swipeTranslateX.setValue(0)
      },
      onPanResponderMove: (_, gestureState) => {
        // While dragging
        if (!isAnimating) {
          // Limit the drag distance and add resistance at edges
          const dx = gestureState.dx

          // Add resistance at the edges (first and last screens)
          if ((currentIndex === 0 && dx > 0) || (currentIndex === onboardingData.length - 1 && dx < 0)) {
            swipeTranslateX.setValue(dx / 3) // More resistance
          } else {
            swipeTranslateX.setValue(dx)
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // When touch ends
        if (isAnimating) return

        const { dx } = gestureState

        // Determine if swipe was significant enough
        if (dx < -SWIPE_THRESHOLD && currentIndex < onboardingData.length - 1) {
          // Swipe left -> go to next
          animateTransition(currentIndex + 1, "left")
        } else if (dx > SWIPE_THRESHOLD && currentIndex > 0) {
          // Swipe right -> go to previous
          animateTransition(currentIndex - 1, "right")
        } else {
          // Not enough to trigger change, snap back
          Animated.spring(swipeTranslateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 5,
          }).start()
        }
      },
    }),
  ).current

  const animateTransition = (nextIndex, direction = "left") => {
    if (isAnimating) return
    setIsAnimating(true)

    const isForward = direction === "left"
    const initialTranslateX = isForward ? 100 : -100

    // Fade out current content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(translateXAnim, {
        toValue: isForward ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(contentTranslateYAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(swipeTranslateX, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update index
      setCurrentIndex(nextIndex)

      // Reset animation values
      translateXAnim.setValue(initialTranslateX)
      contentTranslateYAnim.setValue(50)

      // Fade in new content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(translateXAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(contentTranslateYAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start(() => {
        setIsAnimating(false)
      })
    })
  }

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      animateTransition(currentIndex + 1, "right")
    } else {
      navigation.replace("Login")
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      animateTransition(currentIndex - 1, "left")
    }
  }

  const handleSkip = () => {
    navigation.replace("Login")
  }

  // Combined transform for swipe effect
  const combinedTranslateX = Animated.add(translateXAnim, swipeTranslateX)

  return (
    <View style={styles.container}>
      {/* <StatusBar style="dark" translucent /> */}
      <View style={styles.safeArea}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.imageContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: combinedTranslateX }],
            },
          ]}
        >
          <Image source={currentItem.image} style={styles.image} />
        </Animated.View>

        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: contentFadeAnim,
              transform: [{ translateY: contentTranslateYAnim }],
            },
          ]}
        >
          <CustomText type="bold" style={styles.title}>{currentItem.title}</CustomText>
          <CustomText style={styles.description}>{currentItem.description}</CustomText>

          <View style={styles.paginationContainer}>
            {onboardingData.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.paginationDot,
                  idx === currentIndex ?  styles.paginationDotInactive : styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton]}
                onPress={handlePrevious}
                disabled={isAnimating}
              >
                <CustomText type="bold" style={styles.navButtonText}>السابق</CustomText>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={handleNext} disabled={isAnimating}>
              <CustomText type="bold" style={styles.buttonText}>{currentItem.buttonText}</CustomText>
            </TouchableOpacity>
          </View>

          {currentItem.skipText ? (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={isAnimating}>
              <CustomText type="bold" style={styles.skipText}>{currentItem.skipText}</CustomText>
            </TouchableOpacity>
          ) : null}

          {/* <View style={styles.bottomIndicator} /> */}

          {/* <View style={styles.swipeHintContainer}>
            <Text style={styles.swipeHintText}>← اسحب للتنقل →</Text>
          </View> */}
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  safeArea: {
    flex: 1,
  },
  imageContainer: {
    height: height * 0.55,
    // paddingTop: statusBarHeight,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 30,
    paddingTop: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    // fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: "#0078D7",
    width: 20,
  },
  paginationDotInactive: {
    backgroundColor: "#E0E0E0",
  },
  buttonContainer: {
    flexDirection: "row-reverse",
    gap: 10,
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  navButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    backgroundColor: "#0078D7",
    flex: 1,
    marginLeft: 10,
  },
  prevButton: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    marginRight: 10,
  },
  navButtonText: {
    color: "#333",
    fontSize: 18,
    // fontWeight: "bold",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    // fontWeight: "bold",
  },
  skipButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  skipText: {
    color: "#0078D7",
    fontSize: 18,
    // fontWeight: "bold",
  },
  bottomIndicator: {
    width: 100,
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    position: "absolute",
    bottom: 30,
  },
  swipeHintContainer: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
  },
  swipeHintText: {
    color: "#999",
    fontSize: 14,
  },
})
