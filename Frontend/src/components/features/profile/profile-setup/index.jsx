import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Container from "@components/ui/container";
import { Text } from "@components/ui/Text";
import { ProfileSetupInput } from "@components/ui/Input/profile-setup";
import { ProfileSetupSelect } from "@components/ui/Select/profile-setup";
import { Button } from "@components/ui/button";
import { View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import ImageEdit from "./image-edit";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/use-theme";

const ProfileSetup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const { theme } = useTheme();

  const classOptions = [
    { value: "1", label: "part 1" },
    { value: "2", label: "part 2" },
    { value: "3", label: "part 3" },
  ];

  return (
    <KeyboardAwareScrollView>
      <Container>
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <Text variant="subheading" fontSize={20} color="textSecondary">
              Setup Your Profile
            </Text>
          </View>
          <Link href="/profile">
            <View style={styles.skipLink}>
              <Text variant="body" color="textSecondary">
                skip
              </Text>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color={theme.colors.textSecondary}
              />
            </View>
          </Link>
        </View>
        <ImageEdit />
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
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            icon={require("@assets/icons/iconamoon_profile.png")}
          />
          <ProfileSetupSelect
            label="Class"
            placeholder="Select your class"
            value={gender}
            onValueChange={(option) => setGender(option.value)}
            options={classOptions}
            icon={require("@assets/icons/mdi_university-outline.png")}
          />
          <ProfileSetupInput
            label="Matric Number"
            placeholder="Enter your matric number"
            value={email}
            onChangeText={setEmail}
            icon={require("@assets/icons/ph_student-light.png")}
          />
        </View>
        <Button fullWidth variant="primary">
          update
        </Button>
      </Container>
    </KeyboardAwareScrollView>
  );
};

export default ProfileSetup;

const styles = StyleSheet.create({
  inputsContainer: {
    // flex: 1,
    gap: 32,
    marginBottom: 60,
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
});
