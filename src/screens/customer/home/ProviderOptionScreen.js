import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { get, loadingProcess, where } from "../../../helpers/databaseHelper";
import ProfileImageScreen from "../../components/ProfileImage";
import BusinessHours from "../../components/BusinessHours";

const ServiceDetailsModal = ({ visible, provider, onClose, onPress }) => {
  if (!provider) return null;

  const handleBookNow = () => {
    onClose();
    onPress();
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalContent}>
            <View style={modalStyles.modalHeader}>
              <TouchableOpacity
                onPress={onClose}
                style={modalStyles.backButton}
              >
                <Feather name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={modalStyles.headerTitle}>{provider.task}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={modalStyles.topHeader}>
                <Text style={modalStyles.totalText}>
                  Total: ₱{provider.price}
                </Text>
                <TouchableOpacity
                  style={modalStyles.addToCartButton}
                  onPress={handleBookNow}
                >
                  <Feather name="plus" size={20} color="#FFB800" />
                  <Text style={modalStyles.addToCartText}>Book Now</Text>
                </TouchableOpacity>
              </View>

              <ProfileImageScreen
                image={provider.image}
                name={provider.providerName}
                style={modalStyles.serviceImage}
                resizeMode="cover"
              />

              <View style={modalStyles.detailsContainer}>
                <Text style={modalStyles.serviceTitle}>
                  {provider.providerName}
                </Text>
                {/* <Text style={styles.warningText}>
                  ⚠️ Professional Aircon Service
                </Text> */}
                <Text style={modalStyles.price}>₱{provider.price}</Text>

                <View style={{ marginVertical: 5 }}>
                  <BusinessHours providerId={provider.providerId} />
                </View>
                {/* <Text style={modalStyles.discountPrice}>
                  ₱{provider.discountedPrice}
                </Text> */}
                {/* <Text style={modalStyles.estimatedTime}>
                  Estimated Time: {provider.estimatedTime}
                </Text> */}
                <Text style={modalStyles.description}>
                  {provider.description}
                </Text>
              </View>

              {/* <View style={modalStyles.sectionContainer}>
                <Text style={modalStyles.sectionTitle}>Services Included</Text>
                {provider.included.map((item, index) => (
                  <Text key={index} style={modalStyles.bulletPoint}>
                    • {item}
                  </Text>
                ))}
              </View>

              <View style={modalStyles.sectionContainer}>
                <Text style={modalStyles.sectionTitle}>Services Excluded</Text>
                {provider.excluded.map((item, index) => (
                  <Text key={index} style={modalStyles.bulletPoint}>
                    • {item}
                  </Text>
                ))}
              </View> */}

              <TouchableOpacity
                style={modalStyles.bottomAddToCartButton}
                onPress={handleBookNow}
              >
                <Text style={modalStyles.bottomAddToCartText}>Book Now</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* <Modal
        visible={showBookingModal}
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <BookServiceScreen
          route={{ params: { provider: provider } }}
          navigation={{
            goBack: () => setShowBookingModal(false),
            navigate: (screen) => {
              setShowBookingModal(false);
              navigation.navigate(screen);
            },
          }}
        />
      </Modal> */}
    </>
  );
};

const ServiceCard = ({ provider, onPress, navigation }) => (
  <TouchableOpacity
    style={styles.serviceCard}
    activeOpacity={0.9}
    onPress={() => onPress(provider)}
  >
    <View style={styles.cardContent}>
      <View style={styles.imageContainer}>
        <ProfileImageScreen
          image={provider.image}
          name={provider.providerName}
          style={styles.serviceImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.serviceTitle}>{provider.providerName}</Text>
        <Text style={styles.serviceTitle}>{provider.task}</Text>
        {/* <Text style={styles.estimatedTime}>⏱️ {provider.estimatedTime}</Text> */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₱{provider.price}</Text>
          <Text style={styles.perService}>/provider</Text>
        </View>
        {/* <View style={styles.discountContainer}>
          <Text style={styles.discountPrice}>₱{provider.discountedPrice}</Text>
          <Text style={styles.discountLabel}>Discounted</Text>
        </View> */}

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
          }}
          onPress={() => {
            navigation.navigate("Shop", {providerId: provider.providerId})
          }}
        >
          <Feather name="eye" size={20} color="#FFB800" />
          <Text style={modalStyles.addToCartText}>View Shop</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

export default function ProviderOptionScreen({ navigation, route }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { service } = route.params;

  useFocusEffect(
    useCallback(() => {
      loadingProcess(async () => {
        const snap = await get(
          "providerServices",
          where("service", "==", service)
        );

        // const snapshot = await getDocs(collection(db, "providerServices"));
        setProviders(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
    }, [])
  );

  useEffect(() => {
    if (searchQuery.trim() == "") setFilteredProviders(null);
    else
      setFilteredProviders(
        providers.filter(
          (provider) =>
            provider.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
            provider.providerName
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        )
      );
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{service} Providers</Text>
      </View>

      {/* <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View> */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.servicesGrid}>
          {(filteredProviders ?? providers).map((provider) => (
            <ServiceCard
              key={provider.id}
              provider={provider}
              navigation={navigation}
              onPress={(provider) => {
                setSelectedProvider(provider);
                setModalVisible(true);
              }}
            />
          ))}
        </View>
      </ScrollView>

      <ServiceDetailsModal
        visible={modalVisible}
        provider={selectedProvider}
        navigation={navigation}
        onClose={() => {
          setModalVisible(false);
          setSelectedProvider(null);
        }}
        onPress={() => {
          navigation.navigate("BookService", { provider: selectedProvider });
        }}
      />
    </SafeAreaView>
  );
}

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  addToCartText: {
    color: "#FFB800",
    marginLeft: 8,
    fontWeight: "500",
  },
  serviceImage: {
    width: "100%",
    height: 200,
  },
  detailsContainer: {
    padding: 16,
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  discountPrice: {
    fontSize: 16,
    color: "#FFB800",
    marginBottom: 8,
  },
  estimatedTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  sectionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  bottomAddToCartButton: {
    backgroundColor: "#FFB800",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  bottomAddToCartText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#333333",
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
  },
  servicesGrid: {
    padding: 16,
  },
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: "row",
  },
  imageContainer: {
    width: 120,
    height: 120,
    margin: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  serviceImage: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    flex: 1,
    padding: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  estimatedTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  perService: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFB800",
    marginRight: 4,
  },
  discountLabel: {
    fontSize: 12,
    color: "#666",
  },
  warningText: {
    fontSize: 14,
    color: "#FF4444",
    marginBottom: 8,
  },
});
