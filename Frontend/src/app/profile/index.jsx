import React from 'react';
import { View, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import Container from '@components/ui/container';
import PageHeader from '@components/ui/PageHeader';
import { useTheme } from '@hooks/use-theme';
import { useProfile } from '@hooks/api';
import Feather from '@expo/vector-icons/Feather';

const ProfileScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { data: profileData, isLoading } = useProfile();

  const user = profileData?.user;
  const profileImage = user?.profilePic
    ? { uri: user.profilePic }
    : require('@assets/icons/profile-icon.png');

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName || 'User'
    : 'Loading...';

  if (isLoading) {
    return (
      <Container>
        <PageHeader title="Profile" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader title="Profile" />

      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={profileImage} style={styles.profileImage} />
          <Text variant="heading3" fontWeight="600" style={styles.name}>
            {displayName}
          </Text>
          {user?.userName && (
            <Text variant="body2" color="gray">
              @{user.userName}
            </Text>
          )}
          {user?.bio && (
            <Text variant="body2" color="textSecondary" style={styles.bio}>
              {user.bio}
            </Text>
          )}
        </View>

        {/* Profile Info Cards */}
        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { borderColor: theme.colors.grayLight }]}>
            <View style={styles.infoRow}>
              <Feather name="mail" size={20} color={theme.colors.gray} />
              <View style={styles.infoText}>
                <Text variant="caption" color="gray">Email</Text>
                <Text variant="body2">{user?.email || '-'}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.infoCard, { borderColor: theme.colors.grayLight }]}>
            <View style={styles.infoRow}>
              <Feather name="user" size={20} color={theme.colors.gray} />
              <View style={styles.infoText}>
                <Text variant="caption" color="gray">Username</Text>
                <Text variant="body2">{user?.userName || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <Pressable
            style={[styles.menuItem, { borderColor: theme.colors.grayLight }]}
            onPress={() => router.push('/profile/edit')}
          >
            <View style={styles.menuContent}>
              <Feather name="edit-2" size={20} color={theme.colors.secondary} />
              <Text variant="body" style={styles.menuText}>Edit Profile</Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.colors.gray} />
          </Pressable>

          <Pressable
            style={[styles.menuItem, { borderColor: theme.colors.grayLight }]}
            onPress={() => router.push('/payment/status')}
          >
            <View style={styles.menuContent}>
              <Feather name="credit-card" size={20} color={theme.colors.secondary} />
              <Text variant="body" style={styles.menuText}>Payment History</Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.colors.gray} />
          </Pressable>
        </View>
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
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    marginBottom: 4,
  },
  bio: {
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  infoSection: {
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 12,
  },
  menuSection: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    marginLeft: 12,
  },
});

export default ProfileScreen;
