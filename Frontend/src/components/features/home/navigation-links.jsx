import { View, StyleSheet, Pressable, Image, Platform } from "react-native";
import { Text } from "@components/ui/Text";
import { useTheme } from "@hooks/use-theme";
import { useRouter } from "expo-router";


const links = [
  {
    label: "Study",
    icon: require("@assets/icons/Exam.png"),
    href: "/study",
  },
  {
    label: "Marketplace",
    icon: require("@assets/icons/Shop.png"),
    href: "/marketplace",
  },
  {
    label: "Events",
    icon: require("@assets/icons/upcoming-events.png"),
    href: "/events",
  },
];

const NavigationLinks = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      marginTop: 36,
      gap: 4,
    },
    linksContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 24,
    },
    icon: {
      width: 54,
      height: 54,
    },
    linkContainer: {
      borderRadius: 12,
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 16,
      justifyContent: "space-between",
      gap: 6,
      alignItems: "center",
      backgroundColor: theme.colors.white,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 1,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    linkIconOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.secondaryAlpha[2],
      borderRadius: 12,
    },
    linkText: {
      whiteSpace: "nowrap",
    },
  });

  return (
    <View style={styles.container}>
      <Text variant="heading2" fontWeight="600" fontSize={20}>
        Features
      </Text>
      <View style={styles.linksContainer}>
        {links.map((link) => (
          <Pressable key={link.label} style={[styles.linkContainer]} onPress={() => router.push(link.href)}>
            <Text variant="caption" align="center" style={styles.linkText}>
              {link.label}
            </Text>
            <Image source={link.icon} style={styles.icon} />
            <View style={styles.linkIconOverlay}>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default NavigationLinks;
