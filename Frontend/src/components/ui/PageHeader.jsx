import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text } from "@components/ui/Text";
import { useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";

const PageHeader = ({ title, isAuth = false }) => {
  const navigation = useNavigation();
  const router = useRouter();

  return (
    <View style={styles.heading}>
      <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
        {!isAuth ? (
          <Entypo name="chevron-left" size={24} color="black" />
        ) : (
          <Image
            source={require("@assets/icons/back-icon.png")}
            width={24}
            height={24}
          />
        )}
      </TouchableOpacity>
      <View style={styles.headingText}>
        <Text variant="heading" fontSize={20}>
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    marginTop: 72,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 36,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headingText: {
    flex: 1,
    alignItems: "center",
    marginLeft: -44,
  },
});

export default PageHeader;
