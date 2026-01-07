import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, Modal, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import Container from '@components/ui/container';
import { useTheme } from '@hooks/use-theme';
import Feather from '@expo/vector-icons/Feather';
import { useUserQuizzes, useDeleteQuizMutation } from '@hooks/api';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

const MyQuestionsScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);

  // Fetch user's quizzes from API
  const { data: quizzesData, isLoading, error, refetch } = useUserQuizzes();
  const quizzes = quizzesData?.quizzes || [];

  // Delete quiz mutation
  const deleteQuizMutation = useDeleteQuizMutation({
    onSuccess: () => {
      setShowOptionsModal(false);
      refetch();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete quiz');
    },
  });

  const handleQuizPress = (quiz) => {
    setSelectedQuiz(quiz);
    setShowModeModal(true);
  };

  const handleOptionsPress = (quiz, e) => {
    e.stopPropagation();
    setSelectedQuiz(quiz);
    setShowOptionsModal(true);
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
  };

  const handleStartQuiz = () => {
    if (selectedQuiz && selectedMode) {
      setShowModeModal(false);
      router.push({
        pathname: '/study/practice',
        params: {
          quizId: selectedQuiz.id,
          mode: selectedMode,
          title: selectedQuiz.title,
        },
      });
    }
  };

  const handleEditQuestions = () => {
    setShowOptionsModal(false);
    router.push({
      pathname: '/study/edit-questions',
      params: { quizId: selectedQuiz?.id },
    });
  };

  const handleSaveAsPdf = async () => {
    if (!selectedQuiz) return;
    setShowOptionsModal(false);

    try {
      // Generate HTML content for the quiz
      const questionsHtml = selectedQuiz.questions?.map((q, index) => `
        <div style="margin-bottom: 20px;">
          <p style="font-weight: bold;">Q${index + 1}. ${q.question}</p>
          <ul style="list-style-type: none; padding-left: 0;">
            ${q.options?.map((opt, i) => `
              <li style="margin: 5px 0; ${i === q.correctAnswer ? 'color: green; font-weight: bold;' : ''}">
                ${String.fromCharCode(97 + i)}) ${opt}
              </li>
            `).join('')}
          </ul>
        </div>
      `).join('') || '<p>No questions</p>';

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #2a996b; }
            </style>
          </head>
          <body>
            <h1>${selectedQuiz.title || 'Quiz'}</h1>
            <p>Type: ${selectedQuiz.questionType || 'MCQ'}</p>
            <p>Questions: ${selectedQuiz.questions?.length || 0}</p>
            <hr/>
            ${questionsHtml}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
      } else {
        Alert.alert('Success', 'PDF saved to: ' + uri);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const handleShareLink = async () => {
    if (!selectedQuiz) return;

    try {
      const quizId = selectedQuiz._id || selectedQuiz.id;

      // Call backend to enable sharing and get share code
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080'}/api/study/quizzes/${quizId}/share`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to share quiz');
      }

      if (data.isShared && data.shareLink) {
        await Clipboard.setStringAsync(data.shareLink);
        Alert.alert(
          'Link Copied!',
          `Quiz is now shared. Link copied to clipboard:\n${data.shareLink}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Quiz is now private', 'Sharing has been disabled for this quiz.');
      }

      setShowOptionsModal(false);
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', error.message || 'Failed to share quiz');
      setShowOptionsModal(false);
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'mcq': return 'Multiple Choice Questions';
      case 'truefalse': return 'True/False Questions';
      default: return 'Questions';
    }
  };

  const renderQuizItem = ({ item }) => (
    <Pressable
      style={[styles.quizCard, { borderColor: theme.colors.grayLight }]}
      onPress={() => handleQuizPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondaryAlpha?.[10] || 'rgba(42, 153, 107, 0.1)' }]}>
        <Feather name="file-text" size={24} color={theme.colors.secondary} />
      </View>
      <View style={styles.quizInfo}>
        <Text variant="body" fontWeight="600">
          {item.title}
        </Text>
        <View style={styles.quizMeta}>
          <View style={styles.questionCount}>
            <Text variant="caption" fontWeight="600" color="secondary">
              {item.questions?.length || 0}
            </Text>
            <Text variant="caption" color="gray"> questions</Text>
          </View>
          {item.duration && (
            <View style={styles.durationBadge}>
              <Feather name="clock" size={12} color="#666" />
              <Text variant="caption" color="gray" style={{ marginLeft: 4 }}>
                {item.duration} min
              </Text>
            </View>
          )}
        </View>
      </View>
      <Pressable
        style={styles.moreButton}
        onPress={(e) => handleOptionsPress(item, e)}
      >
        <Feather name="more-vertical" size={20} color={theme.colors.gray} />
      </Pressable>
    </Pressable>
  );

  return (
    <Container>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="white" />
        </Pressable>
        <Text variant="heading2" color="white" fontWeight="600">
          Your Questions
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
          <Text variant="body2" color="gray" style={{ marginTop: 12 }}>
            Loading your quizzes...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Feather name="alert-circle" size={48} color={theme.colors.error} />
          <Text variant="body2" color="gray" style={{ marginTop: 12 }}>
            Failed to load quizzes
          </Text>
          <Button variant="outlined" onPress={() => refetch()} style={{ marginTop: 16 }}>
            Retry
          </Button>
        </View>
      ) : quizzes.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Feather name="file-text" size={48} color={theme.colors.gray} />
          <Text variant="body2" color="gray" style={{ marginTop: 12 }}>
            No quizzes yet. Generate some questions!
          </Text>
          <Button variant="secondary" onPress={() => router.push('/study/generate')} style={{ marginTop: 16 }}>
            Generate Questions
          </Button>
        </View>
      ) : (
        <FlatList
          data={quizzes}
          renderItem={renderQuizItem}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={[styles.optionsModal, { backgroundColor: theme.colors.white }]}>
            <View style={styles.optionsHeader}>
              <Pressable onPress={() => setShowOptionsModal(false)}>
                <Feather name="chevron-left" size={24} color={theme.colors.textSecondary} />
              </Pressable>
              <Text variant="body" fontWeight="600">
                Options
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <Pressable style={styles.optionItem} onPress={handleEditQuestions}>
              <Feather name="edit-2" size={20} color={theme.colors.textSecondary} />
              <Text variant="body2" style={styles.optionText}>
                Edit Questions
              </Text>
            </Pressable>

            <Pressable style={styles.optionItem} onPress={handleSaveAsPdf}>
              <Feather name="download" size={20} color={theme.colors.textSecondary} />
              <Text variant="body2" style={styles.optionText}>
                Save as pdf
              </Text>
            </Pressable>

            <Pressable style={styles.optionItem} onPress={handleShareLink}>
              <Feather name="share-2" size={20} color={theme.colors.textSecondary} />
              <Text variant="body2" style={styles.optionText}>
                Copy/Share Link
              </Text>
            </Pressable>

            <Pressable
              style={styles.optionItem}
              onPress={() => {
                Alert.alert(
                  'Delete Quiz',
                  `Are you sure you want to delete "${selectedQuiz?.title}"?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => deleteQuizMutation.mutate(selectedQuiz?._id || selectedQuiz?.id),
                    },
                  ]
                );
              }}
            >
              <Feather name="trash-2" size={20} color={theme.colors.error} />
              <Text variant="body2" style={[styles.optionText, { color: theme.colors.error }]}>
                Delete
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Mode Selection Modal */}
      <Modal
        visible={showModeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modeModal, { backgroundColor: theme.colors.white }]}>
            <View style={styles.modeHeader}>
              <Pressable onPress={() => setShowModeModal(false)}>
                <Feather name="chevron-left" size={24} color={theme.colors.textSecondary} />
              </Pressable>
              <Text variant="body" fontWeight="600">
                Choose Your Mode of Practice
              </Text>
            </View>

            <View style={styles.modeOptions}>
              <Pressable
                style={[
                  styles.modeOption,
                  { borderColor: theme.colors.grayLight },
                  selectedMode === 'practice' && {
                    borderColor: theme.colors.secondary,
                    backgroundColor: theme.colors.secondaryAlpha?.[10] || 'rgba(42, 153, 107, 0.1)',
                  },
                ]}
                onPress={() => handleModeSelect('practice')}
              >
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: selectedMode === 'practice' ? theme.colors.secondary : theme.colors.gray },
                  ]}
                >
                  {selectedMode === 'practice' && (
                    <View style={[styles.radioInner, { backgroundColor: theme.colors.secondary }]} />
                  )}
                </View>
                <Feather name="book-open" size={24} color={theme.colors.textSecondary} />
                <Text variant="body" fontWeight="500" style={styles.modeText}>
                  Practice Mode
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modeOption,
                  { borderColor: theme.colors.grayLight },
                  selectedMode === 'quiz' && {
                    borderColor: theme.colors.secondary,
                    backgroundColor: theme.colors.secondaryAlpha?.[10] || 'rgba(42, 153, 107, 0.1)',
                  },
                ]}
                onPress={() => handleModeSelect('quiz')}
              >
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: selectedMode === 'quiz' ? theme.colors.secondary : theme.colors.gray },
                  ]}
                >
                  {selectedMode === 'quiz' && (
                    <View style={[styles.radioInner, { backgroundColor: theme.colors.secondary }]} />
                  )}
                </View>
                <Feather name="help-circle" size={24} color={theme.colors.textSecondary} />
                <Text variant="body" fontWeight="500" style={styles.modeText}>
                  Quiz Mode
                </Text>
              </Pressable>
            </View>

            <Button
              variant="secondary"
              fullWidth
              onPress={handleStartQuiz}
              disabled={!selectedMode}
            >
              Continue
            </Button>
          </View>
        </View>
      </Modal>
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
    height: 197,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  listContent: {
    paddingTop: 24,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quizInfo: {
    flex: 1,
  },
  quizMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  questionCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  optionsModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  optionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionText: {
    marginLeft: 16,
  },
  modeModal: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 40,
    paddingTop: 50,
    paddingBottom: 63,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 38,
  },
  modeOptions: {
    gap: 20,
    marginBottom: 31,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 82,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 22,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  modeIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  modeText: {
    fontSize: 14,
    lineHeight: 22,
  },
});

export default MyQuestionsScreen;
