import React, { useState } from "react";
import { View } from "react-native";
import { useTheme } from "@hooks/use-theme";
import useCreateStyles from "@hooks/create-styles";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/button";
import { TextInput } from "@components/ui/Input";
import { ProfileSetupInput } from "@components/ui/Input/profile-setup";
import { Select } from "@components/ui/Select";
import { QuizFormInput } from "../../components/ui/Input/quiz-form-input";

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const { theme } = useTheme();

  const styles = useCreateStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.medium,
    },
    header: {
      marginTop: theme.spacing.large * 2,
      marginBottom: theme.spacing.large,
      alignItems: "center",
    },
    content: {
      gap: theme.spacing.medium,
    },
    searchContainer: {
      marginBottom: theme.spacing.medium,
    },
    profileInputContainer: {
      marginBottom: theme.spacing.medium,
    },
    quizInputContainer: {
      marginBottom: theme.spacing.medium,
    },
    selectContainer: {
      marginBottom: theme.spacing.medium,
    },
    buttonContainer: {
      alignItems: "center",
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading" color="textSecondary" uppercase>
          Ifumsa Mobile
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            label="Search"
          />
        </View>

        <View style={styles.profileInputContainer}>
          <ProfileSetupInput
            label="Username"
            icon="person-outline"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.selectContainer}>
          <Select
            label="Select Option"
            placeholder="Choose an option"
            value={selectedOption}
            onPress={() => {
              // Handle select press
              console.log("Select pressed");
            }}
          />
        </View>
        {/* 
        <View style={styles.selectContainer}>
          <QuizFormInput label="Select Option" placeholder="Choose an option" />
        </View> */}

        <View style={styles.buttonContainer}>
          <Button
            fullWidth
            variant="primary"
            style={{
              maxWidth: 344,
            }}
          >
            Reset Password
          </Button>
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;
