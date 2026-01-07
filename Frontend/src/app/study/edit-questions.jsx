import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import Container from '@components/ui/container';
import { useTheme } from '@hooks/use-theme';
import Feather from '@expo/vector-icons/Feather';
import { useUserQuiz, useUpdateQuizMutation } from '@hooks/api';

const EditQuestionsScreen = () => {
    const { theme } = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    const quizId = params.quizId;

    const { data: quizData, isLoading } = useUserQuiz(quizId);
    const updateQuizMutation = useUpdateQuizMutation({
        onSuccess: () => {
            Alert.alert('Success', 'Questions updated successfully!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        },
        onError: () => {
            Alert.alert('Error', 'Failed to save changes');
        },
    });

    const [questions, setQuestions] = useState([]);
    const [title, setTitle] = useState('');

    useEffect(() => {
        if (quizData?.quiz) {
            setTitle(quizData.quiz.title || '');
            setQuestions(quizData.quiz.questions || []);
        }
    }, [quizData]);

    const handleQuestionChange = (index, field, value) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updated = [...questions];
        const options = [...(updated[qIndex].options || [])];
        options[oIndex] = value;
        updated[qIndex] = { ...updated[qIndex], options };
        setQuestions(updated);
    };

    const handleSetCorrectAnswer = (qIndex, oIndex) => {
        const updated = [...questions];
        updated[qIndex] = { ...updated[qIndex], correctAnswer: oIndex };
        setQuestions(updated);
    };

    const handleDeleteQuestion = (index) => {
        Alert.alert('Delete Question', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    const updated = questions.filter((_, i) => i !== index);
                    setQuestions(updated);
                },
            },
        ]);
    };

    const handleSave = () => {
        updateQuizMutation.mutate({
            id: quizId,
            title,
            questions,
        });
    };

    if (isLoading) {
        return (
            <Container>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.secondary} />
                </View>
            </Container>
        );
    }

    const renderQuestion = ({ item, index }) => (
        <View style={[styles.questionCard, { borderColor: theme.colors.grayLight }]}>
            <View style={styles.questionHeader}>
                <Text variant="body2" fontWeight="600" color="secondary">
                    Question {index + 1}
                </Text>
                <Pressable onPress={() => handleDeleteQuestion(index)}>
                    <Feather name="trash-2" size={18} color={theme.colors.error} />
                </Pressable>
            </View>
            <TextInput
                style={[styles.input, { borderColor: theme.colors.grayLight }]}
                value={item.question}
                onChangeText={(text) => handleQuestionChange(index, 'question', text)}
                multiline
                placeholder="Enter question"
            />
            <Text variant="caption" color="gray" style={styles.optionsLabel}>
                Options (tap circle to set correct):
            </Text>
            {item.options?.map((option, oIndex) => (
                <View key={oIndex} style={styles.optionRow}>
                    <Pressable
                        onPress={() => handleSetCorrectAnswer(index, oIndex)}
                        style={styles.radioButton}
                        hitSlop={8}
                    >
                        {oIndex === item.correctAnswer ? (
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
                        onChangeText={(text) => handleOptionChange(index, oIndex, text)}
                        placeholder={`Option ${oIndex + 1}`}
                    />
                </View>
            ))}
        </View>
    );

    return (
        <Container>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="chevron-left" size={24} color={theme.colors.textSecondary} />
                </Pressable>
                <Text variant="body" fontWeight="600">
                    Edit Questions
                </Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.titleSection}>
                <Text variant="caption" color="gray">Quiz Title</Text>
                <TextInput
                    style={[styles.titleInput, { borderColor: theme.colors.grayLight }]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter quiz title"
                />
            </View>

            <FlatList
                data={questions}
                renderItem={renderQuestion}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <Button
                variant="secondary"
                fullWidth
                onPress={handleSave}
                loading={updateQuizMutation.isPending}
            >
                Save Changes
            </Button>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    listContent: {
        gap: 16,
        paddingBottom: 20,
    },
    questionCard: {
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
});

export default EditQuestionsScreen;
