import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ProfileImageScreen from "../../components/ProfileImage";

const CustomerBookingDetailsScreen = ({ route, navigation }) => {
  const { booking } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Booking ID */}
        <View style={styles.bookingIdSection}>
          <Text style={styles.bookingIdLabel}>Booking ID:</Text>
          <Text style={styles.bookingIdText}>
            {booking?.bookingId || "N/A"}
          </Text>
        </View>

        {/* Provider Info */}
        <View style={styles.providerCard}>
          <ProfileImageScreen
            image={booking?.providerImage || "https://via.placeholder.com/40"}
            name={booking?.providerName}
            style={styles.providerImage}
          />
          <View>
            <Text style={styles.providerName}>
              {booking?.providerName || "Provider Name"}
            </Text>
            <Text style={styles.serviceType}>
              {booking?.service || "Service Type"}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.detailValue}>{booking?.status || "N/A"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{booking?.date || "N/A"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{booking?.time || "N/A"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{booking?.location || "N/A"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>₱{booking?.price || "0"}</Text>
          </View>
        </View>

        {/* Additional Notes */}
        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Additional Notes:</Text>
          <Text style={styles.noteText}>
            {booking?.note || "No notes provided."}
          </Text>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
  },
  bookingIdSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  bookingIdLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  bookingIdText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFB800",
  },
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  providerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  serviceType: {
    fontSize: 14,
    color: "#666666",
  },
  detailsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666666",
  },
  detailValue: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  noteSection: {
    padding: 16,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#666666",
  },
});

export default CustomerBookingDetailsScreen;
