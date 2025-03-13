import React from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";
import { Modal } from "../Modal";
import { Text } from "../Text";
import { useTheme } from "@hooks/use-theme";

export const SelectModal = ({
  isOpen,
  onClose,
  title,
  options = [],
  value,
  onSelect,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    content: {
      paddingBottom: 20,
      paddingTop: 10,
    },
    optionItem: {
      paddingVertical: 6,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    selectedItem: {
      backgroundColor: theme.colors.primaryAlpha[10],
    },
  });

  return (
    <Modal
      visible={isOpen}
      onClose={onClose}
      title={title}
      position="bottom"
      contentStyle={styles.content}
    >
      <FlatList
        data={options}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.optionItem,
              item.value === value && styles.selectedItem,
            ]}
            onPress={() => {
              onSelect?.(item);
              onClose();
            }}
          >
            <Text
              variant="body1"
              color={item.value === value ? "primary" : "textSecondary"}
            >
              {item.label}
            </Text>
          </Pressable>
        )}
      />
    </Modal>
  );
};
