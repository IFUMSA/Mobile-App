import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@components/ui/Text";
import { Image } from "react-native";

export const OnboardingScreen = ({ data }) => {

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="subheading" color="textSecondary" style={styles.title}>
          {data.title}
        </Text>
        <View style={styles.illustrationContainer}>
          <Image
            source={data.illustration}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 24,
  },
  header: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  skipButton: {
    paddingHorizontal: 0,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    paddingHorizontal: 30,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
});
