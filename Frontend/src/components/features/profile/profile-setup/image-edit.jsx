import React, { useState } from "react";
import { View, Image, StyleSheet, Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

const ImageEdit = ({ currentImage, onImageChange }) => {
  const [imageUri, setImageUri] = useState(currentImage);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to change your profile picture."
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const uri = asset.uri;
      setImageUri(uri);

      // If base64 is available, create a data URL for upload
      if (asset.base64) {
        const mimeType = asset.mimeType || "image/jpeg";
        const dataUrl = `data:${mimeType};base64,${asset.base64}`;
        onImageChange?.(dataUrl);
      } else {
        onImageChange?.(uri);
      }
    }
  };

  const takePhoto = async () => {
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow camera access to take a profile picture."
      );
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
      const uri = asset.uri;
      setImageUri(uri);

      if (asset.base64) {
        const mimeType = asset.mimeType || "image/jpeg";
        const dataUrl = `data:${mimeType};base64,${asset.base64}`;
        onImageChange?.(dataUrl);
      } else {
        onImageChange?.(uri);
      }
    }
  };

  const showImageOptions = () => {
    Alert.alert("Change Profile Picture", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const displayImage = imageUri || require("@assets/icons/profile-icon.png");

  return (
    <Pressable onPress={showImageOptions} style={styles.container}>
      <Image
        source={typeof displayImage === "string" ? { uri: displayImage } : displayImage}
        style={styles.profileIcon}
      />
      <Image
        source={require("@assets/icons/camera-icon.png")}
        style={styles.cameraIcon}
      />
    </Pressable>
  );
};

export default ImageEdit;

const styles = StyleSheet.create({
  container: {
    width: 141,
    height: 154,
    marginHorizontal: "auto",
  },
  cameraIcon: {
    position: "absolute",
    left: "50%",
    bottom: 0,
    marginLeft: -20,
    width: 40,
    height: 40,
  },
  profileIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
});
