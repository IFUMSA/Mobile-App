import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import Container from '@components/ui/container';
import { useTheme } from '@hooks/use-theme';
import Feather from '@expo/vector-icons/Feather';
import { useUserQuiz } from '@hooks/api';

const CorrectionsScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const quizId = params.quizId;

  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Parse user answers from params
  const userAnswers = (() => {
    try {
      return JSON.parse(params.answers || '[]');
    } catch {
      return [];
    }
  })();

  // Fetch real quiz data
  const { data: quizData, isLoading } = useUserQuiz(quizId);

  const quizTitle = quizData?.quiz?.title || 'Quiz Corrections';
  const questions = quizData?.quiz?.questions || [];
  const question = questions[currentQuestion];
  const userAnswer = userAnswers[currentQuestion];
  const isCorrect = question && userAnswer === question.correctAnswer;

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getOptionStyle = (index) => {
    if (!question) return {};
    if (index === question.correctAnswer) {
      return {
        borderColor: theme.colors.success || '#2a996b',
        backgroundColor: 'rgba(42, 153, 107, 0.1)',
      };
    }
    if (index === userAnswer && index !== question.correctAnswer) {
      return {
        borderColor: theme.colors.error || '#f84f4f',
        backgroundColor: 'rgba(248, 79, 79, 0.1)',
      };
    }
    return { borderColor: theme.colors.grayLight };
  };

  const getOptionIcon = (index) => {
    if (!question) return null;
    if (index === question.correctAnswer) {
      return <Feather name="check-circle" size={20} color={theme.colors.success || '#2a996b'} />;
    }
    if (index === userAnswer && index !== question.correctAnswer) {
      return <Feather name="x-circle" size={20} color={theme.colors.error || '#f84f4f'} />;
    }
    return null;
  };

  if (isLoading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
          <Text variant="body2" color="gray" style={{ marginTop: 12 }}>
            Loading corrections...
          </Text>
        </View>
      </Container>
    );
  }

  if (!question) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <Feather name="alert-circle" size={48} color={theme.colors.gray} />
          <Text variant="body2" color="gray" style={{ marginTop: 12 }}>
            No questions found
          </Text>
          <Pressable style={styles.backLink} onPress={() => router.back()}>
            <Text variant="body2" color="secondary">Go Back</Text>
          </Pressable>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color={theme.colors.textSecondary} />
        </Pressable>
        <Text variant="body" fontWeight="600" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
          {quizTitle}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.progressRow}>
        <Text variant="body" fontWeight="600" color="secondary">
          {currentQuestion + 1}/{questions.length}
        </Text>
        <View style={styles.statusBadge}>
          <Text
            variant="caption"
            color={isCorrect ? 'success' : 'error'}
            fontWeight="600"
          >
            {isCorrect ? 'Correct' : 'Incorrect'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="body" style={styles.questionText}>
          {question.question}
        </Text>

        <View style={styles.optionsContainer}>
          {question.options?.map((option, index) => (
            <View
              key={index}
              style={[styles.optionButton, getOptionStyle(index)]}
            >
              <Text variant="body2" style={styles.optionLabel}>
                {String.fromCharCode(97 + index)}) {option}
              </Text>
              {getOptionIcon(index)}
            </View>
          ))}
        </View>

        {question.explanation && (
          <View style={[styles.explanationBox, { backgroundColor: theme.colors.secondaryAlpha?.[10] || 'rgba(42, 153, 107, 0.1)' }]}>
            <Text variant="body2" fontWeight="600" color="secondary">
              Explanation:
            </Text>
            <Text variant="body2" style={styles.explanationText}>
              {question.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.navigationContainer}>
        <Pressable
          style={styles.navLink}
          onPress={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <Feather
            name="chevron-left"
            size={20}
            color={currentQuestion === 0 ? theme.colors.gray : theme.colors.textSecondary}
          />
          <Text
            variant="body2"
            color={currentQuestion === 0 ? 'gray' : 'textSecondary'}
          >
            Previous
          </Text>
        </Pressable>

        <Pressable
          style={styles.navLink}
          onPress={handleNext}
          disabled={currentQuestion === questions.length - 1}
        >
          <Text
            variant="body2"
            color={currentQuestion === questions.length - 1 ? 'gray' : 'textSecondary'}
          >
            Next
          </Text>
          <Feather
            name="chevron-right"
            size={20}
            color={currentQuestion === questions.length - 1 ? theme.colors.gray : theme.colors.textSecondary}
          />
        </Pressable>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backLink: {
    marginTop: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  optionLabel: {
    flex: 1,
  },
  explanationBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  explanationText: {
    marginTop: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default CorrectionsScreen;
