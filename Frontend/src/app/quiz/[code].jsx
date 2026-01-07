import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import Container from '@components/ui/container';
import { useTheme } from '@hooks/use-theme';
import Feather from '@expo/vector-icons/Feather';

export default function SharedQuizScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { code } = useLocalSearchParams();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (code) {
            fetchSharedQuiz();
        }
    }, [code]);

    const fetchSharedQuiz = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080'}/api/study/shared/${code}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Quiz not found');
            }

            setQuiz(data.quiz);
        } catch (err) {
            console.error('Fetch shared quiz error:', err);
            setError(err.message || 'Failed to load quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleTakeQuiz = () => {
        if (!quiz) return;

        router.push({
            pathname: '/study/practice',
            params: {
                sharedQuiz: JSON.stringify(quiz),
                mode: 'quiz',
                title: quiz.title,
            },
        });
    };

    const handleSaveQuiz = async () => {
        if (!quiz) return;

        try {
            setSaving(true);

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080'}/api/study/save-shared`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ shareCode: code }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to save quiz');
            }

            Alert.alert(
                'Quiz Saved!',
                'Quiz has been added to your collection.',
                [
                    {
                        text: 'View My Quizzes',
                        onPress: () => router.replace('/study/my-questions'),
                    },
                    { text: 'Stay Here', style: 'cancel' },
                ]
            );
        } catch (err) {
            console.error('Save quiz error:', err);
            Alert.alert('Error', err.message || 'Failed to save quiz. Please log in and try again.');
        } finally {
            setSaving(false);
        }
    };

    const getCreatorName = () => {
        if (!quiz?.createdBy) return 'Unknown';
        const creator = quiz.createdBy;
        if (creator.firstName && creator.lastName) {
            return `${creator.firstName} ${creator.lastName}`;
        }
        return creator.userName || 'Anonymous';
    };

    if (loading) {
        return (
            <Container>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.secondary} />
                    <Text variant="body2" color="gray" style={{ marginTop: 12 }}>
                        Loading shared quiz...
                    </Text>
                </View>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <View style={styles.centerContainer}>
                    <Feather name="alert-circle" size={64} color={theme.colors.error} />
                    <Text variant="heading3" style={{ marginTop: 16, textAlign: 'center' }}>
                        Quiz Not Found
                    </Text>
                    <Text variant="body2" color="gray" style={{ marginTop: 8, textAlign: 'center' }}>
                        {error}
                    </Text>
                    <Button
                        variant="secondary"
                        onPress={() => router.replace('/')}
                        style={{ marginTop: 24 }}
                    >
                        Go Home
                    </Button>
                </View>
            </Container>
        );
    }

    return (
        <Container>
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="chevron-left" size={24} color="white" />
                </Pressable>
                <Text variant="heading2" color="white" fontWeight="600">
                    Shared Quiz
                </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Quiz Info Card */}
                <View style={[styles.quizCard, { borderColor: theme.colors.grayLight }]}>
                    <View style={[styles.iconWrapper, { backgroundColor: theme.colors.secondaryAlpha?.[10] || 'rgba(42, 153, 107, 0.1)' }]}>
                        <Feather name="file-text" size={40} color={theme.colors.secondary} />
                    </View>

                    <Text variant="heading2" style={styles.quizTitle}>
                        {quiz.title}
                    </Text>

                    {quiz.description && (
                        <Text variant="body2" color="gray" style={styles.description}>
                            {quiz.description}
                        </Text>
                    )}

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Feather name="help-circle" size={18} color={theme.colors.gray} />
                            <Text variant="body2" color="gray" style={styles.metaText}>
                                {quiz.questionCount} questions
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Feather name="clock" size={18} color={theme.colors.gray} />
                            <Text variant="body2" color="gray" style={styles.metaText}>
                                {quiz.duration} mins
                            </Text>
                        </View>
                    </View>

                    <View style={styles.creatorRow}>
                        <Feather name="user" size={16} color={theme.colors.gray} />
                        <Text variant="caption" color="gray" style={styles.creatorText}>
                            Shared by {getCreatorName()}
                        </Text>
                    </View>
                </View>

                {/* Question Preview */}
                <Text variant="body" fontWeight="600" style={styles.sectionTitle}>
                    Questions Preview
                </Text>
                {quiz.questions?.slice(0, 3).map((q, index) => (
                    <View key={index} style={[styles.questionPreview, { borderColor: theme.colors.grayLight }]}>
                        <Text variant="body2" fontWeight="500">
                            {index + 1}. {q.question.length > 80 ? q.question.substring(0, 80) + '...' : q.question}
                        </Text>
                    </View>
                ))}
                {quiz.questions?.length > 3 && (
                    <Text variant="caption" color="gray" style={styles.moreText}>
                        +{quiz.questions.length - 3} more questions
                    </Text>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    variant="outlined"
                    fullWidth
                    onPress={handleSaveQuiz}
                    disabled={saving}
                    style={styles.saveButton}
                >
                    {saving ? 'Saving...' : 'Save to My Quizzes'}
                </Button>
                <Button
                    variant="secondary"
                    fullWidth
                    onPress={handleTakeQuiz}
                >
                    Take Quiz Now
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    quizCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    quizTitle: {
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        textAlign: 'center',
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 14,
    },
    creatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    creatorText: {
        fontSize: 12,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    questionPreview: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 8,
    },
    moreText: {
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    footer: {
        paddingTop: 16,
        paddingBottom: 40,
        gap: 12,
    },
    saveButton: {
        marginBottom: 0,
    },
});
