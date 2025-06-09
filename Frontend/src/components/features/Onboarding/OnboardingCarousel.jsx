import React, { useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@hooks/use-theme";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { OnboardingScreen } from "./OnboardingScreen";
import { IconButton } from "@components/ui/button";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width: screenWidth } = Dimensions.get("window");

const onboardingData = [
  {
    id: 1,
    title: "Prepare for exams with interactive self-assessment quizzes!",
    illustration: require("@assets/Images/onboarding-image1.png"),
  },
  {
    id: 2,
    title: "Get ready for what's next:\nDiscover upcoming events now!",
    illustration: require("@assets/Images/onboarding-image2.png"),
  },
];

export const OnboardingCarousel = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const ref = useRef(null);
  const progress = useSharedValue(0);

  const handleNext = () => {
    const currentIndex = Math.round(progress.value);
    if (currentIndex < onboardingData.length - 1) {
      ref.current?.scrollTo({
        count: 1,
        animated: true,
      });
    } else {
      router.push("/(auth)");
    }
  };
  const onPressPagination = (index) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const renderItem = ({ item }) => {
    return <OnboardingScreen data={item} />;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.whiteAlpha[90] }]}
    >
      <View style={styles.content}>
        <Carousel
          ref={ref}
          data={onboardingData}
          renderItem={renderItem}
          width={screenWidth}
          height="100%"
          onProgressChange={progress}
          scrollAnimationDuration={800}
        />
        <View style={styles.paginationSection}>
          <Pagination.Basic
            progress={progress}
            data={onboardingData}
            dotStyle={{
              backgroundColor: theme.colors.grayLight,
              borderRadius: 50,
            }}
            activeDotStyle={{
              backgroundColor: theme.colors.primary,
            }}
            containerStyle={{
              gap: 8,
            }}
            onPress={onPressPagination}
            size={8}
          />
        </View>
        <View style={styles.bottom}>
          <IconButton
            variant="text"
            iconPosition="right"
            icon={<MaterialIcons name="arrow-forward-ios" size={12} color="" />}
            size="large"
            onPress={handleNext}
            textStyle={{
              fontSize: 20,
            }}
          >
            Next
          </IconButton>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
  },
  content: {
    height: "80%",
  },
  paginationSection: {
    marginTop: 20,
  },
  bottom: {
    justifyContent: "flex-end",
    flexDirection: "row",
    marginTop: 25,
  },
});
