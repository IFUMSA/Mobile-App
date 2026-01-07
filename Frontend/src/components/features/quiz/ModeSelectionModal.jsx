import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Modal } from 'react-native';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import { useTheme } from '@hooks/use-theme';
import Feather from '@expo/vector-icons/Feather';

const ModeSelectionModal = ({ visible, onClose, onSelectMode }) => {
  const { theme } = useTheme();
  const [selectedMode, setSelectedMode] = useState(null);

  const modes = [
    {
      id: 'practice',
      title: 'Practice Mode',
      icon: 'book-open',
      description: 'Learn at your own pace without time limits',
    },
    {
      id: 'quiz',
      title: 'Quiz Mode',
      icon: 'help-circle',
      description: 'Test your knowledge with timed questions',
    },
  ];

  const handleContinue = () => {
    if (selectedMode) {
      onSelectMode(selectedMode);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.white }]}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.backButton}>
              <Feather name="chevron-left" size={24} color={theme.colors.textSecondary} />
            </Pressable>
            <Text variant="body" fontWeight="600" fontSize={18}>
              Choose Your Mode of Practice
            </Text>
          </View>

          <View style={styles.modesContainer}>
            {modes.map((mode) => (
              <Pressable
                key={mode.id}
                style={[
                  styles.modeOption,
                  { borderColor: theme.colors.grayLight },
                  selectedMode === mode.id && {
                    borderColor: theme.colors.secondary,
                    backgroundColor: theme.colors.secondaryAlpha?.[10] || 'rgba(42, 153, 107, 0.1)',
                  },
                ]}
                onPress={() => setSelectedMode(mode.id)}
              >
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: theme.colors.gray },
                    selectedMode === mode.id && { borderColor: theme.colors.secondary },
                  ]}
                >
                  {selectedMode === mode.id && (
                    <View style={[styles.radioInner, { backgroundColor: theme.colors.secondary }]} />
                  )}
                </View>
                <View style={styles.modeIcon}>
                  <Feather name={mode.icon} size={24} color={theme.colors.textSecondary} />
                </View>
                <Text variant="body" fontWeight="500">
                  {mode.title}
                </Text>
              </Pressable>
            ))}
          </View>

          <Button
            variant="secondary"
            fullWidth
            onPress={handleContinue}
            disabled={!selectedMode}
          >
            Continue
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  modesContainer: {
    gap: 16,
    marginBottom: 32,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  modeIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
});

export default ModeSelectionModal;
