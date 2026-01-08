import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import { ProfileSetupInput } from '@components/ui/Input/profile-setup';
import { Button } from '@components/ui/button';
import Container from '@components/ui/container';
import PageHeader from '@components/ui/PageHeader';
import { useTheme } from '@hooks/use-theme';
import { useProfile, useUpdateProfileMutation } from '@hooks/api';
import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const { data: profileData, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfileMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', error?.message || 'Failed to update profile');
    },
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    if (profileData?.user) {
      setFirstName(profileData.user.firstName || '');
      setLastName(profileData.user.lastName || '');
      setStudentClass(profileData.user.studentClass || '');
      setMatricNumber(profileData.user.matricNumber || '');
      setPhone(profileData.user.phone || '');
    }
  }, [profileData]);

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      studentClass: studentClass.trim(),
      matricNumber: matricNumber.trim(),
      phone: phone.trim(),
    };

    if (profilePic) {
      updateData.profilePic = profilePic;
    }

    updateProfileMutation.mutate(updateData);
  };

  const handlePickImage = async () => {
    Alert.alert('Change Profile Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera access is needed');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
          });
          if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            if (asset.base64) {
              const dataUrl = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
              setProfilePic(dataUrl);
            } else {
              setProfilePic(asset.uri);
            }
          }
        },
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Required', 'Photo library access is needed');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
          });
          if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            if (asset.base64) {
              const dataUrl = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
              setProfilePic(dataUrl);
            } else {
              setProfilePic(asset.uri);
            }
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const user = profileData?.user;
  const displayImage = profilePic
    ? { uri: profilePic }
    : user?.profilePic
      ? { uri: user.profilePic }
      : require('@assets/icons/profile-icon.png');

  return (
    <Container>
      <PageHeader title="Edit Profile" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <Pressable style={styles.imageContainer} onPress={handlePickImage}>
            <Image source={displayImage} style={styles.profileImage} />
            <View
              style={[
                styles.editImageButton,
                { backgroundColor: theme.colors.secondary },
              ]}
            >
              <Feather name="camera" size={16} color="#FFFFFF" />
            </View>
          </Pressable>
          <Text variant="caption" color="gray" style={styles.imageHint}>
            Tap to change profile photo
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <ProfileSetupInput
            label="First Name"
            placeholder="Enter first name"
            value={firstName}
            onChangeText={setFirstName}
            icon={require('@assets/icons/iconamoon_profile.png')}
          />
          <View style={styles.fieldSpacer} />
          <ProfileSetupInput
            label="Last Name"
            placeholder="Enter last name"
            value={lastName}
            onChangeText={setLastName}
            icon={require('@assets/icons/iconamoon_profile.png')}
          />
          <View style={styles.fieldSpacer} />
          <ProfileSetupInput
            label="Class"
            placeholder="e.g. 300L, 400L"
            value={studentClass}
            onChangeText={setStudentClass}
            icon={require('@assets/icons/mdi_university-outline.png')}
          />
          <View style={styles.fieldSpacer} />
          <ProfileSetupInput
            label="Matric Number"
            placeholder="Enter your matric number"
            value={matricNumber}
            onChangeText={setMatricNumber}
            icon={require('@assets/icons/mdi_university-outline.png')}
          />
          <View style={styles.fieldSpacer} />
          <ProfileSetupInput
            label="Phone Number"
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            icon={require('@assets/icons/iconamoon_profile.png')}
          />
          <View style={styles.fieldSpacer} />
          {/* <View style={styles.inputGroup}>
            <Text variant="body2" fontWeight="500" style={styles.label}>
              Email
            </Text>
            <View style={[styles.disabledInput, { borderColor: theme.colors.grayLight }]}>
              <Text variant="body2" color="gray">
                {user?.email || 'Loading...'}
              </Text>
              <Feather name="lock" size={16} color={theme.colors.gray} />
            </View>
            <Text variant="caption" color="gray" style={styles.hint}>
              Email cannot be changed
            </Text>
          </View> */}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="secondary"
          fullWidth
          onPress={handleSave}
          loading={updateProfileMutation.isPending}
        >
          Save Changes
        </Button>
      </View>
    </Container >
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  imageHint: {
    marginTop: 8,
  },
  formSection: {
    paddingBottom: 20,
  },
  fieldSpacer: {
    height: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  disabledInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#F5F5F5',
  },
  hint: {
    marginTop: 4,
  },
  footer: {
    paddingVertical: 24,
    paddingBottom: 40,
  },
});

export default EditProfileScreen;
