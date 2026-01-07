import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import Container from '@components/ui/container';
import { useTheme } from '@hooks/use-theme';
import Feather from '@expo/vector-icons/Feather';

const StudyScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const menuItems = [
    {
      id: 'generate',
      title: 'Generate Questions',
      subtitle: 'Upload your materials and generate questions in preparation for your exams',
      icon: 'edit-3',
      href: '/study/generate',
    },
    {
      id: 'my-questions',
      title: 'My Questions',
      subtitle: 'Have access to your previously generated questions here',
      icon: 'file-text',
      href: '/study/my-questions',
    },
  ];

  return (
    <Container>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="white" />
        </Pressable>
        <Text variant="heading2" color="white" fontWeight="600">
          Study
        </Text>
      </View>

      <View style={styles.content}>
        {menuItems.map((item) => (
          <Pressable
            key={item.id}
            style={styles.menuItem}
            onPress={() => router.push(item.href)}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondaryAlpha?.[10] || 'rgba(42, 153, 107, 0.1)' }]}>
              <Feather name={item.icon} size={24} color={theme.colors.secondary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text variant="body" fontWeight="600">
                {item.title}
              </Text>
              <Text variant="caption" color="gray" style={styles.subtitle}>
                {item.subtitle}
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color={theme.colors.gray} />
          </Pressable>
        ))}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 16,
    marginHorizontal: -24,
    marginTop: -20,
    height: 140,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.02)',
    backgroundColor: 'rgba(42, 153, 107, 0.02)',
  },
  iconContainer: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  subtitle: {
    marginTop: 4,
  },
});

export default StudyScreen;
