import React, { useContext, useRef, useEffect, useCallback } from "react";
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
import { useRouter } from "expo-router";
import { AuthContext } from "@context/auth-context";

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
    id: "cart",
    label: "Cart",
    icon: require("@assets/icons/Shop.png"),
    route: "/cart",
  },
  {
    id: "payment-status",
    label: "Payment Status",
    icon: require("@assets/icons/payment.png"),
    route: "/payment/status",
  },
];

// Static styles
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
    backgroundColor: "#FFFFFF",
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
  navigation: {
    flex: 1,
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
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 40,
  },
});

const Sidebar = ({ visible, onClose }) => {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const user = authContext?.user;
  const signout = authContext?.signout;

  useEffect(() => {
    if (visible) {
      translateX.setValue(-SIDEBAR_WIDTH);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    Animated.timing(translateX, {
      toValue: -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [onClose, translateX]);

  const handleNavigation = useCallback((route) => {
    handleClose();
    setTimeout(() => {
      router.push(route);
    }, 350);
  }, [handleClose, router]);

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    setIsLoggingOut(true);

    try {
      // First signout (clear auth data)
      if (signout) await signout();

      // Close sidebar
      handleClose();

      // Navigate to login after a brief delay for animation
      setTimeout(() => {
        router.replace("/");
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  }, [handleClose, signout, router, isLoggingOut]);

  // Get user display name
  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.userName || "User"
    : "Guest";

  // Get profile image
  const profileImage = user?.profilePic
    ? { uri: user.profilePic }
    : require("@assets/icons/profile-icon.png");

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
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
              source={profileImage}
              style={styles.profileImage}
            />
            <Text variant="caption" textTransform="capitalize">
              {displayName}
            </Text>
          </View>
          <View style={styles.navigation}>
            {navigationItems.map((item) => (
              <Pressable
                key={item.id}
                style={styles.navItem}
                onPress={() => handleNavigation(item.route)}
              >
                <View style={styles.navIcon}>
                  <Image source={item.icon} style={{ width: 20, height: 20 }} resizeMode="contain" />
                </View>
                <Text variant="caption">{item.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.logoutItem} onPress={handleLogout}>
            <Text variant="caption" color="error">Logout</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default Sidebar;
