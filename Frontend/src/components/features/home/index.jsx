import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useTheme } from "@hooks/use-theme";
import AnnouncementCarousel from "./announcement-carousel";
import { StatusBar } from "expo-status-bar";
import Feather from "@expo/vector-icons/Feather";
import EventCard from "@components/ui/EventCard";
import Container from "@components/ui/container";
import { Text } from "@components/ui/Text";
import NavigationLinks from "./navigation-links";

const Home = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container]}>
      <StatusBar style="light" />
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <View style={styles.menuIcon}>
          <Feather name="menu" size={24} color="white" />
        </View>
      </View>
      <Container>
        <AnnouncementCarousel />
        <Text variant="heading2" fontWeight="600" style={{ marginTop: 36 }}>
          Next Event
        </Text>
        <EventCard />
        <NavigationLinks />
      </Container>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
    minHeight: 197,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },
  menuIcon: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    flex: 1,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    overflow: "hidden",
    ...(Platform.OS === "android" && {
      elevation: 4,
    }),
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  cardTitle: {
    fontSize: 28,
    lineHeight: 36,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    marginBottom: 40,
  },

});

export default Home;
