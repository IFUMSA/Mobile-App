import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text } from '@components/ui/Text';
import Container from '@components/ui/container';
import PageHeader from '@components/ui/PageHeader';
import EventCard from '@components/ui/EventCard';
import { useTheme } from '@hooks/use-theme';
import { useEvents } from '@hooks/api/use-content';
import Feather from '@expo/vector-icons/Feather';

const EventsListScreen = () => {
    const { theme } = useTheme();
    const { data: eventsData, isLoading } = useEvents();
    const events = eventsData?.events || [];

    // Format events for EventCard component (same as homepage)
    const formattedEvents = useMemo(() => {
        return events.map((event) => {
            const startDate = new Date(event.startDate);
            return {
                ...event,
                formattedTitle: event.title,
                formattedLocation: event.location || 'TBA',
                formattedTime: startDate.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
                formattedDate: startDate.toLocaleDateString('en-NG', { day: '2-digit', month: '2-digit', year: '2-digit' }),
                formattedImage: event.image ? { uri: event.image } : undefined,
            };
        });
    }, [events]);

    const renderEventItem = ({ item }) => (
        <EventCard
            title={item.formattedTitle}
            location={item.formattedLocation}
            time={item.formattedTime}
            date={item.formattedDate}
            image={item.formattedImage}
            style={styles.eventCard}
        />
    );

    if (isLoading) {
        return (
            <Container>
                <PageHeader title="Events" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.secondary} />
                </View>
            </Container>
        );
    }

    return (
        <Container>
            <PageHeader title="Events" />

            {events.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="calendar" size={48} color={theme.colors.gray} />
                    <Text variant="body" color="gray" style={styles.emptyText}>
                        No upcoming events
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={formattedEvents}
                    renderItem={renderEventItem}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.eventsList}
                />
            )}
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
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
    },
    eventsList: {
        gap: 24,
        paddingVertical: 16,
        paddingBottom: 40,
    },
    eventCard: {
        marginBottom: 0,
    },
});

export default EventsListScreen;
