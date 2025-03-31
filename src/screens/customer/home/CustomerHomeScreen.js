import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAppContext } from "../../../../AppProvider";
import ProfileImageScreen from "../../components/ProfileImage";
import {
  get,
  getNotifCount,
  loadingProcess,
  where,
} from "../../../helpers/databaseHelper";

const { width } = Dimensions.get("window");

// Service Card Component
const ServiceCard = ({ id, title, imageUrl, onPress }) => (
  // <View key={id}>
  <TouchableOpacity style={styles.serviceCard} onPress={onPress}>
    <View style={styles.serviceIconContainer}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.serviceIcon}
        resizeMode="cover"
      />
    </View>
    <Text style={styles.serviceTitle}>{title}</Text>
  </TouchableOpacity>
  // </View>
);

// Provider Card Component
const ProviderCard = ({ provider, onPress }) => (
  // <View key={provider.id}>
  <TouchableOpacity style={styles.providerCard} onPress={onPress}>
    <ProfileImageScreen
      image={provider.image}
      name={provider.name}
      style={styles.providerImage}
      resizeMode="cover"
    />
    <View style={styles.providerInfo}>
      <Text style={styles.providerName}>{provider.name}</Text>
      <Text style={styles.providerService}>{provider.description}</Text>
      <View style={styles.ratingContainer}>
        <Feather name="star" size={14} color="#FFB800" />
        <Text style={styles.ratingText}>{provider.ratings}</Text>
        <Text style={styles.reviewCount}>({provider.reviews} reviews)</Text>
      </View>
    </View>
  </TouchableOpacity>
  // </View>
);

