import React, { useState } from "react";
import { View, StyleSheet, Pressable, FlatList } from "react-native";
import { useTheme } from "@hooks/use-theme";
import { Text } from "@components/ui/Text";
import Feather from "@expo/vector-icons/Feather";
import Container from "@components/ui/container";

const StatusSelect = ({
  value,
  onValueChange,
  options = [],
  placeholder = "Select status",
  style,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (option) => {
    onValueChange?.(option.value);
    setIsOpen(false);
  };

  const styles = StyleSheet.create({
    container: {
      position: "relative",
    },
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.white,
      paddingVertical: 12,
      minHeight: 44,
      justifyContent: "flex-start",
      width: "fit-content",
    },
    triggerText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    dropdown: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      backgroundColor: theme.colors.white,
      borderRadius: 8,
      marginTop: 4,
      zIndex: 1000,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.grayLightAlpha[50],
    },
    lastOption: {
      borderBottomWidth: 0,
    },
    optionText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    selectedOption: {
      backgroundColor: theme.colors.primaryAlpha[50],
    },
    checkIcon: {
      marginLeft: 8,
    },
  });

  return (
    <View style={[styles.container, style]}>
        <Pressable style={styles.trigger} onPress={() => setIsOpen(!isOpen)}>
          <Text style={styles.triggerText}>
            {selectedOption?.label || placeholder}
          </Text>
          <Feather
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.colors.textSecondary}
          />
        </Pressable>

      {isOpen && (
        <View style={styles.dropdown}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item, index }) => (
              <Pressable
                style={[
                  styles.option,
                  index === options.length - 1 && styles.lastOption,
                  item.value === value && styles.selectedOption,
                ]}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.optionText}>{item.label}</Text>
                {item.value === value && (
                  <Feather
                    name="check"
                    size={16}
                    color={theme.colors.primary}
                    style={styles.checkIcon}
                  />
                )}
              </Pressable>
            )}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

export default StatusSelect;
