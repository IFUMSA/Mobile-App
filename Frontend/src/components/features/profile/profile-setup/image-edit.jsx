import { View, Image, StyleSheet } from "react-native";

const ImageEdit = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("@assets/icons/profile-icon.png")}
        style={styles.profileIcon}
      />
      <Image
        source={require("@assets/icons/camera-icon.png")}
        style={styles.cameraIcon}
      />
    </View>
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
    // marginBottom: 20,
    width: 40,
    height: 40,
  },
  profileIcon: {
    // width: 140,
    // height: 140,
    borderRadius: 100,
  },
});