const CustomerHomeScreen = ({ navigation }) => {
  const [providers, setProviders] = useState([]);
  const [_hasNotif, setHasNotif] = useState(false);
  const { userName, userId, userImage } = useAppContext();

  // useFocusEffect(
  //   useCallback(() => {
  //     async function refresh() {
  //       try {
  //         const servicesSnapshot = await getDocs(collection(db, "services"));
  //         let services = [];

  //         for (const serviceDoc of servicesSnapshot.docs) {
  //           const serviceData = serviceDoc.data();
  //           const userRef = doc(db, "users", serviceData.providerId);
  //           const userSnap = await getDoc(userRef);

  //           services.push({
  //             id: serviceDoc.id,
  //             ...serviceData,
  //             name: userSnap.exists() ? userSnap.data().name : null,
  //           });
  //         }

  //         setProviders(services);
  //       } catch (error) {
  //         console.error("Error fetching services:", error);
  //       }
  //     }
  //     refresh();
  //   }, [])
  // );

  const services = [
    {
      title: "Plumbing",
      imageUrl:
        "https://cdn3.iconfinder.com/data/icons/plumbing-hazel-vol-1/256/Pipe-fixing-256.png",
    },
    {
      title: "Cleaning",
      imageUrl:
        "https://cdn2.iconfinder.com/data/icons/maids-and-cleaning-1/64/One_time_standard_cleaning-256.png",
    },
    {
      title: "Electrical",
      imageUrl: "https://img.icons8.com/color/96/electrical.png",
    },
    {
      title: "Aircon",
      imageUrl:
        "https://cdn4.iconfinder.com/data/icons/summer-flat-26/512/summer_airconditioner-cooling-ac-cooler-summer-256.png",
    },
    {
      title: "Auto Repair",
      imageUrl:
        "https://cdn2.iconfinder.com/data/icons/bzzricon-hobbies-and-free-time/512/24_Automotive-256.png",
    },
  ];

  const offers = [
    {
      id: 1,
      image:
        "https://img.freepik.com/free-vector/home-repair-service-banner-template_23-2148523577.jpg?w=740&t=st=1706695058~exp=1706695658~hmac=2c645c261c0a8f7bf7d3d8e0e421bc4e1add0f4f178677ad9d7c42e5ef6d4bfa",
    },
    {
      id: 2,
      image:
        "https://img.freepik.com/free-vector/plumber-service-banner-template_23-2148523578.jpg?w=740&t=st=1706695115~exp=1706695715~hmac=a9e9f77c8474008a597100aaa07a48d94085d93d0c35ebf5005de3801c5c575d",
    },
  ];

  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        const count = await getNotifCount(userId);
        setHasNotif(count > 0);

        const bookingSnap = await get(
          "bookings",
          where("status", "==", "Completed")
        );

        const ids = bookingSnap.docs.map((item) => item.data().providerId);
        const snap = await get("users", where("role", "==", "Provider"));

        let temp = [];
        snap.docs.forEach((item) => {
          if (!ids.includes(item.id)) return;

          const data = item.data();
          const reviews = data.reviews ?? 0;
          if (reviews == 0) return;

          const ratings = data.ratingsTotal
            ? parseFloat(data.ratingsTotal / reviews).toFixed(1)
            : 0;

          temp.push({
            id: item.id,
            image: data.image,
            name: data.name,
            description: data.description,
            ratings: ratings,
            reviews: reviews,
          });
        });

        if (temp.length == 0) return;

        temp = temp.sort((a, b) =>
          b.ratings === a.ratings
            ? b.reviews - a.reviews
            : b.ratings - a.ratings
        );
        if (temp.length > 3) temp = temp.slice(0, 3);
        setProviders(temp);
      });
    }, [])
  );

  const handleNotificationPress = () => {
    navigation.navigate("Notifications");
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar backgroundColor="#FFB800" barStyle="dark-content" />

      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.userInfoContainer}>
            <ProfileImageScreen
              image={userImage}
              name={userName}
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome!</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleNotificationPress}
            >
              <Feather name="bell" size={24} color="#FFF" />
              {_hasNotif && <View style={styles.notificationBadge} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar Container */}
        <TouchableOpacity
          style={styles.searchBarContainer}
          onPress={() => navigation.navigate("ServicesSearchResults")}
        >
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color="#666" />
            <Text style={styles.searchPlaceholder}>Search for Service's</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Services Grid */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Explore Our Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                imageUrl={service.imageUrl}
                onPress={() =>
                  navigation.navigate("ProviderOption", {
                    service: service.title,
                  })
                }
              />
            ))}
            <ServiceCard
              title="More"
              imageUrl="https://img.icons8.com/color/96/more.png"
              onPress={() => navigation.navigate("MoreServices")}
            />
          </View>
        </View>

        {/* Special Offers */}
        <View style={styles.offersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            {/* <TouchableOpacity onPress={() => navigation.navigate("AllOffers")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity> */}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offersScroll}
          >
            <TouchableOpacity
              style={styles.offerCard}
              onPress={() =>
                navigation.navigate("ProviderOption", { service: "Plumbing" })
              }
            >
              <Image
                source={require("../../../../assets/images/spo1.jpg")}
                style={styles.offerImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.offerCard}
              onPress={() =>
                navigation.navigate("ProviderOption", { service: "Cleaning" })
              }
            >
              <Image
                source={require("../../../../assets/images/spo2.jpg")}
                style={styles.offerImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Top Service Providers */}
        <View style={styles.providersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Service Providers</Text>
            {/* <TouchableOpacity
              onPress={() => navigation.navigate("AllProviders")}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity> */}
          </View>
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onPress={() =>
                navigation.navigate("Shop", { providerId: provider.id })
              }
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    backgroundColor: "#FFB800",
    paddingTop: Platform.OS === "android" ? 40 : 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  userInfo: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.9,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4444",
    borderWidth: 1,
    borderColor: "#FFF",
  },
  searchBarContainer: {
    backgroundColor: "#FFFFFF",
    margin: 15,
    marginTop: 5,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
  },
  searchPlaceholder: {
    flex: 1,
    color: "#666",
    marginLeft: 12,
    fontSize: 14,
  },
  scrollContent: {
    paddingTop: 10,
  },
  servicesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceCard: {
    width: (width - 60) / 3,
    aspectRatio: 1,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  serviceIcon: {
    width: "100%",
    height: "100%",
  },
  serviceTitle: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  offersSection: {
    marginVertical: 20,
    marginTop: -35,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  seeAllText: {
    fontSize: 14,
    color: "#FFB800",
    fontWeight: "500",
  },
  offersScroll: {
    paddingLeft: 20,
  },
  offerCard: {
    width: width - 80,
    height: 150,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    marginRight: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  offerImage: {
    width: "100%",
    height: "100%",
  },
  providersSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  providerCard: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  providerService: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
});

export default CustomerHomeScreen;
