import React from "react";
import {
  Modal as RNModal,
  View,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "@hooks/use-theme";
import { Text } from "../Text";
import { Ionicons } from "@expo/vector-icons";

export const Modal = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  position = "bottom",
  animationType = "fade",
  containerStyle,
  contentStyle,
  headerStyle,
  overlayStyle,
  pressableStyle,
  titleStyle,
  closeButtonStyle,
  closeIconStyle,
}) => {
  const { theme } = useTheme();
  const { height } = useWindowDimensions();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: position === "center" ? "center" : "flex-end",
    },
    pressable: {
      flex: 1,
    },
    content: {
      backgroundColor: theme.colors.white,
      maxHeight: position === "center" ? height * 0.8 : "80%",
      ...(position === "bottom"
        ? {
            borderTopLeftRadius: 46,
            borderTopRightRadius: 46,
          }
        : {
            margin: 16,
            borderRadius: 24,
          }),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 24,
    },
    title: {
      flex: 1,
    },
    closeButton: {
      padding: 4,
    },
  });

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, overlayStyle, containerStyle]}>
        <Pressable style={[styles.pressable, pressableStyle]} onPress={onClose} />
        <View style={[styles.content, contentStyle]}>
          {(title || showCloseButton) && (
            <View style={[styles.header, headerStyle]}>
              {title && (
                <Text variant="heading3" style={[styles.title, titleStyle]}>
                  {title}
                </Text>
              )}
              {showCloseButton && (
                <Pressable 
                  onPress={onClose}
                  style={[styles.closeButton, closeButtonStyle]}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme.colors.textSecondary}
                    style={closeIconStyle}
                  />
                </Pressable>
              )}
            </View>
          )}
          {children}
        </View>
      </View>
    </RNModal>
  );
};
