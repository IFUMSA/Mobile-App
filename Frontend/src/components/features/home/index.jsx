import React, { useState, useMemo } from "react";
import { View, StyleSheet, Platform, Pressable } from "react-native";
import { useTheme } from "@hooks/use-theme";
import AnnouncementCarousel from "./announcement-carousel";
import { StatusBar } from "expo-status-bar";
import Feather from "@expo/vector-icons/Feather";
import EventCard from "@components/ui/EventCard";
import Container from "@components/ui/container";
import { Text } from "@components/ui/Text";
import NavigationLinks from "./navigation-links";
import Sidebar from "@components/ui/Sidebar";
import { useNextEvent } from "@hooks/api/use-content";

const Home = () => {
  const { theme } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // Fetch next event from API
  const { data: eventData, isLoading: eventLoading } = useNextEvent();

  const openSidebar = () => {
    setSidebarVisible(true);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  // Format event data for EventCard
  const nextEvent = useMemo(() => {
    if (!eventData?.event) return null;
    const event = eventData.event;
    const startDate = new Date(event.startDate);
    return {
      title: event.title,
      location: event.location || "TBA",
      time: startDate.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      date: startDate.toLocaleDateString('en-NG', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      image: event.image ? { uri: event.image } : undefined,
    };
  }, [eventData]);

  return (
    <View style={[styles.container]}>
      <StatusBar style="light" />
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <Pressable style={styles.menuIcon} onPress={openSidebar}>
          <Feather name="menu" size={24} color="white" />
        </Pressable>
      </View>
      <Container>
        <AnnouncementCarousel />
        <Text variant="heading2" fontWeight="600" style={{ marginTop: 36 }}>
          Next Event
        </Text>
        {nextEvent ? (
          <EventCard
            title={nextEvent.title}
            location={nextEvent.location}
            time={nextEvent.time}
            date={nextEvent.date}
            image={nextEvent.image}
          />
        ) : (
          <EventCard />
        )}
        <NavigationLinks />
      </Container>
      <Sidebar 
        visible={sidebarVisible} 
        onClose={closeSidebar} 
      />
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
