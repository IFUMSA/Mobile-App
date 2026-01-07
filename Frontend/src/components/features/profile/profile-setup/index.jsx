import React, { useState, useContext } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Container from "@components/ui/container";
import { Text } from "@components/ui/Text";
import { ProfileSetupInput } from "@components/ui/Input/profile-setup";
import { Button } from "@components/ui/button";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import ImageEdit from "./image-edit";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/use-theme";
import { AuthContext } from "@context/auth-context";

export default function ProfileSetup() {
  const { user, updateProfile } = useContext(AuthContext);
  const { theme } = useTheme();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (imageUri) => {
    setProfilePic(imageUri);
  };

  const handleUpdate = async () => {
    if (!firstName.trim()) {
      Alert.alert("Error", "Please enter your first name");
      return;
    }
    if (!lastName.trim()) {
      Alert.alert("Error", "Please enter your last name");
      return;
    }

    setIsLoading(true);
    try {
      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
        hasCompletedOnboarding: true, // Mark onboarding as complete
      };

      // Only include profilePic if it was changed
      if (profilePic && profilePic !== user?.profilePic) {
        profileData.profilePic = profilePic;
      }

      await updateProfile(profileData);
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.replace("/home") },
      ]);
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    // Mark onboarding as complete even when skipping
    try {
      await updateProfile({ hasCompletedOnboarding: true });
    } catch (error) {
      console.log("Skip update error:", error);
    }
    router.replace("/home");
  };

  return (
    <KeyboardAwareScrollView>
      <Container>
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <Text variant="subheading" fontSize={20} color="textSecondary">
              Setup Your Profile
            </Text>
          </View>
          <View style={styles.skipLink} onTouchEnd={handleSkip}>
            <Text variant="body" color="textSecondary">
              skip
            </Text>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color={theme.colors.textSecondary}
            />
          </View>
        </View>
        <ImageEdit
          currentImage={profilePic}
          onImageChange={handleImageChange}
        />
        <Text
          variant="body"
          color="secondary"
          align="center"
          style={{ marginTop: 16, marginBottom: 24 }}
        >
          Hi IFUMSAITE! Share a little bit about yourself!
        </Text>
        <View style={styles.inputsContainer}>
          <ProfileSetupInput
            label="First Name"
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={setFirstName}
            icon={require("@assets/icons/iconamoon_profile.png")}
          />
          <ProfileSetupInput
            label="Last Name"
            placeholder="Enter your last name"
            value={lastName}
            onChangeText={setLastName}
            icon={require("@assets/icons/iconamoon_profile.png")}
          />
          <ProfileSetupInput
            label="Bio"
            placeholder="Tell us about yourself (optional)"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            icon={require("@assets/icons/mdi_university-outline.png")}
          />
        </View>
        <Button
          fullWidth
          variant="primary"
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="white" />
              <Text variant="body" color="white" style={styles.loadingText}>
                Updating...
              </Text>
            </View>
          ) : (
            "Update Profile"
          )}
        </Button>
      </Container>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  inputsContainer: {
    gap: 24,
    marginBottom: 40,
  },
  headerContainer: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 72,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    marginLeft: 41,
  },
  skipLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 8,
  },
});
