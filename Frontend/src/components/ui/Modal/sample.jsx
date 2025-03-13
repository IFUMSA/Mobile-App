import React, { useState } from "react";
import { View, StyleSheet, Button } from "react-native";
import { Modal } from "./index";
import { Text } from "../Text";

export const ModalExample = () => {
  const [bottomModalVisible, setBottomModalVisible] = useState(false);
  const [centerModalVisible, setCenterModalVisible] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      gap: 16,
    },
    customContent: {
      padding: 24,
    },
    customHeader: {
      marginBottom: 24,
    },
  });

  return (
    <View style={styles.container}>
      <Button
        title="Show Bottom Modal"
        onPress={() => setBottomModalVisible(true)}
      />
      <Modal
        visible={bottomModalVisible}
        onClose={() => setBottomModalVisible(false)}
        title="Bottom Modal"
        position="bottom"
      >
        <Text>This is a bottom modal with default styling.</Text>
      </Modal>
      <Button
        title="Show Center Modal"
        onPress={() => setCenterModalVisible(true)}
      />
      <Modal
        visible={centerModalVisible}
        onClose={() => setCenterModalVisible(false)}
        title="Center Modal"
        position="center"
        animationType="slide"
      >
        <Text>This is a center modal with slide animation.</Text>
      </Modal>
      <Button
        title="Show Custom Modal"
        onPress={() => setCustomModalVisible(true)}
      />
      <Modal
        visible={customModalVisible}
        onClose={() => setCustomModalVisible(false)}
        title="Custom Modal"
        position="bottom"
        contentStyle={styles.customContent}
        headerStyle={styles.customHeader}
      >
        <Text>This is a modal with custom styling.</Text>
      </Modal>
    </View>
  );
}; 