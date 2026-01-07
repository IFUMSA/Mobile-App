import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import Container from '@components/ui/container';
import { useTheme } from '@hooks/use-theme';
import Feather from '@expo/vector-icons/Feather';
import { useSaveQuizMutation } from '@hooks/api';

const PreviewQuestionsScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [questions, setQuestions] = useState(() => {
    try {
      return JSON.parse(params.questions || '[]');
    } catch {
      return [];
    }
  });
  const [quizName, setQuizName] = useState(params.topic || 'Untitled Quiz');
  const [isSaving, setIsSaving] = useState(false);

  const saveQuizMutation = useSaveQuizMutation({
    onSuccess: () => {
      setIsSaving(false);
      router.replace('/study/my-questions');
    },
    onError: (error) => {
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save quiz. Please try again.');
      console.error('Error saving quiz:', error);
    },
  });

  const handleSave = async () => {
    if (questions.length === 0) {
      Alert.alert('Error', 'No questions to save');
      return;
    }

    setIsSaving(true);
    saveQuizMutation.mutate({
      title: quizName,
      questions,
      questionType: params.questionType || 'mcq',
      duration: parseInt(params.duration, 10) || 30,
    });
  };

  const handleEditQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleEditOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSetCorrectAnswer = (questionIndex, optionIndex) => {
    const updated = [...questions];
    updated[questionIndex].correctAnswer = optionIndex;
    setQuestions(updated);
  };

  return (
    <Container>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color={theme.colors.textSecondary} />
        </Pressable>
        <Text variant="body" fontWeight="600">
          Preview & Edit
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text variant="caption" color="gray">Quiz Title</Text>
          <TextInput
            style={[styles.titleInput, { borderColor: theme.colors.grayLight }]}
            value={quizName}
            onChangeText={setQuizName}
            placeholder="Enter quiz title"
          />
        </View>

        {questions.map((question, qIndex) => (
          <View key={qIndex} style={[styles.questionCard, { borderColor: theme.colors.grayLight }]}>
            <View style={styles.questionHeader}>
              <Text variant="body2" fontWeight="600" color="secondary">
                Question {qIndex + 1}
              </Text>
            </View>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.grayLight }]}
              value={question.question}
              onChangeText={(value) => handleEditQuestion(qIndex, 'question', value)}
              multiline
              placeholder="Enter question"
            />
            <Text variant="caption" color="gray" style={styles.optionsLabel}>
              Options (tap circle to set correct):
            </Text>
            {question.options?.map((option, oIndex) => (
              <View key={oIndex} style={styles.optionRow}>
                <Pressable
                  onPress={() => handleSetCorrectAnswer(qIndex, oIndex)}
                  style={styles.radioButton}
                  hitSlop={8}
                >
                  {question.correctAnswer === oIndex ? (
                    <Feather name="check-circle" size={20} color={theme.colors.success} />
                  ) : (
                    <Feather name="circle" size={20} color={theme.colors.gray} />
                  )}
                </Pressable>
                <Text variant="caption" color="gray" style={styles.optionLetter}>
                  {String.fromCharCode(97 + oIndex)})
                </Text>
                <TextInput
                  style={[styles.optionInput, { borderColor: theme.colors.grayLight }]}
                  value={option}
                  onChangeText={(value) => handleEditOption(qIndex, oIndex, value)}
                  placeholder={`Option ${oIndex + 1}`}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="secondary" fullWidth onPress={handleSave} loading={isSaving} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Done'}
        </Button>
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
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  titleSection: {
    marginBottom: 16,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 4,
  },
  questionCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
  },
  optionsLabel: {
    marginTop: 12,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  optionLetter: {
    width: 20,
  },
  radioButton: {
    padding: 4,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
  },
  footer: {
    paddingVertical: 16,
  },
});

export default PreviewQuestionsScreen;
