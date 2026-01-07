import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import { TextInput } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { Button } from '@components/ui/button';
import Container from '@components/ui/container';
import { useTheme } from '@hooks/use-theme';
import Feather from '@expo/vector-icons/Feather';
import api from '@services/api';
import * as DocumentPicker from 'expo-document-picker';

// FileSystem is optional - may not be available in Expo Go
let FileSystem = null;
try {
  FileSystem = require('expo-file-system');
} catch (e) {
  console.log('FileSystem not available - file upload disabled');
}

const questionTypes = [
  { value: 'mcq', label: 'Multiple Choice Questions (MCQs)' },
  { value: 'truefalse', label: 'True/False' },
];

const durations = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
];

export default function GenerateQuestionsScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [topic, setTopic] = useState('');
  const [questionType, setQuestionType] = useState('mcq');
  const [numberOfQuestions, setNumberOfQuestions] = useState('10');
  const [duration, setDuration] = useState('30');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim() && !uploadedFile) {
      Alert.alert('Missing Information', 'Please enter a topic or upload study materials');
      return;
    }

    const numQuestions = parseInt(numberOfQuestions, 10);
    if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 50) {
      Alert.alert('Invalid Input', 'Please enter a number between 1 and 50 for questions');
      return;
    }

    setIsGenerating(true);
    setLoadingMessage('Preparing your quiz...');

    try {
      // Build file parts array for multi-modal AI
      const fileParts = [];
      if (uploadedFile?.dataUrl) {
        fileParts.push({
          type: 'file',
          mediaType: uploadedFile.mimeType,
          url: uploadedFile.dataUrl,
        });
        setLoadingMessage('Processing uploaded materials...');
      }

      setLoadingMessage('AI is generating questions...');

      const response = await api.post('/api/ai/generate-questions', {
        topic: topic.trim(),
        questionType,
        numberOfQuestions: numQuestions,
        fileParts: fileParts.length > 0 ? fileParts : null,
      });

      const data = response.data;

      if (!data.success || !data.questions || data.questions.length === 0) {
        throw new Error('No questions were generated. Please try a different topic.');
      }

      setLoadingMessage('Questions ready! Opening preview...');

      // Navigate to preview/save screen with generated questions
      router.push({
        pathname: '/study/preview-questions',
        params: {
          questions: JSON.stringify(data.questions),
          topic: topic.trim(),
          questionType,
          duration,
        },
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      Alert.alert(
        'Generation Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
      setLoadingMessage('');
    }
  };

  const handleUpload = async () => {
    // Check if FileSystem is available
    if (!FileSystem) {
      Alert.alert(
        'Feature Unavailable',
        'File upload requires a development build. Please enter a topic manually instead.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'image/jpeg',
          'image/png',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      // File size limit (5MB)
      const MAX_FILE_SIZE_MB = 5;
      const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

      if (file.size && file.size > MAX_FILE_SIZE_BYTES) {
        Alert.alert(
          'File Too Large',
          `Maximum file size is ${MAX_FILE_SIZE_MB}MB. Please choose a smaller file.`,
          [{ text: 'OK' }]
        );
        return;
      }

      // Read file as base64 data URL for AI SDK multi-modal support
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: 'base64',
      });

      // Create data URL
      const dataUrl = `data:${file.mimeType};base64,${base64}`;

      setUploadedFile({
        name: file.name,
        uri: file.uri,
        mimeType: file.mimeType,
        dataUrl,
      });

      Alert.alert(
        'File Uploaded',
        `${file.name} ready for AI processing. The AI will read the content directly.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <Container>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="white" />
        </Pressable>
        <Text variant="heading2" color="white" fontWeight="600">
          Generate Questions
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text variant="body2" fontWeight="500" style={styles.label}>
            Quiz Name (Topic)
          </Text>
          <TextInput
            placeholder="e.g., Immunity, Cardiovascular System"
            value={topic}
            onChangeText={setTopic}
          />
        </View>

        <View style={styles.formGroup}>
          <Select
            label="Question Type"
            options={questionTypes}
            value={questionType}
            onValueChange={(option) => setQuestionType(option.value)}
            placeholder="Select question type"
          />
        </View>

        <View style={styles.formGroup}>
          <Text variant="body2" fontWeight="500" style={styles.label}>
            Number of Questions (max of 100)
          </Text>
          <TextInput
            placeholder="10"
            value={numberOfQuestions}
            onChangeText={setNumberOfQuestions}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Select
            label="Quiz Duration"
            options={durations}
            value={duration}
            onValueChange={(option) => setDuration(option.value)}
            placeholder="Select duration"
          />
        </View>

        <View style={styles.formGroup}>
          <Text variant="body2" fontWeight="500" style={styles.label}>
            Upload Materials
          </Text>
          {uploadedFile ? (
            <View style={[styles.uploadedFile, { borderColor: theme.colors.secondary }]}>
              <Text variant="body2" style={styles.fileName}>
                {uploadedFile.name}
              </Text>
              <Pressable onPress={removeFile}>
                <Feather name="x" size={20} color={theme.colors.error} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.uploadBox}
              onPress={handleUpload}
            >
              <Feather name="upload-cloud" size={48} color="#9E9E9E" />
              <Text style={styles.uploadTitle}>
                Upload Materials
              </Text>
              <Text style={styles.uploadSubtitle}>
                (Pdfs, docs, ppt, jpg, png)
              </Text>
              <View style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>
                  Upload
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="secondary"
          fullWidth
          onPress={handleGenerate}
          disabled={!topic.trim() || isGenerating}
        >
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="white" />
              <Text variant="body" color="white" style={styles.loadingText}>
                {loadingMessage || 'Generating...'}
              </Text>
            </View>
          ) : (
            'Generate Questions'
          )}
        </Button>
      </View>
    </Container>
  );
}

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
  content: {
    flex: 1,
    paddingTop: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#1f382e',
    backgroundColor: '#FFFFFF',
  },
  dropdownMenu: {
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#1f382e',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 64,
    borderRadius: 12,
    borderWidth: 0.5,
    borderStyle: 'dashed',
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  uploadIcon: {
    width: 65,
    height: 63,
    marginBottom: 0,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '300',
    color: '#000000',
  },
  uploadSubtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: '#000000',
  },
  uploadButton: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(42, 153, 107, 0.8)',
  },
  uploadButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  uploadedFile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    borderStyle: 'dashed',
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  fileName: {
    flex: 1,
  },
  footer: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
});


