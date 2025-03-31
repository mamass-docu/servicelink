import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAppContext } from "../../../../AppProvider";
import {
  add,
  find,
  get,
  loadingProcess,
  orderBy,
  remove,
  update,
  where,
} from "../../../helpers/databaseHelper";
import { selectImage } from "../../../helpers/ImageSelector";
// import { updateProviderUserImage } from "../../../db/UpdateUser";
import { uploadImage } from "../../../helpers/cloudinary";
import ProfileImageScreen from "../../components/ProfileImage";
import { timestampToDateStringConverter } from "../../../helpers/DateTimeConverter";
import { Feather } from "@expo/vector-icons";
import BusinessHours from "../../components/BusinessHours";
import Gallery from "../../components/Gallery";

const ViewShopScreen = ({ navigation }) => {
  const { userId, userName, userImage, userEmail, setUserImage } =
    useAppContext();

  const [activeTab, setActiveTab] = useState("services");
  const [showManageModal, setShowManageModal] = useState(false);
  // const [showEditService, setShowEditService] = useState(false);
  // const [editingService, setEditingService] = useState(null);

  const [shopInfo, setShopInfo] = useState({});

  const [newService, setNewService] = useState({
    id: null,
    name: null,
    price: null,
    // discountedPrice: null,
    description: null,
    completionTime: null,
    personels: null,
  });

  const [services, setServices] = useState([]);

  const [verified, setVerified] = useState(false);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [ratings, setRatings] = useState(0);
  const [reviews, setReviews] = useState([]);

  const fetchServices = async () => {
    const snap = await get(
      "providerServices",
      where("providerId", "==", userId)
    );
    setServices(
      snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          task: data.task,
          price: data.price,
          // discountedPrice: data.discountedPrice,
          description: data.description,
          image: data.image,
          personels: data.personels,
          completionTime: data.completionTime,
        };
      })
    );
  };

  useEffect(() => {
    loadingProcess(async () => {
      const userSnap = await find("users", userId);
      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      setVerified(userData.verified);
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
        where("providerId", "==", userId),
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

  const updateProfileImage = async () => {
    const image = await selectImage();
    if (!image) return;

    loadingProcess(
      async () => {
        const imgUrl = await uploadImage(image, userId);

        await update("users", userId, {
          image: imgUrl,
        });

        // updateProviderUserImage(userId, imgUrl);

        setUserImage(imgUrl);
        alert("Image uploaded successfully!");
      },
      (error) => alert(error)
    );
  };

  const handleAddService = () => {
    if (
      !newService.task ||
      !newService.price ||
      // !newService.discountedPrice ||
      !newService.description ||
      !newService.completionTime ||
      !newService.personels
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    loadingProcess(async () => {
      let serviceToAdd = {
        task: newService.task,
        service: shopInfo.service,
        price: parseInt(newService.price),
        // discountedPrice: parseInt(newService.discountedPrice),
        description: newService.description,
        providerId: userId,
        providerName: userName,
        personels: newService.personels,
        completionTime: newService.completionTime,
      };
      if (userImage) serviceToAdd.image = userImage;

      await add("providerServices", serviceToAdd);

      await fetchServices();

      Alert.alert("Success", "Service added successfully!");
      onCloseModal();
    });
  };

  const handleEditService = (service) => {
    setNewService({
      ...service,
      price: service.price + "",
      // discountedPrice: service.discountedPrice + "",
    });

    // setEditingService({
    //   ...service,
    //   price: service.price + "",
    //   discountedPrice: service.discountedPrice + "",
    // });
    setShowManageModal(true);
  };

  const handleChangeServiceImage = async (id) => {
    const image = await selectImage();
    if (!image) return;

    loadingProcess(async () => {
      const imageURL = await uploadImage(image, `${id}_service`);
      await update("providerServices", id, { image: imageURL });
      await fetchServices();
    });
  };

  const handleUpdateService = () => {
    if (
      !newService.task ||
      !newService.price ||
      // !newService.discountedPrice ||
      !newService.description ||
      !newService.completionTime ||
      !newService.personels
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    loadingProcess(async () => {
      const updatedService = {
        task: newService.task,
        price: parseInt(newService.price),
        // discountedPrice: parseInt(newService.discountedPrice),
        description: newService.description,
        personels: newService.personels,
        completionTime: newService.completionTime,
      };

      await update("providerServices", newService.id, updatedService);

      await fetchServices();

      Alert.alert("Success", "Service updated successfully!");
      onCloseModal();
    });
  };

  const handleDeleteService = (serviceId) => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to delete this service?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            loadingProcess(async () => {
              await remove("providerServices", serviceId);
              await fetchServices();
              Alert.alert("Success", "Service deleted successfully!");
            });
          },
        },
      ]
    );
  };

  const onCloseModal = () => {
    setShowManageModal(false);
    setNewService({
      id: null,
      // discountedPrice: null,
      name: null,
      price: null,
      description: null,
    });
  };

  const onAddServiceClick = () => {
    if (!verified) {
      Alert.alert("Error", "Your account is not yet verified!");
      return;
    }

    setShowManageModal(true);
  };

  const handleSaveModal = () => {
    if (newService.id) handleUpdateService();
    else handleAddService();
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
            image={userImage}
            name={userName}
            style={styles.shopBanner}
          />
          <TouchableOpacity
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
          </TouchableOpacity>
        </View>

        {/* Shop Info */}
        <View style={styles.shopInfoContainer}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              flexShrink: true,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.shopName}>{userName}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AddServices")}
              style={{
                paddingLeft: 15,
                paddingRight: 15,
                paddingVertical: 5,
                marginLeft: 10,
                borderRadius: 5,
                backgroundColor: "#FFB800",
                justifyContent: "center",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Feather name="edit" size={16} color="#fff" />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 5,
                  fontWeight: "500",
                  color: "#fff",
                }}
              >
                Edit
              </Text>
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
              <Text style={styles.contactText}>{userEmail}</Text>
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

          <BusinessHours providerId={userId} />
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
              <TouchableOpacity
                style={styles.addButton}
                onPress={onAddServiceClick}
              >
                <Icon name="plus" size={20} color="#FFB800" />
                <Text style={styles.addButtonText}>Add Service</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={{ position: "relative" }}>
                    <ProfileImageScreen
                      image={service.image}
                      name={userName}
                      style={styles.serviceImage}
                    />
                    <TouchableOpacity
                      style={styles.editBannerButton}
                      onPress={() => handleChangeServiceImage(service.id)}
                    >
                      <Icon
                        name="camera"
                        size={20}
                        color="#FFFFFF"
                        style={styles.cameraIcon}
                      />
                      <Text style={styles.editBannerText}>
                        Change This Photo
                      </Text>
                    </TouchableOpacity>
                  </View>

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
                  <View style={styles.serviceActions}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Icon name="account" size={25} />
                      <Text style={{ fontSize: 18, marginLeft: 5 }}>
                        {service.personels}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditService(service)}
                      >
                        <Icon name="pencil" size={20} color="#FFB800" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteService(service.id)}
                      >
                        <Icon name="delete" size={20} color="#FF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity> */}
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab == "galleries" && (
          <Gallery
            isProvider={true}
            providerId={userId}
            navigation={navigation}
          />
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

      {/* Add Service Modal */}
      <Modal visible={showManageModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {newService.id ? "Edit" : "Add New"} Service
              </Text>
              <TouchableOpacity onPress={onCloseModal}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Service Name"
              value={newService.task}
              onChangeText={(text) =>
                setNewService((prev) => ({ ...prev, task: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Price (₱)"
              value={newService.price}
              onChangeText={(text) =>
                setNewService((prev) => ({ ...prev, price: text }))
              }
              keyboardType="numeric"
            />
            {/* <TextInput
              style={styles.input}
              placeholder="Discounted Price (₱)"
              value={newService.discountedPrice}
              onChangeText={(text) =>
                setNewService((prev) => ({ ...prev, discountedPrice: text }))
              }
              keyboardType="numeric"
            /> */}
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={newService.description}
              onChangeText={(text) =>
                setNewService((prev) => ({ ...prev, description: text }))
              }
              multiline
              numberOfLines={4}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter time of completion"
              value={newService.completionTime}
              onChangeText={(text) =>
                setNewService((prev) => ({ ...prev, completionTime: text }))
              }
            />
            <TextInput
              keyboardType="numeric"
              style={styles.input}
              placeholder="Enter number of personels"
              value={newService.personels}
              onChangeText={(text) =>
                setNewService((prev) => ({ ...prev, personels: text }))
              }
            />

            <TouchableOpacity
              style={styles.addServiceButton}
              onPress={handleSaveModal}
            >
              <Text style={styles.addServiceButtonText}>
                {newService.id ? "Update" : "Add"} Service
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  shopName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    flex: 1,
    marginBottom: 8,
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
    justifyContent: "space-between",
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
