import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import Container from '@components/ui/container';
import { useTheme } from '@hooks/use-theme';
import Feather from '@expo/vector-icons/Feather';
import { useUserQuiz } from '@hooks/api';

const PracticeScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = params.mode || 'practice';
  const title = params.title || 'Quiz Questions';
  const quizId = params.quizId;

  // Parse shared quiz if passed directly (for shared quizzes)
  const sharedQuiz = params.sharedQuiz ? JSON.parse(params.sharedQuiz) : null;

  // Fetch quiz data from API (skip if we have a shared quiz)
  const { data: quizData, isLoading, error } = useUserQuiz(sharedQuiz ? null : quizId);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizComplete, setQuizComplete] = useState(false);

  const timerRef = useRef(null);

  // Get questions from shared quiz or API data
  const actualQuiz = sharedQuiz || quizData?.quiz;
  const questions = actualQuiz?.questions || [];
  const quizDuration = actualQuiz?.duration || 15;

  // Initialize timer when quiz data loads
  useEffect(() => {
    if (mode === 'quiz' && actualQuiz && timeLeft === null) {
      setTimeLeft(quizDuration * 60);
    }
  }, [mode, actualQuiz, quizDuration]);
  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  // Timer for quiz mode
  useEffect(() => {
    if (mode === 'quiz' && timeLeft !== null && timeLeft > 0 && !quizComplete) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setQuizComplete(true); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [mode, timeLeft, quizComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (index) => {
    if (showResult && mode === 'practice') return;
    setSelectedAnswer(index);

    if (mode === 'practice') {
      // In practice mode, show result immediately
      setShowResult(true);
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = index;
      setAnswers(newAnswers);
    }
  };

  const handleNext = () => {
    if (mode === 'quiz') {
      // Save answer for quiz mode
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = selectedAnswer;
      setAnswers(newAnswers);
    }

    if (isLastQuestion) {
      if (mode === 'quiz') {
        handleSubmitQuiz();
      }
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] ?? null);
      setShowResult(mode === 'practice' && answers[currentQuestion - 1] !== undefined);
    }
  };

  const handleSubmitQuiz = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setQuizComplete(true);
  };

  const getOptionStyle = (index) => {
    if (!showResult && mode === 'practice') {
      return selectedAnswer === index
        ? { borderColor: theme.colors.secondary, backgroundColor: theme.colors.secondaryAlpha?.[10] }
        : { borderColor: '#1f382e' };
    }

    if (showResult && mode === 'practice') {
      if (index === question.correctAnswer) {
        // Correct answer - green background with green border
        return {
          borderColor: '#2a996b',
          backgroundColor: 'rgba(42, 153, 107, 0.8)',
        };
      }
      if (index === selectedAnswer && index !== question.correctAnswer) {
        // Wrong answer - red background
        return {
          borderColor: '#f84f4f',
          backgroundColor: '#f84f4f',
        };
      }
    }

    if (mode === 'quiz') {
      return selectedAnswer === index
        ? { borderColor: theme.colors.secondary, backgroundColor: theme.colors.secondaryAlpha?.[10] }
        : { borderColor: '#1f382e' };
    }

    return { borderColor: '#1f382e' };
  };

  const getOptionIcon = (index) => {
    if (!showResult || mode === 'quiz') return null;

    if (index === question.correctAnswer) {
      return <Feather name="check-circle" size={20} color="#FFFFFF" />;
    }
    if (index === selectedAnswer && index !== question.correctAnswer) {
      return <Feather name="x-circle" size={20} color="#FFFFFF" />;
    }
    return null;
  };

  const getOptionTextColor = (index) => {
    if (!showResult || mode === 'quiz') return '#000000';

    if (index === question.correctAnswer) {
      return '#FFFFFF';
    }
    if (index === selectedAnswer && index !== question.correctAnswer) {
      return '#FFFFFF';
    }
    return '#000000';
  };

  // Loading state
  if (isLoading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
          <Text variant="body2" color="gray" style={{ marginTop: 12 }}>
            Loading questions...
          </Text>
        </View>
      </Container>
    );
  }

  // Error state
  if (error || questions.length === 0) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <Feather name="alert-circle" size={48} color={theme.colors.error} />
          <Text variant="body2" color="gray" style={{ marginTop: 12 }}>
            {error ? 'Failed to load quiz' : 'No questions found'}
          </Text>
          <Button variant="secondary" onPress={() => router.back()} style={{ marginTop: 16 }}>
            Go Back
          </Button>
        </View>
      </Container>
    );
  }

  // Quiz Summary Screen
  if (quizComplete) {
    const correctCount = answers.reduce((count, answer, index) => {
      return answer === questions[index]?.correctAnswer ? count + 1 : count;
    }, 0);
    const score = Math.round((correctCount / questions.length) * 100);
    const wrongCount = questions.length - correctCount;

    return (
      <Container>
        <View style={styles.summaryContainer}>
          <Text variant="heading2" style={styles.summaryTitle}>
            {title}
          </Text>

          <View style={[styles.scoreCircle, { borderColor: theme.colors.secondary }]}>
            <Text variant="heading" color="secondary" fontSize={48}>
              {score}%
            </Text>
          </View>

          <Text variant="heading2" fontWeight="600" style={styles.congratsText}>
            Congratulations
          </Text>
          <Text variant="body" color="gray" align="center" style={styles.summarySubtext}>
            You just concluded your quiz practice successfully. Here's the Result Breakdown:
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text variant="body2" color="gray">Correct Answers:</Text>
              <Text variant="body2" fontWeight="600">{correctCount}</Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="body2" color="gray">Wrong Answers:</Text>
              <Text variant="body2" fontWeight="600">{wrongCount}</Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="body2" color="gray">Skipped Questions:</Text>
              <Text variant="body2" fontWeight="600">0</Text>
            </View>
            <View style={styles.statRow}>
              <Text variant="body2" color="gray">Time Used:</Text>
              <Text variant="body2" fontWeight="600">
                {formatTime((quizDuration * 60) - (timeLeft || 0))}
              </Text>
            </View>
          </View>

          <View style={styles.summaryButtons}>
            <Button
              variant="secondary"
              fullWidth
              onPress={() => router.push({
                pathname: '/study/corrections',
                params: { quizId, answers: JSON.stringify(answers) },
              })}>
              View Corrections
            </Button>
            <Button
              variant="outline"
              fullWidth
              onPress={() => {
                setQuizComplete(false);
                setCurrentQuestion(0);
                setAnswers([]);
                setSelectedAnswer(null);
                setTimeLeft(quizDuration * 60);
              }}
            >
              Redo Quiz
            </Button>
          </View>
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
        <Text style={styles.headerTitle}>
          {title}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          {currentQuestion + 1}/{questions.length}
        </Text>
        {mode === 'quiz' && timeLeft !== null && (
          <View style={[
            styles.timerContainer,
            timeLeft <= 60 && styles.timerWarning,
            timeLeft <= 30 && styles.timerDanger,
          ]}>
            <Feather 
              name="clock" 
              size={14} 
              color={timeLeft <= 30 ? '#FFFFFF' : timeLeft <= 60 ? '#DC2626' : '#000000'} 
              style={{ marginRight: 4 }}
            />
            <Text style={[
              styles.timerText,
              timeLeft <= 60 && styles.timerTextWarning,
              timeLeft <= 30 && styles.timerTextDanger,
            ]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="body" style={styles.questionText}>
          {question.question}
        </Text>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <Pressable
              key={index}
              style={[styles.optionButton, getOptionStyle(index)]}
              onPress={() => handleSelectAnswer(index)}
              disabled={showResult && mode === 'practice'}
            >
              <Text style={[styles.optionLabel, { color: getOptionTextColor(index) }]}>
                {String.fromCharCode(97 + index)}) {option}
              </Text>
              {getOptionIcon(index)}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {isLastQuestion ? (
        <View style={styles.submitContainer}>
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
          </View>
          <Pressable style={styles.submitButton} onPress={handleSubmitQuiz}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </Pressable>
        </View>
      ) : (
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

          <Pressable style={styles.navLink} onPress={handleNext}>
            <Text variant="body2">Next</Text>
            <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
      )}
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
  headerTitle: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressText: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  timerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  timerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#000000',
  },
  timerWarning: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  timerDanger: {
    backgroundColor: '#DC2626',
  },
  timerTextWarning: {
    color: '#DC2626',
    fontWeight: '600',
  },
  timerTextDanger: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f382e',
    backgroundColor: '#FFFFFF',
  },
  optionLabel: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000000',
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
    height: 40,
    paddingHorizontal: 8,
    gap: 8,
  },
  submitContainer: {
    paddingVertical: 16,
  },
  submitButton: {
    backgroundColor: '#2a996b',
    paddingVertical: 12,
    paddingHorizontal: 117,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  summaryContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  summaryTitle: {
    marginBottom: 32,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  congratsText: {
    marginBottom: 8,
  },
  summarySubtext: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  statsContainer: {
    width: '100%',
    gap: 8,
    marginBottom: 32,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryButtons: {
    width: '100%',
    gap: 12,
  },
});

export default PracticeScreen;
