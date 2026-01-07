import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import Container from '@components/ui/container';
import PageHeader from '@components/ui/PageHeader';
import { useTheme } from '@hooks/use-theme';
import { useQuiz, useSubmitQuizMutation } from '@api';
import Feather from '@expo/vector-icons/Feather';

const QuizScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [startTime] = useState(Date.now());

  const { data: quizData, isLoading } = useQuiz(id);
  const { mutate: submitQuiz, isPending: isSubmitting } = useSubmitQuizMutation({
    onSuccess: (data) => {
      setResults(data.result);
      setShowResults(true);
    },
  });

  const quiz = quizData?.quiz;
  const questions = quiz?.questions || [];
  const question = questions[currentQuestion];

  useEffect(() => {
    if (questions.length > 0 && answers.length === 0) {
      setAnswers(new Array(questions.length).fill(-1));
    }
  }, [questions.length, answers.length]);

  const handleSelectAnswer = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

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

  const handleSubmit = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    submitQuiz({
      quizId: id,
      answers,
      timeSpent,
    });
  };

  const handleFinish = () => {
    router.replace('/quiz');
  };

  if (isLoading) {
    return (
      <Container>
        <PageHeader title="Quiz" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
        </View>
      </Container>
    );
  }

  if (showResults && results) {
    return (
      <Container>
        <View style={styles.resultsContainer}>
          <View style={styles.resultsContent}>
            <View style={[styles.scoreCircle, { borderColor: theme.colors.secondary }]}>
              <Text variant="heading" color="secondary" fontSize={48}>
                {results.score}%
              </Text>
            </View>
            <Text variant="heading2" style={styles.resultsTitle}>
              Quiz Complete!
            </Text>
            <Text variant="body" color="gray" style={styles.resultsSubtitle}>
              You got {results.correctCount} out of {results.totalQuestions} questions correct
            </Text>
          </View>
          <Button variant="secondary" fullWidth onPress={handleFinish}>
            Back to Quizzes
          </Button>
        </View>
      </Container>
    );
  }

  if (!question) {
    return (
      <Container>
        <PageHeader title="Quiz" />
        <View style={styles.emptyContainer}>
          <Text variant="body" color="gray">Quiz not found</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader title={quiz?.title || 'Quiz'} />
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                backgroundColor: theme.colors.secondary,
              },
            ]}
          />
        </View>
        <Text variant="caption" color="gray">
          Question {currentQuestion + 1} of {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="body" fontWeight="600" style={styles.questionText}>
          {question.question}
        </Text>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <Pressable
              key={index}
              style={[
                styles.optionButton,
                { borderColor: theme.colors.grayLight },
                answers[currentQuestion] === index && {
                  borderColor: theme.colors.secondary,
                  backgroundColor: theme.colors.secondaryAlpha[10],
                },
              ]}
              onPress={() => handleSelectAnswer(index)}
            >
              <View
                style={[
                  styles.optionRadio,
                  { borderColor: theme.colors.gray },
                  answers[currentQuestion] === index && {
                    borderColor: theme.colors.secondary,
                    backgroundColor: theme.colors.secondary,
                  },
                ]}
              >
                {answers[currentQuestion] === index && (
                  <Feather name="check" size={14} color="white" />
                )}
              </View>
              <Text variant="body" style={styles.optionText}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.navigationContainer}>
        <Button
          variant="outline"
          onPress={handlePrevious}
          disabled={currentQuestion === 0}
          style={styles.navButton}
        >
          Previous
        </Button>

        {currentQuestion === questions.length - 1 ? (
          <Button
            variant="secondary"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={answers.includes(-1)}
            style={styles.navButton}
          >
            Submit
          </Button>
        ) : (
          <Button
            variant="secondary"
            onPress={handleNext}
            style={styles.navButton}
          >
            Next
          </Button>
        )}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
  },
  navButton: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 40,
  },
  resultsContent: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  resultsTitle: {
    marginBottom: 8,
  },
  resultsSubtitle: {
    textAlign: 'center',
  },
});

export default QuizScreen;
