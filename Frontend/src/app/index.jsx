import { View, StyleSheet, Image, Animated, StatusBar } from "react-native";
import { Text } from "@components/ui/Text";
import { useTheme } from "@hooks/use-theme";
import { useLayoutEffect, useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";

export default function LandingScreen() {
  const { theme } = useTheme();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const totalScreens = 2;
  const finalScreenIndex = 1;

  const router = useRouter();

  const animateToNextScreen = useCallback(() => {
    if (isAnimating) return;
    if (currentScreen === finalScreenIndex) {
      router.push("/signup");
      return;
    }

    setIsAnimating(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen((prevScreen) => (prevScreen + 1) % totalScreens);

      requestAnimationFrame(() => {
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start(() => {
            setIsAnimating(false);
          });
        }, 50);
      });
    });
  }, [currentScreen, fadeAnim, isAnimating, router]);

  useLayoutEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (isAnimating) return;

    let transitionTimer;

    if (currentScreen === finalScreenIndex) {
      transitionTimer = setTimeout(() => {
        router.push("/signup");
      }, 3000);
    } else {
      transitionTimer = setTimeout(() => {
        animateToNextScreen();
      }, 3000);
    }

    return () => clearTimeout(transitionTimer);
  }, [animateToNextScreen, currentScreen, isAnimating, router]);

  const renderContent = () => {
    switch (currentScreen) {
      case 0:
        return (
          <View style={styles.screenContent} key={1}>
            <Image
              source={require("@assets/Images/onboarding1.png")}
              style={styles.contentImage}
              resizeMode="cover"
            />
            <View style={styles.contextTextContainer} key={2}>
              <Text variant="heading" color="textPrimary" fontWeight="700">
                Hello IFUMSAITE!
              </Text>
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.screenContent}>
            <Image
              source={require("@assets/Images/onboarding2.png")}
              style={styles.contentImage}
              resizeMode="cover"
            />
            <View style={styles.contextTextContainer}>
              <Text
                variant="heading"
                color="textPrimary"
                fontWeight="700"
                align="center"
              >
                Let's learn, grow and succeed together!
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View
        style={[styles.container, { backgroundColor: theme.colors.primary }]}
      >
        <Animated.View
          style={[
            styles.animatedScreen,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {renderContent()}
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedScreen: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
    flex: 1,
  },
  screenContent: {
    width: "100%",
    height: "100%",
    alignItems: "flex-start",
  },
  logo: {
    width: 383,
    height: 215,
  },
  contentImage: {
    width: "100%",
    height: "65%",
  },
  contextTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});
