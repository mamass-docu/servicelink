import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  find,
  get,
  loadingProcess,
  orderBy,
  where,
} from "../../../helpers/databaseHelper";
import ProfileImageScreen from "../../components/ProfileImage";
import { timestampToDateStringConverter } from "../../../helpers/DateTimeConverter";
import BusinessHours from "../../components/BusinessHours";
import Gallery from "../../components/Gallery";

const ViewShopScreen = ({ navigation, route }) => {
  // const { userId } = useAppContext();

  const { providerId } = route.params;

  const [activeTab, setActiveTab] = useState("services");
  const [shopInfo, setShopInfo] = useState({});
  const [services, setServices] = useState([]);

  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [ratings, setRatings] = useState(0);
  const [reviews, setReviews] = useState([]);

  const fetchServices = async () => {
    const snap = await get(
      "providerServices",
      where("providerId", "==", providerId)
    );
    let temp = [];
    for (const doc of snap.docs) {
      const data = doc.data();

      const bookSnap = await get(
        "bookings",
        where("providerId", "==", providerId),
        where("task", "==", data.task)
      );
      let ongoings = [];
      const personels = data.personels ?? 0;

      for (const booking of bookSnap.docs) {
        if (personels <= ongoings.length) break;
        const status = booking.data().status;

        if (
          status == "Declined" ||
          status == "Completed" ||
          status == "Pending" ||
          status == "Cancelled"
        )
          continue;
        ongoings.push(true);
      }

      for (let i = ongoings.length; i < personels; i++) ongoings.push(false);

      temp.push({ id: doc.id, ...data, ongoings: ongoings });
    }
    setServices(temp);
  };

  useEffect(() => {
    loadingProcess(async () => {
      const userSnap = await find("users", providerId);
      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      const rev = userData.reviews ?? 0;
      const rate = userData.ratingsTotal
        ? parseFloat(userData.ratingsTotal / rev).toFixed(1)
        : 0;
      setRatings(rate);
      setReviewsTotal(rev);
      setShopInfo({
        description: userData.description,
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        service: userData.service,
        name: userData.name,
        image: userData.image,
        email: userData.email,
      });
      await fetchServices();

      const reviewsSnap = await get(
        "ratings",
        where("providerId", "==", providerId),
        orderBy("ratedAt", "desc")
      );
      setReviews(
        reviewsSnap.docs.map((item) => {
          const data = item.data();
          return {
            id: item.id,
            ...data,
            ratedAt: timestampToDateStringConverter(data.ratedAt),
          };
        })
      );
    });
  }, []);

  const onBook = (service) => {
    if (!service.ongoings.some((ongoing) => !ongoing)) {
      alert(
        `Service ${
          service.personels && service.personels > 1
            ? "fully booked"
            : "is ongoing"
        }!!!`
      );
      return;
    }

    navigation.navigate("BookService", {
      provider: service,
    });
  };

  // Function to open location in maps app
  const openLocationInMaps = () => {
    navigation.navigate("LocationViewer", { address: shopInfo.address });
    // const { latitude, longitude, address } = shopInfo;

    // if (latitude && longitude) {
    //   // If we have coordinates, use them
    //   const url = Platform.select({
    //     ios: `maps:${latitude},${longitude}?q=${encodeURIComponent(shopInfo.name)}`,
    //     android: `geo:${latitude},${longitude}?q=${encodeURIComponent(shopInfo.name)}`,
    //   });
    //   Linking.openURL(url);
    // } else if (address) {
    //   // If we only have address, search for it
    //   const url = Platform.select({
    //     ios: `maps:0,0?q=${encodeURIComponent(address)}`,
    //     android: `geo:0,0?q=${encodeURIComponent(address)}`,
    //   });
    //   Linking.openURL(url);
    // } else {
    //   // Alert or handle case where no location data is available
    //   alert("Location information is not available for this shop");
    // }
  };

  // Review Card Component
  const ReviewCard = ({ review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <ProfileImageScreen
          image={review.ratedByImage}
          name={review.ratedBy}
          style={styles.reviewerAvatar}
        />
        {/* <Image source={{ uri: review.ratedByImage }} style={styles.reviewerAvatar} /> */}
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{review.ratedBy}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <Icon
                key={index}
                name="star"
                size={16}
                color={index < review.rating ? "#FFB800" : "#DDDDDD"}
              />
            ))}
          </View>
        </View>
        <Text style={styles.reviewDate}>{review.ratedAt}</Text>
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Shop Banner with Edit Button */}
        <View style={styles.bannerContainer}>
          <ProfileImageScreen
            image={shopInfo?.image}
            name={shopInfo?.name}
            style={styles.shopBanner}
          />
          {/* <View
            style={styles.editBannerButton}
            onPress={updateProfileImage}
          >
            <Icon
              name="camera"
              size={20}
              color="#FFFFFF"
              style={styles.cameraIcon}
            />
            <Text style={styles.editBannerText}>Change Shop Photo</Text>
          </View> */}
        </View>

        {/* Shop Info */}
        <View style={styles.shopInfoContainer}>
          <View style={styles.shopTitleContainer}>
            <Text style={styles.shopName}>{shopInfo?.name}</Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={openLocationInMaps}
            >
              <Icon name="map-marker" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.ratingContainer}>
            <Icon name="star" size={20} color="#FFB800" />
            <Text style={styles.ratingText}>{ratings}</Text>
            <Text style={styles.reviewCount}>({reviewsTotal} reviews)</Text>
          </View>

          <Text style={styles.description}>{shopInfo.description}</Text>

          {/* Contact Info */}
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Icon name="email" size={20} color="#666" />
              <Text style={styles.contactText}>{shopInfo?.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Icon name="phone" size={20} color="#666" />
              <Text style={styles.contactText}>{shopInfo.phoneNumber}</Text>
            </View>
            <View style={styles.contactItem}>
              <Icon name="map-marker" size={20} color="#666" />
              <Text style={styles.contactText}>{shopInfo.address}</Text>
            </View>
          </View>

          <BusinessHours providerId={providerId} />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "services" && styles.activeTab]}
            onPress={() => setActiveTab("services")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "services" && styles.activeTabText,
              ]}
            >
              Our Services
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "galleries" && styles.activeTab]}
            onPress={() => setActiveTab("galleries")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "galleries" && styles.activeTabText,
              ]}
            >
              Gallery
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "reviews" && styles.activeTab]}
            onPress={() => setActiveTab("reviews")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "reviews" && styles.activeTabText,
              ]}
            >
              Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {/* Services Tab Content */}
        {activeTab === "services" && (
          <View style={styles.servicesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Our Services</Text>
              {/* <TouchableOpacity
                style={styles.addButton}
                onPress={onAddServiceClick}
              >
                <Icon name="plus" size={20} color="#FFB800" />
                <Text style={styles.addButtonText}>Add Service</Text>
              </TouchableOpacity> */}
            </View>

            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <View key={service.id} style={styles.serviceCard}>
                  <ProfileImageScreen
                    image={shopInfo?.image}
                    name={shopInfo?.name}
                    style={styles.serviceImage}
                  />
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.task}</Text>
                    <Text style={styles.servicePrice}>₱{service.price}</Text>
                    <Text style={styles.serviceDescription} numberOfLines={2}>
                      {service.description}
                    </Text>
                    <Text style={styles.serviceDescription}>
                      {service.completionTime}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    {service.ongoings.map((ongoing, index) =>
                      ongoing ? (
                        <Icon
                          key={index}
                          style={{ color: "#FF0000", marginLeft: 2 }}
                          name={!ongoing ? "close-circle" : "block-helper"}
                          size={20}
                        />
                      ) : (
                        <View
                          key={index}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 20,
                            borderWidth: 2,
                            borderColor: "#FF0000",
                            marginLeft: 2,
                          }}
                        />
                      )
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => onBook(service)}
                    style={styles.viewButton}
                  >
                    <Text style={styles.viewButtonText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab == "galleries" && (
          <Gallery isProvider={false} providerId={providerId} />
        )}

        {/* Reviews Tab Content */}
        {activeTab === "reviews" && (
          <View style={styles.reviewsSection}>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    flex: 1,
    textAlign: "center",
  },
  bannerContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  shopBanner: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  editBannerButton: {
    position: "absolute",
    left: 16,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  cameraIcon: {
    marginRight: 6,
  },
  editBannerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  shopInfoContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  shopTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  shopName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    flex: 1,
  },
  mapButton: {
    backgroundColor: "#FFB800",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: "#666666",
  },
  description: {
    fontSize: 15,
    color: "#666666",
    lineHeight: 22,
    marginBottom: 16,
  },
  contactInfo: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 12,
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFB800",
  },
  tabText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFB800",
    fontWeight: "600",
  },
  servicesSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: "#FFB800",
    fontWeight: "600",
    marginLeft: 4,
  },
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  serviceInfo: {
    padding: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFB800",
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  serviceActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    marginLeft: 16,
  },
  viewButton: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  viewButtonText: {
    fontSize: 14,
    color: "#FFB800",
    fontWeight: "600",
  },
  reviewsSection: {
    padding: 20,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: "#666666",
  },
  reviewComment: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  addServiceButton: {
    backgroundColor: "#FFB800",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  addServiceButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ViewShopScreen;
