import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import Container from '@components/ui/container';
import PageHeader from '@components/ui/PageHeader';
import { useTheme } from '@hooks/use-theme';
import { useQuizzes, useQuizCategories } from '@api';
import Feather from '@expo/vector-icons/Feather';

const QuizListScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuizCategories();
  const { data: quizzesData, isLoading: quizzesLoading } = useQuizzes(selectedCategory);

  const categories = categoriesData?.categories || [];
  const quizzes = quizzesData?.quizzes || [];

  const handleQuizPress = (quizId) => {
    router.push(`/quiz/${quizId}`);
  };

  const renderCategoryItem = ({ item }) => (
    <Pressable
      style={[
        styles.categoryChip,
        selectedCategory === item && { backgroundColor: theme.colors.secondary },
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}
    >
      <Text
        variant="body2"
        color={selectedCategory === item ? 'white' : 'textSecondary'}
      >
        {item}
      </Text>
    </Pressable>
  );

  const renderQuizItem = ({ item }) => (
    <Pressable
      style={[styles.quizCard, { borderColor: theme.colors.grayLight }]}
      onPress={() => handleQuizPress(item.id)}
    >
      <View style={styles.quizInfo}>
        <Text variant="body" fontWeight="600" style={styles.quizTitle}>
          {item.title}
        </Text>
        {item.description && (
          <Text variant="body2" color="gray" numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.quizMeta}>
          <View style={styles.metaItem}>
            <Feather name="help-circle" size={14} color={theme.colors.gray} />
            <Text variant="caption" color="gray" style={styles.metaText}>
              {item.questionCount} questions
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="clock" size={14} color={theme.colors.gray} />
            <Text variant="caption" color="gray" style={styles.metaText}>
              {item.duration} mins
            </Text>
          </View>
        </View>
      </View>
      <Feather name="chevron-right" size={24} color={theme.colors.gray} />
    </Pressable>
  );

  if (categoriesLoading || quizzesLoading) {
    return (
      <Container>
        <PageHeader title="Quiz Mode" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader title="Quiz Mode" />
      
      <View style={styles.content}>
        {categories.length > 0 && (
          <View style={styles.categoriesContainer}>
            <Text variant="body" fontWeight="600" style={styles.sectionTitle}>
              Categories
            </Text>
            <FlatList
              horizontal
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>
        )}

        <Text variant="body" fontWeight="600" style={styles.sectionTitle}>
          Available Quizzes
        </Text>

        {quizzes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color={theme.colors.gray} />
            <Text variant="body" color="gray" style={styles.emptyText}>
              No quizzes available
            </Text>
          </View>
        ) : (
          <FlatList
            data={quizzes}
            renderItem={renderQuizItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.quizList}
          />
        )}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  categoriesList: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  quizList: {
    gap: 12,
    paddingBottom: 20,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    marginBottom: 4,
  },
  quizMeta: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
  },
});

export default QuizListScreen;
