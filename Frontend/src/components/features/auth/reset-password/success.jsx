import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/button";
import { Link } from "expo-router";

const ResetPasswordSuccess = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("@assets/Images/checkmark.png")}
          style={styles.icon}
        />
        <Text variant="heading" style={styles.title}>
          Password Reset Successful
        </Text>
        <Text variant="body2" style={styles.message}>
          You can now proceed to login using your new password
        </Text>
      
      </View>
      <Link href="/(auth)/(main)/login" asChild>
          <Button variant="secondary" fullWidth>
            Back to Login
          </Button>
        </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    maxHeight: 400,
    marginVertical: 'auto',
  },
  content: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 32,
  },
  title: {
    marginBottom: 32,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    maxWidth: 282,
  },
});

export default ResetPasswordSuccess;
