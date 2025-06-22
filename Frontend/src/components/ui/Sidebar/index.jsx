import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Text } from "@components/ui/Text";
import { useTheme } from "@hooks/use-theme";
import { useRouter } from "expo-router";
// import Feather from "@expo/vector-icons/Feather";
// import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width: screenWidth } = Dimensions.get("window");
const SIDEBAR_WIDTH = screenWidth * 0.5;

const navigationItems = [
  {
    id: "profile",
    label: "Profile",
    icon: require("@assets/icons/profile.png"),
    route: "/profile",
  },
  {
    id: "payment-status",
    label: "Payment Status",
    icon: require("@assets/icons/payment.png"),
    route: "/payment/status",
  },
];

const Sidebar = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const translateX = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  React.useEffect(() => {
    if (visible) {
      translateX.setValue(-SIDEBAR_WIDTH);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateX]);

  const handleClose = () => {
    Animated.timing(translateX, {
      toValue: -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleNavigation = (route) => {
    handleClose();
    router.push(route);
  };

  //   const renderIcon = (iconType, iconName, color) => {
  //     const iconProps = {
  //       name: iconName,
  //       size: 20,
  //       color,
  //     };

  //     switch (iconType) {
  //       case 'Feather':
  //         return <Feather {...iconProps} />;
  //       case 'MaterialIcons':
  //         return <MaterialIcons {...iconProps} />;
  //       default:
  //         return <Feather {...iconProps} />;
  //     }
  //   };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },
    sidebar: {
      width: SIDEBAR_WIDTH,
      height: "100%",
      backgroundColor: theme.colors.white,
      paddingTop: 53,
      paddingHorizontal: 16,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        },
        android: {
          elevation: 16,
        },
      }),
    },
    profileSection: {
      alignItems: "center",
      marginBottom: 37,
    },
    profileImage: {
      width: 64,
      height: 64,
      borderRadius: 40,
      marginBottom: 4,
    },
    navItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },

    navIcon: {
      marginRight: 12,
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={styles.profileSection}>
            <Image
              source={require("@assets/icons/profile-icon.png")}
              style={styles.profileImage}
            />
            <Text variant="caption" textTransform="capitalize">
              ajayi ojo olatunde
            </Text>
          </View>
          <View style={styles.navigation}>
            {navigationItems.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.navItem]}
                onPress={() => handleNavigation(item.route)}
              >
                <View style={styles.navIcon}>
                  <Image source={item.icon} resizeMode="contain" />
                </View>
                <Text variant="caption">{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default Sidebar;
