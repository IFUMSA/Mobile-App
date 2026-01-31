import * as React from "react";
import { Dimensions, StyleSheet, View, ActivityIndicator, Alert } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useTheme } from "@hooks/use-theme";
import { Text } from "@components/ui/Text";
import { Platform } from "react-native";
import { Button } from "@components/ui/button";
import { useRouter } from "expo-router";
import { useAnnouncements } from "@hooks/api/use-content";
import { useAnnualDuesMutation } from "@hooks/api/use-payment";

// Fallback data if API fails or returns empty
const fallbackData = [
  {
    id: 0,
    title: "Have You Paid Your Annual Dues?",
    description: "Why Pay Your Annual Dues?",
  },
  {
    id: 1,
    title: "Have Access to The Premium Features",
    description: "Unlock premium quiz features",
  },
  {
    id: 2,
    title: "Access to The IFUMSA Edu-Stipend Fund",
    description: "Supporting 100 medical students with 20,000 Naira each ",
  },
];
const width = Dimensions.get("window").width - 48;

function AnnouncementCarousel() {
  const { theme } = useTheme();
  const router = useRouter();
  const ref = React.useRef(null);
  const progress = useSharedValue(0);
  
  // Fetch announcements from API
  const { data: announcementsData, isLoading } = useAnnouncements();
  
  // Annual dues mutation
  const { mutate: createAnnualDues, isPending: isCreatingDues } = useAnnualDuesMutation({
    onSuccess: (data) => {
      // Navigate to bank transfer page with payment details
      router.push({
        pathname: '/payment/bank-transfer',
        params: { 
          paymentId: data.payment.id,
          reference: data.payment.reference,
          amount: data.payment.amount,
          title: data.payment.title,
        }
      });
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to create payment');
    },
  });
  
  // Use API data or fallback
  const data = React.useMemo(() => {
    if (announcementsData?.announcements?.length > 0) {
      return announcementsData.announcements.map((item, index) => ({
        id: item._id || index,
        title: item.title,
        description: item.description || '',
        link: item.link,
      }));
    }
    return fallbackData;
  }, [announcementsData]);

  const onPressPagination = (index) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const handlePayNow = () => {
    // Create annual dues payment and navigate to bank transfer
    createAnnualDues('bank');
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
          onPress={handlePayNow}
          loading={isCreatingDues}
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
