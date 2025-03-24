import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2; // 2 columns with padding

const MoreServices = ({ navigation }) => {
  const services = [
    {
      id: 1,
      name: "Aircon",
      image:
        "https://cdn4.iconfinder.com/data/icons/summer-flat-26/512/summer_airconditioner-cooling-ac-cooler-summer-256.png",
      description: "AC repair & maintenance",
      type: "aircon",
    },
    {
      id: 2,
      name: "Car Repair",
      image:
        "https://cdn0.iconfinder.com/data/icons/lylac-car-repair/32/Verified-256.png",
      description: "Auto repair services",
      type: "car",
    },
    {
      id: 3,
      name: "Car Wash",
      image:
        "https://cdn3.iconfinder.com/data/icons/transportation-vol-1-18/512/car_wash_service_washing-512.png",
      description: "Car Washing",
      type: "carwash",
    },
    {
      id: 4,
      name: "Phone Repair",
      image:
        "https://cdn0.iconfinder.com/data/icons/mobile-app-development-soft-fill/60/Mobile-Repair-Manual-repairs-phone-256.png",
      description: "Mobile device repairs",
      type: "phone",
    },
    {
      id: 5,
      name: "House Keeping",
      image:
        "https://cdn2.iconfinder.com/data/icons/maids-and-cleaning-1/64/One_time_standard_cleaning-256.png",
      description: "Home cleaning services",
      type: "cleaning",
    },
    {
      id: 6,
      name: "Electrical",
      image:
        "https://cdn3.iconfinder.com/data/icons/hard-work-flat/512/electrical_panel-256.png",
      description: "Electrical repairs",
      type: "electrical",
    },
    {
      id: 7,
      name: "Laundry",
      image:
        "https://cdn4.iconfinder.com/data/icons/hotel-services-concept-1/64/laundry_washing_machin_clean_wash_-256.png",
      description: "Laundry & dry cleaning",
      type: "laundry",
    },
    {
      id: 8,
      name: "Massage",
      image:
        "https://cdn3.iconfinder.com/data/icons/spa-and-relax-4/64/scrub-spa-relax-massage-hand-256.png",
      description: "Professional massage",
      type: "massage",
    },
    {
      id: 9,
      name: "Plumbing",
      image:
        "https://cdn3.iconfinder.com/data/icons/interior-homedecor-vol-4/512/plumbing_water_pipe_drain-256.png",
      description: "Plumbing services",
      type: "plumbing",
    },
    {
      id: 10,
      name: "Watch Repair",
      image:
        "https://cdn0.iconfinder.com/data/icons/watch-repair-7/496/watch-repair-watchmaker-mechanic-open-256.png",
      description: "Watch maintenance",
      type: "watch",
    },
  ];

  const ServiceCard = ({ service, onPress }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => onPress(service)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Image
          source={{ uri: service.image }}
          style={styles.serviceIcon}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.serviceName}>{service.name}</Text>
      <Text style={styles.serviceDescription}>{service.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Our Services</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      {/* <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={24} color="#666" />
          <Text style={styles.searchPlaceholder}>Search services</Text>
        </View>
      </View> */}

      {/* Services Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onPress={() =>
                navigation.navigate("ProviderOption", {
                  service: service.name,
                })
              }
            />
          ))}
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
    color: "#999",
  },
  content: {
    flex: 1,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 16,
  },
  serviceCard: {
    width: cardWidth,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF9E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  serviceIcon: {
    width: 40,
    height: 40,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  serviceDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});

export default MoreServices;
