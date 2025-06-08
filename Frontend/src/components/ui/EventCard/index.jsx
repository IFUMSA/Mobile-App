import React from "react";
import { View, StyleSheet, Image, Platform } from "react-native";
import { useTheme } from "@hooks/use-theme";
import { Text } from "@components/ui/Text";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";

const EventCard = ({
  title = "Chess Competition",
  location = "Event Location",
  time = "10:30am",
  date = "23/02/25",
  image = require("@assets/Images/eventcard-image.png"),
  style,
  ...rest
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]} {...rest}>
      <>
        {image ? (
          <Image source={image} style={styles.image} resizeMode="cover" />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: theme.colors.grayLightAlpha[20] },
            ]}
          >
            <Text variant="caption" color="textSecondary">
              Image
            </Text>
          </View>
        )}
      </>
      <View style={styles.contentContainer}>
        <View style={styles.contentRow}>
          <View>
            <Text
              variant="body"
              color="secondary"
              numberOfLines={2}
            >
              {title}
            </Text>
            <View style={[styles.locationContainer, { marginTop: 4 }]}>
              <Ionicons
                name="location-outline"
                size={20}
                color={theme.colors.grayAlpha[50]}
              />
              <Text
                variant="caption"
                color="textSecondary"
              >
                {location}
              </Text>
            </View>
          </View>
          <View>
            <View style={styles.dateTimeContainer}>
              <MaterialCommunityIcons
                name="clock-time-five-outline"
                size={20}
                color={theme.colors.grayAlpha[50]}
              />
              <Text>{time}</Text>
            </View>
            <View style={[styles.dateTimeContainer, { marginTop: 4 }]}>
              <MaterialCommunityIcons
                name="calendar-outline"
                size={20}
                color={theme.colors.grayAlpha[50]}
              />
              <Text>{date}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: "100%",
    aspectRatio: 1.943,
  },
  contentContainer: {
    marginTop: 8,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  image: {
    borderRadius: 16,
    marginTop: 4,
    minHeight: 176,
    width: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeContainer: {
    gap: 2,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default EventCard;
