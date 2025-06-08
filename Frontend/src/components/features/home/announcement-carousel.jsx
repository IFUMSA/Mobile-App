import * as React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useTheme } from "@hooks/use-theme";
import { Text } from "@components/ui/Text";
import { Platform } from "react-native";
import { Button } from "@components/ui/button";

const data = [
  {
    id: 0,
    title: "Have You Paid Your Annual Dues?",
    description: "Why Pay Your Annual Dues?",
  },
  {
    id: 1,
    title: "Have Access to The Premium Features",
    description: "Unlock premium quiz features with an annual subscription",
  },
  {
    id: 2,
    title: "Access to The IFUMSA Edu-Stipend Fund",
    description: "Supporting 100 medical students with 20,000 Naira each ",
  },
  {
    id: 3,
    title: "Exclusive Discounts and Priority Access",
    description:
      "Enjoy special offers and first-hand opportunities in IFUMSA-led trainings, events and partnership",
  },
  {
    id: 4,
    title: "A Voice in IFUMSA",
    description:
      "Your dues keep the association running, ensuring your concerns and needs are addressed",
  },
];
const width = Dimensions.get("window").width - 48;

function AnnouncementCarousel() {
  const { theme } = useTheme();
  const ref = React.useRef(null);
  const progress = useSharedValue(0);

  const onPressPagination = (index) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <Carousel
        ref={ref}
        width={width}
        data={data}
        height={100}
        onProgressChange={progress}
        renderItem={({ index }) => (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <View style={[styles.numberContainer]}>
              {index !== 0 && <Text variant="subheading">{index}.</Text>}
            </View>
            <View style={styles.contentContainer}>
              <Text variant="subheading">{data[index].title}</Text>
              <Text variant="caption" style={{ marginTop: 14 }}>
                {data[index].description}
              </Text>
            </View>
          </View>
        )}
      />
      <View
        style={{
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 14,
        }}
      >
        <View style={{ width: 71 }}></View>
        <Pagination.Basic
          progress={progress}
          data={data}
          dotStyle={{
            backgroundColor: theme.colors.grayLightAlpha[50],
            borderRadius: 50,
          }}
          activeDotStyle={{ backgroundColor: theme.colors.secondary }}
          containerStyle={{ gap: 4, marginTop: 10 }}
          onPress={onPressPagination}
          size={6}
        />
        <Button
          variant="primary"
          size="small"
          style={{ paddingVertical: 7, paddingHorizontal: 14 }}
          textStyle={{ fontSize: 10 }}
        >
          Pay Now
        </Button>
      </View>
    </View>
  );
}

export default AnnouncementCarousel;

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    backgroundColor: "white",
    marginTop: -50,
    height: "fit-content",
    paddingHorizontal: 8,
    paddingTop: 18,
    paddingBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  contentContainer: {
    flex: 1,
    marginLeft: 6,
    maxWidth: "90%",
  },
});
